import * as SQLite from 'expo-sqlite';
import { Habit, HabitLog, HabitLevel } from '../types/habit';

const DB_NAME = 'elastic_habits.db';

export const getDb = () => {
  return SQLite.openDatabaseSync(DB_NAME);
};

export const initializeDatabase = () => {
  const db = getDb();
  
  // For development/migration purposes, drop existing tables to apply schema change.
  // In a production app, we would use proper migrations.
  db.execSync(`
    DROP TABLE IF EXISTS habit_logs;
    DROP TABLE IF EXISTS habits;
  
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      miniGoal TEXT NOT NULL,
      plusGoal TEXT NOT NULL,
      eliteGoal TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY NOT NULL,
      habitId TEXT NOT NULL,
      date TEXT NOT NULL,
      level TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY(habitId) REFERENCES habits(id) ON DELETE CASCADE
    );
  `);
};

export const getHabits = (): Habit[] => {
  const db = getDb();
  return db.getAllSync<Habit>('SELECT * FROM habits ORDER BY createdAt DESC');
};

export const addHabit = (habit: Habit) => {
  const db = getDb();
  db.runSync(
    'INSERT INTO habits (id, name, description, miniGoal, plusGoal, eliteGoal, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [habit.id, habit.name, habit.description, habit.miniGoal, habit.plusGoal, habit.eliteGoal, habit.createdAt]
  );
};

export const updateHabit = (habit: Habit) => {
  const db = getDb();
  db.runSync(
    'UPDATE habits SET name = ?, description = ?, miniGoal = ?, plusGoal = ?, eliteGoal = ? WHERE id = ?',
    [habit.name, habit.description, habit.miniGoal, habit.plusGoal, habit.eliteGoal, habit.id]
  );
};

export const deleteHabit = (id: string) => {
  const db = getDb();
  db.runSync('DELETE FROM habits WHERE id = ?', [id]);
};

export const getHabitLogs = (date: string): HabitLog[] => {
  const db = getDb();
  return db.getAllSync<HabitLog>('SELECT * FROM habit_logs WHERE date = ?', [date]);
};

export const logHabit = (log: HabitLog) => {
  const db = getDb();
  
  // First delete any existing log for this habit on this date
  db.runSync('DELETE FROM habit_logs WHERE habitId = ? AND date = ?', [log.habitId, log.date]);
  
  // Insert the new log
  db.runSync(
    'INSERT INTO habit_logs (id, habitId, date, level, notes) VALUES (?, ?, ?, ?, ?)',
    [log.id, log.habitId, log.date, log.level, log.notes || '']
  );
};
