/**
 * Auto-adaptation logic.
 * Analyzes weekly check-in trends and suggests/applies adjustments
 * to habits and nutrition based on how the user is progressing.
 */

export interface Adjustment {
  type: 'habit' | 'nutrition' | 'general';
  icon: string;
  title: string;
  description: string;
  applied: boolean;
}

interface WeeklyData {
  week_number: number;
  weight: number | null;
  bloating: number;
  energy: number;
}

/**
 * Compares last 2 weeks of data and generates adjustments.
 */
export const analyzeProgress = (
  data: WeeklyData[],
  objective: string,
): Adjustment[] => {
  if (data.length < 2) return [];

  const sorted = [...data].sort((a, b) => a.week_number - b.week_number);
  const current = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];

  const adjustments: Adjustment[] = [];

  // --- Bloating analysis ---
  if (current.bloating >= 4 && previous.bloating >= 4) {
    adjustments.push({
      type: 'nutrition',
      icon: '🫧',
      title: 'Gonfiore persistente',
      description: 'Il gonfiore non migliora. Questa settimana proviamo a ridurre latticini e legumi la sera, e ad aumentare l\'idratazione.',
      applied: true,
    });
  } else if (current.bloating > previous.bloating) {
    adjustments.push({
      type: 'nutrition',
      icon: '💨',
      title: 'Gonfiore in aumento',
      description: 'Il gonfiore è salito rispetto alla settimana scorsa. Prova a mangiare più lentamente e a evitare verdure crude la sera.',
      applied: false,
    });
  } else if (current.bloating < previous.bloating) {
    adjustments.push({
      type: 'general',
      icon: '✨',
      title: 'Gonfiore in miglioramento!',
      description: 'Stai facendo progressi sul gonfiore. Continua così!',
      applied: false,
    });
  }

  // --- Energy analysis ---
  if (current.energy <= 2 && previous.energy <= 2) {
    adjustments.push({
      type: 'nutrition',
      icon: '🔋',
      title: 'Energia bassa persistente',
      description: 'L\'energia resta bassa. Questa settimana aggiungiamo proteine a colazione e uno spuntino energetico a metà mattina.',
      applied: true,
    });
  } else if (current.energy < previous.energy) {
    adjustments.push({
      type: 'habit',
      icon: '⚡',
      title: 'Calo di energia',
      description: 'L\'energia è calata. Prova a dormire 30 minuti prima e a fare una passeggiata dopo pranzo.',
      applied: false,
    });
  } else if (current.energy > previous.energy) {
    adjustments.push({
      type: 'general',
      icon: '🌟',
      title: 'Energia in crescita!',
      description: 'La tua energia migliora. Il percorso sta funzionando!',
      applied: false,
    });
  }

  // --- Weight analysis (if tracked) ---
  if (current.weight !== null && previous.weight !== null) {
    const diff = current.weight - previous.weight;
    const lower = objective.toLowerCase();
    const wantsWeightLoss = lower.includes('peso') || lower.includes('legger') || lower.includes('sgonfi');

    if (wantsWeightLoss && diff > 0.5) {
      adjustments.push({
        type: 'nutrition',
        icon: '⚖️',
        title: 'Peso in leggero aumento',
        description: 'Il peso è salito leggermente. Niente panico — questa settimana proviamo porzioni un po\' più piccole la sera e più verdure a pranzo.',
        applied: true,
      });
    } else if (wantsWeightLoss && diff < -0.3) {
      adjustments.push({
        type: 'general',
        icon: '🎉',
        title: 'Ottimo progresso sul peso!',
        description: `Hai perso ${Math.abs(diff).toFixed(1)} kg questa settimana. Continua con costanza!`,
        applied: false,
      });
    } else if (!wantsWeightLoss && Math.abs(diff) < 0.3) {
      adjustments.push({
        type: 'general',
        icon: '⚖️',
        title: 'Peso stabile',
        description: 'Il tuo peso è stabile. Tutto nella norma.',
        applied: false,
      });
    }
  }

  // If everything is improving, celebrate
  if (adjustments.every(a => a.type === 'general')) {
    adjustments.unshift({
      type: 'general',
      icon: '🌺',
      title: 'Tutto procede bene!',
      description: 'I tuoi dati mostrano miglioramenti. Il percorso che stai seguendo funziona, continua così.',
      applied: false,
    });
  }

  return adjustments;
};

/**
 * Gets habit adjustment suggestions based on trends.
 * Returns modified habit titles if adaptation is needed.
 */
export const getHabitAdjustments = (
  data: WeeklyData[],
): { extraHydration: boolean; moreMovement: boolean; lighterDinner: boolean } => {
  if (data.length < 2) return { extraHydration: false, moreMovement: false, lighterDinner: false };

  const sorted = [...data].sort((a, b) => a.week_number - b.week_number);
  const current = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];

  return {
    extraHydration: current.bloating >= 3 && previous.bloating >= 3,
    moreMovement: current.energy <= 2,
    lighterDinner: current.bloating >= 4,
  };
};
