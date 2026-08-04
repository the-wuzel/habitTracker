import { create } from 'zustand';
import { Habit, HabitLog, HabitLevel } from '../types/habit';
import { getHabits, getHabitLogs, getAllHabitLogs, logHabit, removeHabitLog, initializeDatabase, addHabit, updateHabit, deleteHabit, seedDatabase } from '../db/database';

interface HabitState {
  habits: Habit[];
  todayLogs: HabitLog[];
  currentDate: string; // YYYY-MM-DD
  isLoading: boolean;
  allLogs: HabitLog[];
  
  // Actions
  init: () => void;
  setDate: (date: string) => void;
  fetchAllLogs: () => void;
  logHabit: (habitId: string, level: HabitLevel, notes?: string) => void;
  removeLog: (habitId: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  todayLogs: [],
  allLogs: [],
  currentDate: new Date().toISOString().split('T')[0],
  isLoading: true,
  
  init: () => {
    try {
      initializeDatabase();
      seedDatabase();
      
      const habits = getHabits();
      const todayLogs = getHabitLogs(get().currentDate);
      const allLogs = getAllHabitLogs();
      
      set({ habits, todayLogs, allLogs, isLoading: false });
    } catch (error) {
      console.error('Failed to initialize database:', error);
      set({ isLoading: false });
    }
  },
  
  setDate: (date: string) => {
    const todayLogs = getHabitLogs(date);
    set({ currentDate: date, todayLogs });
  },

  fetchAllLogs: () => {
    try {
      const allLogs = getAllHabitLogs();
      set({ allLogs });
    } catch (error) {
      console.error('Failed to fetch all logs:', error);
    }
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
      const allLogs = getAllHabitLogs();
      set({ todayLogs: updatedLogs, allLogs });
    } catch (error) {
      console.error('Failed to log habit:', error);
    }
  },

  removeLog: (habitId: string) => {
    const { currentDate, todayLogs } = get();
    try {
      removeHabitLog(habitId, currentDate);
      const updatedLogs = todayLogs.filter(log => log.habitId !== habitId);
      const allLogs = getAllHabitLogs();
      set({ todayLogs: updatedLogs, allLogs });
    } catch (error) {
      console.error('Failed to remove log:', error);
    }
  },

  addHabit: (habitData) => {
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    try {
      addHabit(newHabit);
      set({ habits: getHabits() });
    } catch (error) {
      console.error('Failed to add habit:', error);
    }
  },

  updateHabit: (habit) => {
    try {
      updateHabit(habit);
      set({ habits: getHabits() });
    } catch (error) {
      console.error('Failed to update habit:', error);
    }
  },

  deleteHabit: (id) => {
    try {
      deleteHabit(id);
      // We also need to refresh logs in case logs were cascade deleted
      const habits = getHabits();
      const todayLogs = getHabitLogs(get().currentDate);
      const allLogs = getAllHabitLogs();
      set({ habits, todayLogs, allLogs });
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  }
}));
