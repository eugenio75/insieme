import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface HouseholdConnection {
  id: string;
  from_user_id: string;
  to_user_id: string | null;
  to_email: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  partner_name?: string;
}

export const useHousehold = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<HouseholdConnection[]>([]);
  const [pendingIncoming, setPendingIncoming] = useState<HouseholdConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConnections = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userEmail = user.email?.toLowerCase() || '';

      // Fetch connections where I'm the sender, receiver, or matched by email
      const { data } = await supabase
        .from('household_connections')
        .select('*')
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id},to_email.eq.${userEmail}`) as any;

      if (data) {
        // Enrich with partner names
        const enriched: HouseholdConnection[] = [];
        for (const conn of data) {
          const partnerId = conn.from_user_id === user.id ? conn.to_user_id : conn.from_user_id;
          let partnerName = conn.to_email;
          if (partnerId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name')
              .eq('user_id', partnerId)
              .single();
            if (profile?.name) partnerName = profile.name;
          }
          enriched.push({ ...conn, partner_name: partnerName });
        }

        setConnections(enriched.filter(c => c.status === 'accepted'));
        // Pending incoming: either to_user_id matches me, or to_email matches my email (and I'm not the sender)
        setPendingIncoming(enriched.filter(c => 
          c.status === 'pending' && 
          c.from_user_id !== user.id &&
          (c.to_user_id === user.id || c.to_email === userEmail)
        ));
      }
    } catch (e) {
      console.error('Error loading household connections:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const sendRequest = async (email: string) => {
    if (!user) return false;
    
    // Find user by email
    // We look in profiles via auth - since we can't query auth.users,
    // we check if there's a pending/accepted connection already
    const { data: existing } = await supabase
      .from('household_connections')
      .select('id, status')
      .eq('from_user_id', user.id)
      .eq('to_email', email.toLowerCase()) as any;

    if (existing && existing.length > 0) {
      const status = existing[0].status;
      if (status === 'accepted') {
        toast({ title: 'Già collegati', description: 'Siete già collegati come conviventi.' });
        return false;
      }
      if (status === 'pending') {
        toast({ title: 'Richiesta già inviata', description: 'Hai già inviato una richiesta a questa persona.' });
        return false;
      }
    }

    // Insert connection request — to_user_id will be resolved when accepted
    const { error } = await supabase
      .from('household_connections')
      .insert({
        from_user_id: user.id,
        to_email: email.toLowerCase(),
        status: 'pending',
      } as any);

    if (error) {
      toast({ title: 'Errore', description: 'Non siamo riusciti a inviare la richiesta.', variant: 'destructive' });
      return false;
    }

    toast({
      title: '💌 Richiesta inviata',
      description: 'Quando verrà accettata, l\'AI potrà aiutarvi a organizzarvi meglio.',
    });
    await loadConnections();
    return true;
  };

  const acceptRequest = async (connectionId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('household_connections')
      .update({
        to_user_id: user.id,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      } as any)
      .eq('id', connectionId);

    if (!error) {
      toast({
        title: '🏠 Collegamento attivo!',
        description: 'L\'AI terrà conto della vostra convivenza per proporre pasti più compatibili.',
      });
      await loadConnections();
    }
  };

  const declineRequest = async (connectionId: string) => {
    if (!user) return;
    await supabase
      .from('household_connections')
      .update({ status: 'declined' } as any)
      .eq('id', connectionId);
    await loadConnections();
  };

  const removeConnection = async (connectionId: string) => {
    if (!user) return;
    await supabase
      .from('household_connections')
      .delete()
      .eq('id', connectionId);
    toast({ title: 'Collegamento rimosso' });
    await loadConnections();
  };

  return {
    connections,
    pendingIncoming,
    loading,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeConnection,
    reload: loadConnections,
  };
};
