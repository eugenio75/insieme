import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, ArrowLeft } from 'lucide-react';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
}

const AppHeader = ({ title, showBack }: AppHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isProfile = location.pathname === '/profile';

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
            className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
