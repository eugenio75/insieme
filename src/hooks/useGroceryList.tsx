import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string | null;
  category: string;
  checked: boolean;
  is_manual: boolean;
}

export interface GroceryCategory {
  name: string;
  emoji: string;
  items: GroceryItem[];
}

export const useGroceryList = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [categories, setCategories] = useState<GroceryCategory[]>([]);
  const [listId, setListId] = useState<string | null>(null);
  const [tips, setTips] = useState<string[]>([]);

  const categoryEmojis: Record<string, string> = {
    'Verdure': '🥬',
    'Frutta': '🍎',
    'Proteine': '🥩',
    'Latticini e alternative': '🧀',
    'Cereali e pane': '🍞',
    'Dispensa': '🫙',
    'Extra': '✨',
    'Altro': '📦',
  };

  // Load existing list
  const loadList = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Get latest list
      const { data: lists } = await supabase
        .from('grocery_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1) as any;

      if (lists && lists.length > 0) {
        const list = lists[0];
        setListId(list.id);

        // Get items
        const { data: items } = await supabase
          .from('grocery_items')
          .select('*')
          .eq('list_id', list.id)
          .order('created_at', { ascending: true }) as any;

        if (items) {
          // Group by category
          const grouped: Record<string, GroceryItem[]> = {};
          items.forEach((item: any) => {
            if (!grouped[item.category]) grouped[item.category] = [];
            grouped[item.category].push(item);
          });

          const cats: GroceryCategory[] = Object.entries(grouped).map(([name, items]) => ({
            name,
            emoji: categoryEmojis[name] || '📦',
            items,
          }));

          // Sort categories in a nice order
          const order = ['Verdure', 'Frutta', 'Proteine', 'Latticini e alternative', 'Cereali e pane', 'Dispensa', 'Extra', 'Altro'];
          cats.sort((a, b) => {
            const ai = order.indexOf(a.name);
            const bi = order.indexOf(b.name);
            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
          });

          setCategories(cats);
        }
      }
    } catch (e) {
      console.error('Error loading grocery list:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  // Generate new list
  const generateList = async (mealPlan: any[]) => {
    if (!user) return;
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-grocery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ mealPlan }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Errore nella generazione');
      }

      const data = await resp.json();
      setListId(data.list_id);
      setTips(data.tips || []);

      // Reload from DB
      await loadList();
      
      toast({
        title: '🛒 Spesa pronta!',
        description: 'La tua lista della spesa è stata generata.',
      });
    } catch (e: any) {
      console.error('Error generating grocery list:', e);
      toast({
        title: 'Errore',
        description: e.message || 'Non siamo riusciti a generare la spesa.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  // Toggle item checked
  const toggleItem = async (itemId: string) => {
    setCategories(prev =>
      prev.map(cat => ({
        ...cat,
        items: cat.items.map(item =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        ),
      }))
    );

    await supabase
      .from('grocery_items')
      .update({ checked: categories.flatMap(c => c.items).find(i => i.id === itemId)?.checked ? false : true } as any)
      .eq('id', itemId);
  };

  // Add manual item
  const addItem = async (name: string, category: string = 'Altro', quantity?: string) => {
    if (!listId || !user) return;

    const { data, error } = await supabase
      .from('grocery_items')
      .insert({
        list_id: listId,
        user_id: user.id,
        name,
        quantity: quantity || null,
        category,
        checked: false,
        is_manual: true,
      } as any)
      .select()
      .single() as any;

    if (data && !error) {
      await loadList();
    }
  };

  // Delete item
  const deleteItem = async (itemId: string) => {
    setCategories(prev =>
      prev.map(cat => ({
        ...cat,
        items: cat.items.filter(item => item.id !== itemId),
      })).filter(cat => cat.items.length > 0)
    );

    await supabase
      .from('grocery_items')
      .delete()
      .eq('id', itemId);
  };

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);
  const checkedItems = categories.reduce((s, c) => s + c.items.filter(i => i.checked).length, 0);

  return {
    categories,
    listId,
    loading,
    generating,
    tips,
    totalItems,
    checkedItems,
    generateList,
    toggleItem,
    addItem,
    deleteItem,
    reload: loadList,
  };
};
