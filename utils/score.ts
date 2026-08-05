import { Habit, HabitLevel, HabitLog } from '../types/habit';

export const getLevelScore = (level: HabitLevel) => {
  switch (level) {
    case HabitLevel.Mini: return 1;
    case HabitLevel.Plus: return 2;
    case HabitLevel.Elite: return 3;
    default: return 0;
  }
};

export const calculateStreak = (logs: HabitLog[], todayStr: string) => {
  if (logs.length === 0) return 0;
  
  const uniqueDates = [...new Set(logs.map(l => l.date))].sort((a, b) => b.localeCompare(a));
  const todayDate = new Date(todayStr);
  
  let currentStreak = 0;
  let d = new Date(todayDate.getTime());
  
  const formatD = (date: Date) => date.toISOString().split('T')[0];

  if (uniqueDates.includes(formatD(d))) {
    currentStreak++;
    d.setDate(d.getDate() - 1);
  } else {
    d.setDate(d.getDate() - 1);
    if (!uniqueDates.includes(formatD(d))) {
      return 0;
    }
  }

  while (uniqueDates.includes(formatD(d))) {
    currentStreak++;
    d.setDate(d.getDate() - 1);
  }

  return currentStreak;
};

export const calculatePeriodStats = (habits: Habit[], periodLogs: HabitLog[], currentDateStr: string, periodEndStr: string) => {
  let score = 0;
  const stats: Record<string, { points: number, streak: number, name: string }> = {};
  
  const bonusCounts = {
    specialist: 0,
    hotStreak3: 0,
    hotStreak7: 0,
    habitMaster: 0,
    bigHitter: 0,
    perfectDay: 0,
  };

  habits.forEach(h => {
    stats[h.id] = { points: 0, streak: 0, name: h.name };
  });

  habits.forEach(h => {
    const hLogs = periodLogs.filter(l => l.habitId === h.id).sort((a, b) => a.date.localeCompare(b.date));
    
    let eliteStreak = 0;
    let overallStreak = 0;
    let habitPoints = 0;
    let habitEliteCount = 0;
    let lastDate: Date | null = null;

    hLogs.forEach(log => {
      const logDate = new Date(log.date);
      
      if (lastDate) {
        const diffTime = Math.abs(logDate.getTime() - lastDate.getTime());
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          overallStreak++;
          if (log.level === HabitLevel.Elite) eliteStreak++;
          else eliteStreak = 0;
        } else if (diffDays > 1) {
          overallStreak = 1;
          if (log.level === HabitLevel.Elite) eliteStreak = 1;
          else eliteStreak = 0;
        }
      } else {
        overallStreak = 1;
        if (log.level === HabitLevel.Elite) eliteStreak = 1;
      }
      
      lastDate = logDate;
      
      habitPoints += getLevelScore(log.level);
      
      if (log.level === HabitLevel.Elite) {
        habitEliteCount++;
        if (habitEliteCount % 10 === 0) {
          habitPoints += 3; // Specialist
          bonusCounts.specialist++;
        }
      }

      if (eliteStreak === 3) {
        habitPoints += 3;
        bonusCounts.hotStreak3++;
      }
      if (eliteStreak === 7) {
        habitPoints += 5;
        bonusCounts.hotStreak7++;
      }
      if (overallStreak > 0 && overallStreak % 15 === 0) {
        habitPoints += 20; // Habit Master
        bonusCounts.habitMaster++;
      }
    });

    stats[h.id].points = habitPoints;
    
    const refDate = (currentDateStr >= periodLogs[0]?.date && currentDateStr <= periodEndStr) ? currentDateStr : periodEndStr;
    stats[h.id].streak = calculateStreak(hLogs, refDate);
    
    score += habitPoints;
  });

  const totalEliteWins = periodLogs.filter(l => l.level === HabitLevel.Elite).length;
  const bigHitters = Math.floor(totalEliteWins / 15);
  score += bigHitters * 3; // Big Hitter
  bonusCounts.bigHitter = bigHitters;

  if (habits.length > 0) {
    const uniqueDates = [...new Set(periodLogs.map(l => l.date))];
    uniqueDates.forEach(date => {
      const eliteLogsForDate = periodLogs.filter(l => l.date === date && l.level === HabitLevel.Elite);
      if (eliteLogsForDate.length === habits.length) {
        score += 2;
        bonusCounts.perfectDay++;
      }
    });
  }

  return { totalScore: score, habitStats: Object.values(stats), bonusCounts };
};
