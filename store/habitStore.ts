import { create } from 'zustand';
import { Habit, HabitLog, HabitLevel } from '../types/habit';
import { getHabits, getHabitLogs, getAllHabitLogs, logHabit, removeHabitLog, initializeDatabase, addHabit, updateHabit, deleteHabit, seedDatabase, getDb, getSetting, setSetting } from '../db/database';

interface HabitState {
  habits: Habit[];
  todayLogs: HabitLog[];
  currentDate: string; // YYYY-MM-DD
  isLoading: boolean;
  allLogs: HabitLog[];
  enableLateralFlexibility: boolean;
  hasCompletedOnboarding: boolean;
  themeMode: 'system' | 'light' | 'dark';
  compactMode: boolean;
  
  // Actions
  init: () => void;
  completeOnboarding: () => void;
  setDate: (date: string) => void;
  fetchAllLogs: () => void;
  logHabit: (habitId: string, level: HabitLevel, notes?: string, optionId?: string, dateStr?: string) => void;
  removeLog: (habitId: string, dateStr?: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  loadMockData: () => void;
  toggleLateralFlexibility: () => void;
  setThemeMode: (mode: 'system' | 'light' | 'dark') => void;
  toggleCompactMode: () => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  todayLogs: [],
  allLogs: [],
  currentDate: new Date().toISOString().split('T')[0],
  isLoading: true,
  enableLateralFlexibility: true,
  hasCompletedOnboarding: true, // Will be overridden in init
  themeMode: 'system',
  compactMode: false,
  
  init: () => {
    try {
      initializeDatabase();
      seedDatabase();
      
      const habits = getHabits();
      const todayLogs = getHabitLogs(get().currentDate);
      const allLogs = getAllHabitLogs();
      const enableLateralFlexibility = getSetting('enableLateralFlexibility', 'true') === 'true';
      const hasCompletedOnboarding = getSetting('hasCompletedOnboarding', 'false') === 'true';
      const themeMode = getSetting('themeMode', 'system') as 'system' | 'light' | 'dark';
      const compactMode = getSetting('compactMode', 'false') === 'true';
      
      set({ habits, todayLogs, allLogs, isLoading: false, enableLateralFlexibility, hasCompletedOnboarding, themeMode, compactMode });
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
  
  logHabit: (habitId: string, level: HabitLevel, notes?: string, optionId?: string, dateStr?: string) => {
    const { currentDate, todayLogs } = get();
    const targetDate = dateStr || currentDate;
    
    const newLog: HabitLog = {
      id: Date.now().toString(),
      habitId,
      date: targetDate,
      level,
      notes,
      optionId,
    };
    
    try {
      // Persist to SQLite
      logHabit(newLog);
      
      // Update local state
      let updatedLogs = todayLogs;
      if (targetDate === currentDate) {
        updatedLogs = [...todayLogs.filter(log => log.habitId !== habitId), newLog];
      }
      const allLogs = getAllHabitLogs();
      set({ todayLogs: updatedLogs, allLogs });
    } catch (error) {
      console.error('Failed to log habit:', error);
    }
  },

  removeLog: (habitId: string, dateStr?: string) => {
    const { currentDate, todayLogs } = get();
    const targetDate = dateStr || currentDate;
    try {
      removeHabitLog(habitId, targetDate);
      
      let updatedLogs = todayLogs;
      if (targetDate === currentDate) {
        updatedLogs = todayLogs.filter(log => log.habitId !== habitId);
      }
      
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
  },

  loadMockData: () => {
    try {
      const db = getDb();
      db.runSync('DELETE FROM habits');
      db.runSync('DELETE FROM habit_logs');
      
      const mockHabits: Habit[] = [
        {
          id: '1',
          name: 'Exercise',
          description: 'Daily physical activity',
          miniGoal: '1 Pushup',
          plusGoal: '15m Workout',
          eliteGoal: '45m Gym',
          createdAt: Date.now(),
          options: [
            { id: '1-1', name: 'Home Workout', miniGoal: '1 Pushup', plusGoal: '15m Workout', eliteGoal: '45m Workout' },
            { id: '1-2', name: 'Running', miniGoal: 'Put on shoes', plusGoal: '2km Run', eliteGoal: '5km Run' },
            { id: '1-3', name: 'Yoga', miniGoal: '1 Pose', plusGoal: '15m Yoga', eliteGoal: '45m Yoga' }
          ]
        },
        {
          id: '2',
          name: 'Read',
          description: 'Read a book',
          miniGoal: '1 Page',
          plusGoal: '1 Chapter',
          eliteGoal: '50 Pages',
          createdAt: Date.now() - 1000,
          options: [
            { id: '2-1', name: 'Non-Fiction', miniGoal: '1 Page', plusGoal: '1 Chapter', eliteGoal: '50 Pages' },
            { id: '2-2', name: 'Fiction', miniGoal: '1 Page', plusGoal: '1 Chapter', eliteGoal: '50 Pages' },
            { id: '2-3', name: 'Audiobook', miniGoal: '1 Minute', plusGoal: '15 Minutes', eliteGoal: '45 Minutes' }
          ]
        },
        {
          id: '3',
          name: 'Meditation',
          description: 'Mindfulness practice',
          miniGoal: '1 Deep Breath',
          plusGoal: '5m Meditation',
          eliteGoal: '20m Meditation',
          createdAt: Date.now() - 2000,
          options: [
            { id: '3-1', name: 'Guided', miniGoal: '1 Minute', plusGoal: '5m Guided', eliteGoal: '20m Guided' },
            { id: '3-2', name: 'Silent', miniGoal: '1 Deep Breath', plusGoal: '5m Silent', eliteGoal: '20m Silent' }
          ]
        }
      ];

      for (const habit of mockHabits) {
        addHabit(habit);
      }
      
      const mockLogs: HabitLog[] = [];
      const now = new Date(get().currentDate);
      for (let i = 14; i >= 0; i--) {
        const past = new Date(now);
        past.setDate(now.getDate() - i);
        const dateStr = past.toISOString().split('T')[0];
        const index = 14 - i;
        
        // Habit 1: 15 days streak. First 10 days are Elite. Remaining 5 days are Mini.
        // This hits Habit Master (15 streak), Hot Streak (3 & 7 elite), Specialist (10 elite).
        const h1Level = index < 10 ? HabitLevel.Elite : HabitLevel.Mini;
        mockLogs.push({ id: `mock-1-${index}`, habitId: '1', date: dateStr, level: h1Level, notes: 'Mocked', optionId: '1-1' });

        // Habit 2: First 5 days Elite. This helps hit Big Hitter (total 15 elite across habits)
        if (index < 5) {
          mockLogs.push({ id: `mock-2-${index}`, habitId: '2', date: dateStr, level: HabitLevel.Elite, notes: 'Mocked', optionId: '2-1' });
        }

        // Habit 3: Day 0 Elite. This hits Perfect Day (all habits elite on same day)
        if (index === 0) {
          mockLogs.push({ id: `mock-3-${index}`, habitId: '3', date: dateStr, level: HabitLevel.Elite, notes: 'Mocked', optionId: '3-1' });
        }
      }

      for (const log of mockLogs) {
        logHabit(log);
      }
      
      set({ habits: getHabits(), todayLogs: getHabitLogs(get().currentDate), allLogs: getAllHabitLogs() });
    } catch (error) {
      console.error('Failed to load mock data:', error);
    }
  },
  
  toggleLateralFlexibility: () => {
    const current = get().enableLateralFlexibility;
    const newValue = !current;
    try {
      setSetting('enableLateralFlexibility', newValue.toString());
      set({ enableLateralFlexibility: newValue });
    } catch (error) {
      console.error('Failed to toggle lateral flexibility setting:', error);
    }
  },
  
  completeOnboarding: () => {
    try {
      setSetting('hasCompletedOnboarding', 'true');
      set({ hasCompletedOnboarding: true });
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  },
  
  setThemeMode: (mode: 'system' | 'light' | 'dark') => {
    try {
      setSetting('themeMode', mode);
      set({ themeMode: mode });
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  },
  
  toggleCompactMode: () => {
    const current = get().compactMode;
    const newValue = !current;
    try {
      setSetting('compactMode', newValue.toString());
      set({ compactMode: newValue });
    } catch (error) {
      console.error('Failed to toggle compact mode setting:', error);
    }
  }
}));
