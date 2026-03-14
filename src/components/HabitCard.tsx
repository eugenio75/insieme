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
        w-full flex items-center justify-between p-6 rounded-[32px] 
        transition-colors duration-500 border-[1.5px] shadow-card text-left
        ${completed 
          ? 'bg-accent border-transparent' 
          : 'bg-card border-border'}
      `}
    >
      <div className="flex items-center gap-4">
        <span className="text-2xl">{icon}</span>
        <span className={`text-base font-medium text-foreground ${completed ? 'line-through opacity-60' : ''}`}>
          {title}
        </span>
      </div>
      <div
        className={`
          w-8 h-8 rounded-full border-2 flex items-center justify-center
          transition-all duration-500
          ${completed 
            ? 'bg-primary border-primary' 
            : 'border-muted-foreground/30'}
        `}
      >
        {completed && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            width="16" height="16" viewBox="0 0 16 16" fill="none"
          >
            <path d="M3 8L7 12L13 4" stroke="hsl(0 0% 100%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
      </div>
    </motion.button>
  );
};

export default HabitCard;
