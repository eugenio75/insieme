import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Partner {
  id: string;
  user_id: string;
  partner_id: string;
  name: string;
  current_streak: number | null;
}

interface Invite {
  id: string;
  invite_code: string;
  from_user_id: string;
  accepted_by: string | null;
  created_at: string;
}

export const useTogether = () => {
  const { user } = useAuth();
  const [supporters, setSupporters] = useState<Partner[]>([]);
  const [supporting, setSupporting] = useState<Partner[]>([]);
  const [myInvites, setMyInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    // Get partnerships where I'm the user (they support me)
    const { data: supportersData } = await supabase
      .from('partnerships')
      .select('*')
      .eq('user_id', user.id);

    // Get partnerships where I'm the partner (I support them)
    const { data: supportingData } = await supabase
      .from('partnerships')
      .select('*')
      .eq('partner_id', user.id);

    // Fetch profile names for supporters
    const supporterIds = (supportersData || []).map(p => p.partner_id);
    const supportingIds = (supportingData || []).map(p => p.user_id);
    const allIds = [...new Set([...supporterIds, ...supportingIds])];

    let profileMap: Record<string, { name: string; current_streak: number | null }> = {};
    if (allIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, current_streak')
        .in('user_id', allIds);
      if (profiles) {
        profiles.forEach(p => { profileMap[p.user_id] = { name: p.name, current_streak: p.current_streak }; });
      }
    }

    setSupporters((supportersData || []).map(p => ({
      ...p,
      name: profileMap[p.partner_id]?.name || 'Utente',
      current_streak: profileMap[p.partner_id]?.current_streak || null,
    })));

    setSupporting((supportingData || []).map(p => ({
      ...p,
      name: profileMap[p.user_id]?.name || 'Utente',
      current_streak: profileMap[p.user_id]?.current_streak || null,
    })));

    // Get my invites
    const { data: invites } = await supabase
      .from('invites')
      .select('*')
      .eq('from_user_id', user.id)
      .order('created_at', { ascending: false });

    setMyInvites(invites || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const createInvite = async () => {
    if (!user) return null;
    const code = `${user.id.slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const { data, error } = await supabase
      .from('invites')
      .insert({ from_user_id: user.id, invite_code: code })
      .select()
      .single();
    if (data) {
      setMyInvites(prev => [data, ...prev]);
    }
    return data;
  };

  const acceptInvite = async (code: string) => {
    if (!user) return { success: false, error: 'Non autenticato' };

    // Find invite
    const { data: invite } = await supabase
      .from('invites')
      .select('*')
      .eq('invite_code', code.trim().toUpperCase())
      .is('accepted_by', null)
      .single();

    if (!invite) return { success: false, error: 'Codice non valido o già utilizzato' };
    if (invite.from_user_id === user.id) return { success: false, error: 'Non puoi accettare il tuo stesso invito' };

    // Check max 3 supporters for the inviter
    const { count } = await supabase
      .from('partnerships')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', invite.from_user_id);

    if ((count || 0) >= 3) return { success: false, error: 'Questa persona ha già raggiunto il limite di 3 supporter' };

    // Accept invite
    await supabase
      .from('invites')
      .update({ accepted_by: user.id })
      .eq('id', invite.id);

    // Create partnership (inviter is user, accepter is partner/supporter)
    await supabase
      .from('partnerships')
      .insert({ user_id: invite.from_user_id, partner_id: user.id });

    await load();
    return { success: true, error: null };
  };

  const sendBadge = async (toUserId: string, badgeType: string) => {
    if (!user) return;
    await supabase.from('badges').insert({
      from_user_id: user.id,
      to_user_id: toUserId,
      badge_type: badgeType,
    });
  };

  const getReceivedBadges = async () => {
    if (!user) return [];
    const { data } = await supabase
      .from('badges')
      .select('*')
      .eq('to_user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    return data || [];
  };

  const sendSOS = async (message?: string) => {
    if (!user) return { success: false, error: 'Non autenticato' };

    // Check 4h cooldown
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from('badges')
      .select('id')
      .eq('from_user_id', user.id)
      .like('badge_type', 'SOS:%')
      .gte('created_at', fourHoursAgo)
      .limit(1);

    if (recent && recent.length > 0) {
      return { success: false, error: 'Puoi inviare una richiesta SOS ogni 4 ore' };
    }

    // Send SOS to all supporters
    const badgeType = message?.trim() ? `SOS:${message.trim()}` : 'SOS:Ho bisogno di supporto';

    const inserts = supporters.map(s => ({
      from_user_id: user.id,
      to_user_id: s.partner_id,
      badge_type: badgeType,
    }));

    if (inserts.length === 0) {
      return { success: false, error: 'Non hai ancora supporter a cui inviare la richiesta' };
    }

    await supabase.from('badges').insert(inserts);
    return { success: true, error: null };
  };

  return {
    supporters,
    supporting,
    myInvites,
    loading,
    createInvite,
    acceptInvite,
    sendBadge,
    getReceivedBadges,
    sendSOS,
    reload: load,
  };
};
