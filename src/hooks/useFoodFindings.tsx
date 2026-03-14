import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface FoodFinding {
  food: string;
  issue: string;
  correlation: number;
  description: string;
  icon: string;
}

/**
 * Hook that fetches food analysis findings (cached per session).
 * Returns problematic foods that should be flagged in the meal plan.
 */
export const useFoodFindings = () => {
  const [findings, setFindings] = useState<FoodFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetch = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('food-analysis');
        if (error) throw error;
        if (data?.findings) {
          // Only keep findings with moderate+ correlation
          setFindings(data.findings.filter((f: FoodFinding) => f.correlation >= 0.4));
        }
      } catch (e) {
        console.error('Error fetching food findings:', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  /**
   * Check if a meal title or description contains a problematic food.
   * Returns the finding if found, null otherwise.
   */
  const checkMeal = (title: string, description: string): FoodFinding | null => {
    const text = `${title} ${description}`.toLowerCase();
    for (const f of findings) {
      const foodLower = f.food.toLowerCase();
      if (text.includes(foodLower)) return f;
      // Also check common aliases
      const aliases: Record<string, string[]> = {
        'latticini': ['yogurt', 'formaggio', 'parmigiano', 'mozzarella', 'latte', 'ricotta', 'pecorino', 'burro'],
        'pane': ['pane', 'panino', 'fette biscottate'],
        'pasta': ['pasta', 'spaghetti', 'penne', 'rigatoni'],
        'legumi': ['fagioli', 'lenticchie', 'ceci', 'piselli', 'fave'],
        'cibi fritti': ['fritto', 'frittura', 'fritti'],
        'bevande gassate': ['gassata', 'coca', 'sprite', 'aranciata'],
        'caffè': ['caffè', 'espresso', 'cappuccino'],
      };
      const foodAliases = aliases[foodLower] || [];
      if (foodAliases.some(a => text.includes(a))) return f;
    }
    return null;
  };

  return { findings, loading, checkMeal };
};
