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

export interface Pattern {
  type: string;
  title: string;
  description: string;
  icon: string;
  correlation: number;
  actionTip: string;
}

export interface DietSuggestion {
  type: 'add' | 'reduce' | 'replace' | 'timing';
  category: string;
  suggestion: string;
  reason: string;
  priority: 'alta' | 'media' | 'bassa';
}

export interface PatternAnalysis {
  patterns: Pattern[];
  foodFindings: FoodFinding[];
  dietSuggestions: DietSuggestion[];
  confidence: string;
  dataPoints: number;
  message?: string;
  nextAnalysisIn?: number;
}

/**
 * Hook that fetches pattern analysis (cached per session).
 */
export const usePatternAnalysis = () => {
  const [analysis, setAnalysis] = useState<PatternAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { user } = useAuth();

  const load = async () => {
    if (!user || loaded) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pattern-analysis');
      if (error) throw error;
      setAnalysis(data);
    } catch (e) {
      console.error('Error fetching pattern analysis:', e);
      setAnalysis({ patterns: [], foodFindings: [], dietSuggestions: [], confidence: '', dataPoints: 0, message: 'Errore nel caricamento.' });
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  return { analysis, loading, load, loaded };
};

/**
 * Hook for food findings only (backward compatible).
 */
export const useFoodFindings = () => {
  const [findings, setFindings] = useState<FoodFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetch = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('pattern-analysis');
        if (error) throw error;
        if (data?.foodFindings) {
          setFindings(data.foodFindings.filter((f: FoodFinding) => f.correlation >= 0.4));
        } else if (data?.findings) {
          // Backward compat with old food-analysis
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

  const checkMeal = (title: string, description: string): FoodFinding | null => {
    const text = `${title} ${description}`.toLowerCase();
    for (const f of findings) {
      const foodLower = f.food.toLowerCase();
      if (text.includes(foodLower)) return f;
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
