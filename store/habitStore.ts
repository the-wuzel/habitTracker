import { create } from 'zustand';
import { Habit, HabitLog, HabitLevel } from '../types/habit';
import { getHabits, getHabitLogs, logHabit, initializeDatabase, seedDatabase } from '../db/database';

interface HabitState {
  habits: Habit[];
  todayLogs: HabitLog[];
  currentDate: string; // YYYY-MM-DD
  isLoading: boolean;
  
  // Actions
  init: () => void;
  setDate: (date: string) => void;
  logHabit: (habitId: string, level: HabitLevel, notes?: string) => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  todayLogs: [],
  currentDate: new Date().toISOString().split('T')[0],
  isLoading: true,
  
  init: () => {
    try {
      initializeDatabase();
      seedDatabase();
      
      const habits = getHabits();
      const todayLogs = getHabitLogs(get().currentDate);
      
      set({ habits, todayLogs, isLoading: false });
    } catch (error) {
      console.error('Failed to initialize database:', error);
      set({ isLoading: false });
    }
  },
  
  setDate: (date: string) => {
    const todayLogs = getHabitLogs(date);
    set({ currentDate: date, todayLogs });
  },
  
  logHabit: (habitId: string, level: HabitLevel, notes?: string) => {
    const { currentDate, todayLogs } = get();
    
    const newLog: HabitLog = {
      id: Date.now().toString(),
      habitId,
      date: currentDate,
      level,
      notes,
    };
    
    try {
      // Persist to SQLite
      logHabit(newLog);
      
      // Update local state
      const updatedLogs = [...todayLogs.filter(log => log.habitId !== habitId), newLog];
      set({ todayLogs: updatedLogs });
    } catch (error) {
      console.error('Failed to log habit:', error);
    }
  }
}));
