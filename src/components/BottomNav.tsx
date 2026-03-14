import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Heart, Utensils, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const tabs = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/nutrition', icon: Utensils, label: 'Cibo' },
  { path: '/progress', icon: BarChart3, label: 'Risultati' },
  { path: '/together', icon: Heart, label: 'Insieme' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [badgeCount, setBadgeCount] = useState(0);
  const [hasSOS, setHasSOS] = useState(false);

  useEffect(() => {
    if (!user) return;
    const checkBadges = async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('badges')
        .select('badge_type, created_at')
        .eq('to_user_id', user.id)
        .gte('created_at', since);
      setBadgeCount(data?.length || 0);
      setHasSOS(data?.some(b => b.badge_type?.startsWith('SOS:')) || false);
    };
    checkBadges();

    const channel = supabase
      .channel('badge-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'badges',
        filter: `to_user_id=eq.${user.id}`,
      }, () => {
        checkBadges();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    if (location.pathname === '/together') {
      setBadgeCount(0);
    }
  }, [location.pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="glass glass-border border-t-0 rounded-t-3xl mx-2 mb-0">
        <div className="flex items-center justify-around h-18 max-w-lg mx-auto px-4">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            const showBadge = tab.path === '/together' && badgeCount > 0 && !isActive;

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center justify-center gap-1 py-3 px-4 relative"
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive ? 'text-primary scale-110' : 'text-muted-foreground'
                    }`}
                  />
                  {showBadge && (
                    <span className={`absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse ${
                      hasSOS ? 'bg-destructive text-destructive-foreground ring-2 ring-destructive/30' : 'bg-destructive text-destructive-foreground'
                    }`}>
                      {hasSOS ? '🆘' : badgeCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold transition-colors duration-300 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 w-6 h-1 rounded-full gradient-primary"
                    transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
