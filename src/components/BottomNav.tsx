import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, PenLine, Heart, Utensils, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const tabs = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/nutrition', icon: Utensils, label: 'Cibo' },
  { path: '/checkin', icon: PenLine, label: 'Check-in' },
  { path: '/progress', icon: BarChart3, label: 'Risultati' },
  { path: '/together', icon: Heart, label: 'Insieme' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [badgeCount, setBadgeCount] = useState(0);

  // Check for recent unread badges (last 24h)
  useEffect(() => {
    if (!user) return;
    const checkBadges = async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('badges')
        .select('*', { count: 'exact', head: true })
        .eq('to_user_id', user.id)
        .gte('created_at', since);
      setBadgeCount(count || 0);
    };
    checkBadges();

    // Subscribe to new badges in realtime
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

  // Reset count when visiting together page
  useEffect(() => {
    if (location.pathname === '/together') {
      setBadgeCount(0);
    }
  }, [location.pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="glass glass-border border-t-0 rounded-t-3xl mx-2 mb-0">
        <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-2">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;

            if (tab.path === '/checkin') {
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className="relative flex flex-col items-center justify-center -mt-6"
                >
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-[10px] mt-1.5 font-semibold text-primary">
                    {tab.label}
                  </span>
                </button>
              );
            }

            const showBadge = tab.path === '/together' && badgeCount > 0 && !isActive;

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center justify-center gap-1 py-2 px-3 relative"
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive ? 'text-primary scale-110' : 'text-muted-foreground'
                    }`}
                  />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {badgeCount}
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
