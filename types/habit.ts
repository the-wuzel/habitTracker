export enum HabitLevel {
  Mini = 'MINI',
  Plus = 'PLUS',
  Elite = 'ELITE',
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  level: HabitLevel;
  notes?: string;
}
