import * as SQLite from 'expo-sqlite';
import { Habit, HabitLog, HabitLevel } from '../types/habit';

const DB_NAME = 'elastic_habits.db';

export const getDb = () => {
  return SQLite.openDatabaseSync(DB_NAME);
};

export const initializeDatabase = () => {
  const db = getDb();
  
  db.execSync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY NOT NULL,
      habitId TEXT NOT NULL,
      date TEXT NOT NULL,
      level TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY(habitId) REFERENCES habits(id)
    );
  `);
};

export const seedDatabase = () => {
  const db = getDb();
  
  // Check if we already have habits
  const result = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM habits');
  if (result && result.count === 0) {
    console.log('Seeding database with initial habits...');
    
    const habits: Habit[] = [
      { id: '1', name: 'Exercise', description: 'Daily physical activity', createdAt: Date.now() },
      { id: '2', name: 'Read', description: 'Read a book', createdAt: Date.now() },
      { id: '3', name: 'Meditate', description: 'Mindfulness practice', createdAt: Date.now() },
    ];
    
    for (const habit of habits) {
      db.runSync(
        'INSERT INTO habits (id, name, description, createdAt) VALUES (?, ?, ?, ?)',
        [habit.id, habit.name, habit.description, habit.createdAt]
      );
    }
  }
};

export const getHabits = (): Habit[] => {
  const db = getDb();
  return db.getAllSync<Habit>('SELECT * FROM habits ORDER BY createdAt DESC');
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
