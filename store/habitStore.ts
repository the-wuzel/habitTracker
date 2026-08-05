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
  
  // Actions
  init: () => void;
  setDate: (date: string) => void;
  fetchAllLogs: () => void;
  logHabit: (habitId: string, level: HabitLevel, notes?: string, optionId?: string) => void;
  removeLog: (habitId: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  loadMockData: () => void;
  toggleLateralFlexibility: () => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  todayLogs: [],
  allLogs: [],
  currentDate: new Date().toISOString().split('T')[0],
  isLoading: true,
  enableLateralFlexibility: true,
  
  init: () => {
    try {
      initializeDatabase();
      seedDatabase();
      
      const habits = getHabits();
      const todayLogs = getHabitLogs(get().currentDate);
      const allLogs = getAllHabitLogs();
      const enableLateralFlexibility = getSetting('enableLateralFlexibility', 'true') === 'true';
      
      set({ habits, todayLogs, allLogs, isLoading: false, enableLateralFlexibility });
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
  
  logHabit: (habitId: string, level: HabitLevel, notes?: string, optionId?: string) => {
    const { currentDate, todayLogs } = get();
    
    const newLog: HabitLog = {
      id: Date.now().toString(),
      habitId,
      date: currentDate,
      level,
      notes,
      optionId,
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
  }
}));
