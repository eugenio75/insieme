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

export interface DietAdaptation {
  reducePortions: boolean;
  lighterDinners: boolean;
  moreProtein: boolean;
  lessCarbsDinner: boolean;
  moreVegetables: boolean;
  moreHydration: boolean;
  weeklyTrend: 'improving' | 'stalling' | 'worsening' | 'neutral';
  summary: string;
}

interface WeeklyData {
  week_number: number;
  weight: number | null;
  bloating: number;
  energy: number;
}

/**
 * Groups weekly data into 2-week (biweekly) periods and averages them.
 */
const groupBiweekly = (data: WeeklyData[]): { weight: number | null; bloating: number; energy: number }[] => {
  const sorted = [...data].sort((a, b) => a.week_number - b.week_number);
  const periods: { weight: number | null; bloating: number; energy: number }[] = [];

  for (let i = 0; i < sorted.length; i += 2) {
    const chunk = sorted.slice(i, i + 2);
    const weights = chunk.filter(c => c.weight !== null).map(c => c.weight!);
    periods.push({
      weight: weights.length > 0 ? weights[weights.length - 1] : null, // use latest weight in the period
      bloating: Math.round(chunk.reduce((s, c) => s + c.bloating, 0) / chunk.length),
      energy: Math.round(chunk.reduce((s, c) => s + c.energy, 0) / chunk.length),
    });
  }
  return periods;
};

/**
 * Compares last 2 weeks of data and generates adjustments.
 */
export const analyzeProgress = (
  data: WeeklyData[],
  objective: string,
): Adjustment[] => {
  if (data.length < 2) return [];

  const periods = groupBiweekly(data);
  if (periods.length < 2) return [];

  const current = periods[periods.length - 1];
  const previous = periods[periods.length - 2];

  const adjustments: Adjustment[] = [];
  const lower = objective.toLowerCase();
  const wantsWeightLoss = lower.includes('peso') || lower.includes('legger') || lower.includes('sgonfi') || lower.includes('dimagr');

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
    const weeksOfData = sorted.length;

    if (wantsWeightLoss) {
      if (diff > 0.5) {
        adjustments.push({
          type: 'nutrition',
          icon: '⚖️',
          title: 'Peso in aumento — adattiamo il piano',
          description: `Hai preso ${diff.toFixed(1)} kg nelle ultime 2 settimane. Il piano alimentare verrà reso più leggero: porzioni ridotte a cena, meno carboidrati serali e più verdure.`,
          applied: true,
        });
      } else if (diff >= 0 && diff <= 0.5 && weeksOfData >= 3) {
        // Stalling — weight not moving for multiple weeks
        const thirdLast = sorted[sorted.length - 3];
        const longTermDiff = thirdLast.weight !== null ? current.weight - thirdLast.weight : null;
        if (longTermDiff !== null && longTermDiff >= 0) {
          adjustments.push({
            type: 'nutrition',
            icon: '📉',
            title: 'Peso fermo — serve un cambio',
            description: 'Il peso non scende da più settimane. Questa settimana il piano sarà più strutturato: porzioni calibrate, cene leggere a base di proteine e verdure, e spuntini ridotti.',
            applied: true,
          });
        }
      } else if (diff < -0.3) {
        adjustments.push({
          type: 'general',
          icon: '🎉',
          title: 'Ottimo progresso sul peso!',
          description: `Hai perso ${Math.abs(diff).toFixed(1)} kg questa settimana. Il piano funziona, continuiamo così!`,
          applied: false,
        });
      }
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
 * Generates concrete diet adaptations based on weekly trends.
 * These are passed to the meal plan and AI to modify behavior.
 */
export const getDietAdaptation = (
  data: WeeklyData[],
  objective: string,
): DietAdaptation => {
  const defaults: DietAdaptation = {
    reducePortions: false,
    lighterDinners: false,
    moreProtein: false,
    lessCarbsDinner: false,
    moreVegetables: false,
    moreHydration: false,
    weeklyTrend: 'neutral',
    summary: '',
  };

  if (data.length < 2) return defaults;

  const sorted = [...data].sort((a, b) => a.week_number - b.week_number);
  const current = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];

  const lower = objective.toLowerCase();
  const wantsWeightLoss = lower.includes('peso') || lower.includes('legger') || lower.includes('sgonfi') || lower.includes('dimagr');

  const adaptation = { ...defaults };

  // Weight trend
  if (current.weight !== null && previous.weight !== null) {
    const diff = current.weight - previous.weight;
    if (wantsWeightLoss) {
      if (diff > 0.5) {
        adaptation.weeklyTrend = 'worsening';
        adaptation.reducePortions = true;
        adaptation.lighterDinners = true;
        adaptation.lessCarbsDinner = true;
        adaptation.moreVegetables = true;
        adaptation.summary = `Peso +${diff.toFixed(1)}kg: piano reso più leggero con porzioni ridotte e cene proteiche.`;
      } else if (diff >= -0.2 && diff <= 0.3) {
        // Check if stalling across multiple weeks
        if (sorted.length >= 3) {
          const thirdLast = sorted[sorted.length - 3];
          if (thirdLast.weight !== null && current.weight - thirdLast.weight >= 0) {
            adaptation.weeklyTrend = 'stalling';
            adaptation.reducePortions = true;
            adaptation.lessCarbsDinner = true;
            adaptation.moreProtein = true;
            adaptation.summary = 'Peso fermo da più settimane: piano ricalibrato con più proteine e cene leggere.';
          }
        }
      } else if (diff < -0.3) {
        adaptation.weeklyTrend = 'improving';
        adaptation.summary = `Peso -${Math.abs(diff).toFixed(1)}kg: il piano funziona, continuiamo così.`;
      }
    }
  }

  // Bloating
  if (current.bloating >= 4) {
    adaptation.lighterDinners = true;
    adaptation.moreHydration = true;
  }

  // Energy
  if (current.energy <= 2) {
    adaptation.moreProtein = true;
  }

  return adaptation;
};

/**
 * Gets habit adjustment suggestions based on trends.
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
