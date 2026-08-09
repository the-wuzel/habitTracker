export enum HabitLevel {
  Mini = 'MINI',
  Plus = 'PLUS',
  Elite = 'ELITE',
}

export interface HabitOption {
  id: string;
  name: string;
  miniGoal: string;
  plusGoal: string;
  eliteGoal: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  miniGoal: string; // Kept for backwards compatibility
  plusGoal: string; // Kept for backwards compatibility
  eliteGoal: string; // Kept for backwards compatibility
  options?: HabitOption[];
  color?: string; // Predefined M3 palette ID (e.g., 'purple', 'red')
  createdAt: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  level: HabitLevel;
  optionId?: string; // Tracks which lateral option was chosen
  notes?: string;
}
