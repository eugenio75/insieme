import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
}

const AppHeader = ({ title, showBack }: AppHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isProfile = location.pathname === '/profile';
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user || isProfile) { setPendingCount(0); return; }
    const userEmail = user.email?.toLowerCase() || '';
    
    const checkPending = async () => {
      const { data } = await supabase
        .from('household_connections')
        .select('id, from_user_id, to_user_id, to_email, status')
        .eq('status', 'pending')
        .or(`to_user_id.eq.${user.id},to_email.eq.${userEmail}`) as any;
      
      const count = (data || []).filter((c: any) => c.from_user_id !== user.id).length;
      setPendingCount(count);
    };
    checkPending();

    const channel = supabase
      .channel('household-notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'household_connections',
      }, () => { checkPending(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, isProfile]);

  // Clear badge when visiting profile
  useEffect(() => {
    if (isProfile) setPendingCount(0);
  }, [isProfile]);

  return (
    <header className="flex items-center justify-between h-12 mb-2">
      <div className="w-10">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
      </div>
      {title && (
        <h2 className="font-display text-base text-foreground">{title}</h2>
      )}
      <div className="w-10">
        {!isProfile && (
          <button
            onClick={() => navigate('/profile')}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Settings className="w-5 h-5" />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
