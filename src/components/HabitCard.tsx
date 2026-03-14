import { motion } from 'framer-motion';

interface HabitCardProps {
  title: string;
  icon: string;
  completed: boolean;
  onToggle: () => void;
}

const HabitCard = ({ title, icon, completed, onToggle }: HabitCardProps) => {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onToggle}
      className={`
        w-full flex items-center justify-between p-5 rounded-2xl 
        transition-all duration-500 border text-left group
        ${completed 
          ? 'glass glass-border border-primary/20 shadow-glow' 
          : 'glass glass-border hover:border-primary/20'}
      `}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
          completed ? 'bg-primary/20' : 'bg-muted'
        }`}>
          <span className="text-xl">{icon}</span>
        </div>
        <span className={`text-sm font-medium text-foreground transition-opacity duration-500 ${completed ? 'opacity-50 line-through' : ''}`}>
          {title}
        </span>
      </div>
      <div
        className={`
          w-7 h-7 rounded-lg border-2 flex items-center justify-center
          transition-all duration-500
          ${completed 
            ? 'gradient-primary border-transparent shadow-glow' 
            : 'border-muted-foreground/20 group-hover:border-primary/40'}
        `}
      >
        {completed && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            width="14" height="14" viewBox="0 0 16 16" fill="none"
          >
            <path d="M3 8L7 12L13 4" stroke="hsl(var(--primary-foreground))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
      </div>
    </motion.button>
  );
};

export default HabitCard;
