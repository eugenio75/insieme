import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, CalendarDays, PenLine, Heart, Utensils } from 'lucide-react';

const tabs = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/week', icon: CalendarDays, label: 'Settimana' },
  { path: '/checkin', icon: PenLine, label: 'Check-in' },
  { path: '/nutrition', icon: Utensils, label: 'Cibo' },
  { path: '/together', icon: Heart, label: 'Insieme' },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-border z-50">
      <div className="flex items-center justify-around h-20 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          // The "Respiro" button in the center
          if (tab.path === '/checkin') {
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative flex flex-col items-center justify-center -mt-4"
              >
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-soft">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-[10px] mt-1 btn-text text-primary">
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
                className={`w-5 h-5 transition-colors duration-300 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-[10px] btn-text transition-colors duration-300 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 w-8 h-0.5 rounded-full bg-primary"
                  transition={{ type: 'spring', duration: 0.5, bounce: 0.1 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
