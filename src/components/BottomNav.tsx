import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, PenLine, Heart, Utensils, BarChart3 } from 'lucide-react';

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

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center justify-center gap-1 py-2 px-3 relative"
              >
                <Icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive ? 'text-primary scale-110' : 'text-muted-foreground'
                  }`}
                />
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
