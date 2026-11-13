import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Habit, HabitLog } from '../types/habit';

const DB_NAME = 'elastic_habits.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

// Keys for web localStorage fallback
const WEB_KEYS = {
  HABITS: 'elastic_habits_data',
  LOGS: 'elastic_habits_logs',
  SETTINGS: 'elastic_habits_settings',
};

const getWebItem = (key: string): string | null => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setWebItem = (key: string, value: string): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {
    console.warn('Failed to set localStorage item', e);
  }
};

export const isSqliteSupported = (): boolean => {
  if (Platform.OS !== 'web') return true;
  if (typeof window === 'undefined') return false;
  // On web, SQLite sync operations require SharedArrayBuffer
  if (typeof SharedArrayBuffer === 'undefined') {
    return false;
  }
  return true;
};

export const getDb = () => {
  if (!isSqliteSupported()) {
    return null;
  }
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DB_NAME);
  }
  return dbInstance;
};

export const clearAllDatabaseData = () => {
  const db = getDb();
  if (db) {
    db.runSync('DELETE FROM habits');
    db.runSync('DELETE FROM habit_logs');
  } else {
    setWebItem(WEB_KEYS.HABITS, JSON.stringify([]));
    setWebItem(WEB_KEYS.LOGS, JSON.stringify([]));
  }
};

export const initializeDatabase = () => {
  const db = getDb();
  if (!db) {
    // Web fallback initialization
    if (!getWebItem(WEB_KEYS.HABITS)) {
      setWebItem(WEB_KEYS.HABITS, JSON.stringify([]));
    }
    if (!getWebItem(WEB_KEYS.LOGS)) {
      setWebItem(WEB_KEYS.LOGS, JSON.stringify([]));
    }
    if (!getWebItem(WEB_KEYS.SETTINGS)) {
      setWebItem(WEB_KEYS.SETTINGS, JSON.stringify({}));
    }
    return;
  }
  
  // Creating tables if they don't exist
  db.execSync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      miniGoal TEXT NOT NULL,
      plusGoal TEXT NOT NULL,
      eliteGoal TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      orderIndex INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY NOT NULL,
      habitId TEXT NOT NULL,
      date TEXT NOT NULL,
      level TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY(habitId) REFERENCES habits(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  // Run migrations (add options and optionId if they don't exist)
  try {
    db.execSync('ALTER TABLE habits ADD COLUMN options TEXT;');
  } catch (e) {
    // Column might already exist
  }
  
  try {
    db.execSync('ALTER TABLE habit_logs ADD COLUMN optionId TEXT;');
  } catch (e) {
    // Column might already exist
  }
  
  try {
    db.execSync('ALTER TABLE habits ADD COLUMN color TEXT;');
  } catch (e) {
    // Column might already exist
  }
  
  try {
    db.execSync('ALTER TABLE habits ADD COLUMN orderIndex INTEGER DEFAULT 0;');
  } catch (e) {
    // Column might already exist
  }
  
  try {
    db.execSync('ALTER TABLE habits ADD COLUMN hasVerticalFlexibility INTEGER DEFAULT 1;');
  } catch (e) {
    // Column might already exist
  }
};

const DEFAULT_HABITS: Habit[] = [
  { 
    id: '1', 
    name: 'Exercise', 
    description: 'Daily physical activity for health', 
    miniGoal: '1 Pushup', 
    plusGoal: '15 min Workout', 
    eliteGoal: '45 min Gym', 
    color: 'purple',
    orderIndex: 0,
    hasVerticalFlexibility: true,
    createdAt: Date.now() 
  },
  { 
    id: '2', 
    name: 'Read', 
    description: 'Read a book to learn something new', 
    miniGoal: '1 Page', 
    plusGoal: '1 Chapter', 
    eliteGoal: '50 Pages', 
    color: 'blue',
    orderIndex: 1,
    hasVerticalFlexibility: true,
    createdAt: Date.now() - 1000 
  },
  { 
    id: '3', 
    name: 'Meditate', 
    description: 'Mindfulness practice', 
    miniGoal: '1 Deep Breath', 
    plusGoal: '5 min Meditation', 
    eliteGoal: '20 min Meditation', 
    color: 'green',
    orderIndex: 2,
    hasVerticalFlexibility: true,
    createdAt: Date.now() - 2000 
  },
];

export const seedDatabase = () => {
  const db = getDb();
  if (!db) {
    const habitsJson = getWebItem(WEB_KEYS.HABITS);
    const existing: Habit[] = habitsJson ? JSON.parse(habitsJson) : [];
    if (existing.length === 0) {
      setWebItem(WEB_KEYS.HABITS, JSON.stringify(DEFAULT_HABITS));
    }
    return;
  }
  
  const result = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM habits');
  if (result && result.count === 0) {
    for (const habit of DEFAULT_HABITS) {
      db.runSync(
        'INSERT INTO habits (id, name, description, miniGoal, plusGoal, eliteGoal, createdAt, color, orderIndex, hasVerticalFlexibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [habit.id, habit.name, habit.description, habit.miniGoal, habit.plusGoal, habit.eliteGoal, habit.createdAt, habit.color || 'purple', habit.orderIndex || 0, 1]
      );
    }
  }
};

export const getHabits = (): Habit[] => {
  const db = getDb();
  if (!db) {
    const raw = getWebItem(WEB_KEYS.HABITS);
    const habits: Habit[] = raw ? JSON.parse(raw) : [];
    return habits.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0) || b.createdAt - a.createdAt);
  }
  const rows = db.getAllSync<any>('SELECT * FROM habits ORDER BY orderIndex ASC, createdAt DESC');
  return rows.map(row => ({
    ...row,
    options: row.options ? JSON.parse(row.options) : [],
    hasVerticalFlexibility: row.hasVerticalFlexibility !== 0
  }));
};

export const addHabit = (habit: Habit) => {
  const db = getDb();
  if (!db) {
    const raw = getWebItem(WEB_KEYS.HABITS);
    const habits: Habit[] = raw ? JSON.parse(raw) : [];
    habits.push(habit);
    setWebItem(WEB_KEYS.HABITS, JSON.stringify(habits));
    return;
  }
  db.runSync(
    'INSERT INTO habits (id, name, description, miniGoal, plusGoal, eliteGoal, createdAt, options, color, orderIndex, hasVerticalFlexibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [habit.id, habit.name, habit.description, habit.miniGoal, habit.plusGoal, habit.eliteGoal, habit.createdAt, habit.options ? JSON.stringify(habit.options) : null, habit.color || 'purple', habit.orderIndex || 0, habit.hasVerticalFlexibility === false ? 0 : 1]
  );
};

export const updateHabit = (habit: Habit) => {
  const db = getDb();
  if (!db) {
    const raw = getWebItem(WEB_KEYS.HABITS);
    const habits: Habit[] = raw ? JSON.parse(raw) : [];
    const index = habits.findIndex(h => h.id === habit.id);
    if (index !== -1) {
      habits[index] = { ...habits[index], ...habit };
      setWebItem(WEB_KEYS.HABITS, JSON.stringify(habits));
    }
    return;
  }
  db.runSync(
    'UPDATE habits SET name = ?, description = ?, miniGoal = ?, plusGoal = ?, eliteGoal = ?, options = ?, color = ?, orderIndex = ?, hasVerticalFlexibility = ? WHERE id = ?',
    [habit.name, habit.description, habit.miniGoal, habit.plusGoal, habit.eliteGoal, habit.options ? JSON.stringify(habit.options) : null, habit.color || 'purple', habit.orderIndex || 0, habit.hasVerticalFlexibility === false ? 0 : 1, habit.id]
  );
};

export const deleteHabit = (id: string) => {
  const db = getDb();
  if (!db) {
    const rawHabits = getWebItem(WEB_KEYS.HABITS);
    const habits: Habit[] = rawHabits ? JSON.parse(rawHabits) : [];
    setWebItem(WEB_KEYS.HABITS, JSON.stringify(habits.filter(h => h.id !== id)));

    const rawLogs = getWebItem(WEB_KEYS.LOGS);
    const logs: HabitLog[] = rawLogs ? JSON.parse(rawLogs) : [];
    setWebItem(WEB_KEYS.LOGS, JSON.stringify(logs.filter(l => l.habitId !== id)));
    return;
  }
  db.runSync('DELETE FROM habits WHERE id = ?', [id]);
};

export const getHabitLogs = (date: string): HabitLog[] => {
  const db = getDb();
  if (!db) {
    const raw = getWebItem(WEB_KEYS.LOGS);
    const logs: HabitLog[] = raw ? JSON.parse(raw) : [];
    return logs.filter(l => l.date === date);
  }
  return db.getAllSync<HabitLog>('SELECT * FROM habit_logs WHERE date = ?', [date]);
};

export const getAllHabitLogs = (): HabitLog[] => {
  const db = getDb();
  if (!db) {
    const raw = getWebItem(WEB_KEYS.LOGS);
    const logs: HabitLog[] = raw ? JSON.parse(raw) : [];
    return logs.sort((a, b) => a.date.localeCompare(b.date));
  }
  return db.getAllSync<HabitLog>('SELECT * FROM habit_logs ORDER BY date ASC');
};

export const logHabit = (log: HabitLog) => {
  const db = getDb();
  if (!db) {
    const raw = getWebItem(WEB_KEYS.LOGS);
    const logs: HabitLog[] = raw ? JSON.parse(raw) : [];
    const filtered = logs.filter(l => !(l.habitId === log.habitId && l.date === log.date));
    filtered.push(log);
    setWebItem(WEB_KEYS.LOGS, JSON.stringify(filtered));
    return;
  }
  
  // First delete any existing log for this habit on this date
  db.runSync('DELETE FROM habit_logs WHERE habitId = ? AND date = ?', [log.habitId, log.date]);
  
  // Insert the new log
  db.runSync(
    'INSERT INTO habit_logs (id, habitId, date, level, notes, optionId) VALUES (?, ?, ?, ?, ?, ?)',
    [log.id, log.habitId, log.date, log.level, log.notes || '', log.optionId || null]
  );
};

export const removeHabitLog = (habitId: string, date: string) => {
  const db = getDb();
  if (!db) {
    const raw = getWebItem(WEB_KEYS.LOGS);
    const logs: HabitLog[] = raw ? JSON.parse(raw) : [];
    setWebItem(WEB_KEYS.LOGS, JSON.stringify(logs.filter(l => !(l.habitId === habitId && l.date === date))));
    return;
  }
  db.runSync('DELETE FROM habit_logs WHERE habitId = ? AND date = ?', [habitId, date]);
};

export const getSetting = (key: string, defaultValue: string): string => {
  const db = getDb();
  if (!db) {
    const raw = getWebItem(WEB_KEYS.SETTINGS);
    const settings = raw ? JSON.parse(raw) : {};
    return settings[key] !== undefined ? String(settings[key]) : defaultValue;
  }
  const result = db.getFirstSync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
  return result ? result.value : defaultValue;
};

export const setSetting = (key: string, value: string) => {
  const db = getDb();
  if (!db) {
    const raw = getWebItem(WEB_KEYS.SETTINGS);
    const settings = raw ? JSON.parse(raw) : {};
    settings[key] = value;
    setWebItem(WEB_KEYS.SETTINGS, JSON.stringify(settings));
    return;
  }
  db.runSync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value]
  );
};
