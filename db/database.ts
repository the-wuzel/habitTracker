import * as SQLite from 'expo-sqlite';
import { Habit, HabitLog } from '../types/habit';

const DB_NAME = 'elastic_habits.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDb = () => {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DB_NAME);
  }
  return dbInstance;
};

export const initializeDatabase = () => {
  const db = getDb();
  
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
};

export const seedDatabase = () => {
  const db = getDb();
  
  const result = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM habits');
  if (result && result.count === 0) {
    const habits: Habit[] = [
      { 
        id: '1', 
        name: 'Exercise', 
        description: 'Daily physical activity for health', 
        miniGoal: '1 Pushup', 
        plusGoal: '15 min Workout', 
        eliteGoal: '45 min Gym', 
        createdAt: Date.now() 
      },
      { 
        id: '2', 
        name: 'Read', 
        description: 'Read a book to learn something new', 
        miniGoal: '1 Page', 
        plusGoal: '1 Chapter', 
        eliteGoal: '50 Pages', 
        createdAt: Date.now() - 1000 
      },
      { 
        id: '3', 
        name: 'Meditate', 
        description: 'Mindfulness practice', 
        miniGoal: '1 Deep Breath', 
        plusGoal: '5 min Meditation', 
        eliteGoal: '20 min Meditation', 
        createdAt: Date.now() - 2000 
      },
    ];
    
    for (const habit of habits) {
      db.runSync(
        'INSERT INTO habits (id, name, description, miniGoal, plusGoal, eliteGoal, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [habit.id, habit.name, habit.description, habit.miniGoal, habit.plusGoal, habit.eliteGoal, habit.createdAt]
      );
    }
  }
};

export const getHabits = (): Habit[] => {
  const db = getDb();
  const rows = db.getAllSync<any>('SELECT * FROM habits ORDER BY createdAt DESC');
  return rows.map(row => ({
    ...row,
    options: row.options ? JSON.parse(row.options) : []
  }));
};

export const addHabit = (habit: Habit) => {
  const db = getDb();
  db.runSync(
    'INSERT INTO habits (id, name, description, miniGoal, plusGoal, eliteGoal, createdAt, options) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [habit.id, habit.name, habit.description, habit.miniGoal, habit.plusGoal, habit.eliteGoal, habit.createdAt, habit.options ? JSON.stringify(habit.options) : null]
  );
};

export const updateHabit = (habit: Habit) => {
  const db = getDb();
  db.runSync(
    'UPDATE habits SET name = ?, description = ?, miniGoal = ?, plusGoal = ?, eliteGoal = ?, options = ? WHERE id = ?',
    [habit.name, habit.description, habit.miniGoal, habit.plusGoal, habit.eliteGoal, habit.options ? JSON.stringify(habit.options) : null, habit.id]
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

export const getAllHabitLogs = (): HabitLog[] => {
  const db = getDb();
  return db.getAllSync<HabitLog>('SELECT * FROM habit_logs ORDER BY date ASC');
};

export const logHabit = (log: HabitLog) => {
  const db = getDb();
  
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
  db.runSync('DELETE FROM habit_logs WHERE habitId = ? AND date = ?', [habitId, date]);
};
