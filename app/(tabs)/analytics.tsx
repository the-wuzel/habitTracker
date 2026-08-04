import React, { useMemo, useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { useHabitStore } from '@/store/habitStore';
import { HabitLevel, HabitLog, Habit } from '@/types/habit';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';

const getLevelScore = (level: HabitLevel) => {
  switch (level) {
    case HabitLevel.Mini: return 1;
    case HabitLevel.Plus: return 2;
    case HabitLevel.Elite: return 3;
    default: return 0;
  }
};

const calculateStreak = (logs: HabitLog[], todayStr: string) => {
  if (logs.length === 0) return 0;
  
  const uniqueDates = [...new Set(logs.map(l => l.date))].sort((a, b) => b.localeCompare(a));
  const todayDate = new Date(todayStr); // Parses as UTC if YYYY-MM-DD
  
  let currentStreak = 0;
  let d = new Date(todayDate.getTime());
  
  const formatD = (date: Date) => date.toISOString().split('T')[0];

  // Check if today is logged
  if (uniqueDates.includes(formatD(d))) {
    currentStreak++;
    d.setDate(d.getDate() - 1);
  } else {
    // If today is not logged, check yesterday. If yesterday is not logged, streak is 0.
    d.setDate(d.getDate() - 1);
    if (!uniqueDates.includes(formatD(d))) {
      return 0;
    }
  }

  // Count backwards continuously
  while (uniqueDates.includes(formatD(d))) {
    currentStreak++;
    d.setDate(d.getDate() - 1);
  }

  return currentStreak;
};

export default function AnalyticsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { habits, allLogs, currentDate } = useHabitStore();

  const [viewedPeriodStart, setViewedPeriodStart] = useState<string>(() => {
    const [year, month, day] = currentDate.split('-');
    if (parseInt(day) <= 15) {
      return `${year}-${month}-01`;
    } else {
      return `${year}-${month}-16`;
    }
  });

  const { periodStart, periodEnd, periodLabel } = useMemo(() => {
    const [year, month, day] = viewedPeriodStart.split('-');
    const isFirstHalf = day === '01';
    
    // We can parse month safely as UTC to get month name
    const dateObj = new Date(`${year}-${month}-01T00:00:00Z`);
    const monthName = dateObj.toLocaleString('default', { month: 'long', timeZone: 'UTC' });

    let endDay = isFirstHalf ? '15' : '30';
    
    return {
      periodStart: viewedPeriodStart,
      periodEnd: `${year}-${month}-${endDay}`,
      periodLabel: `${monthName} ${isFirstHalf ? '1-15' : '16-30'}, ${year}`
    };
  }, [viewedPeriodStart]);

  const handlePrevPeriod = () => {
    const [year, month, day] = viewedPeriodStart.split('-');
    if (day === '16') {
      setViewedPeriodStart(`${year}-${month}-01`);
    } else {
      let prevMonth = parseInt(month) - 1;
      let prevYear = parseInt(year);
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear--;
      }
      const prevMonthStr = prevMonth.toString().padStart(2, '0');
      setViewedPeriodStart(`${prevYear}-${prevMonthStr}-16`);
    }
  };

  const handleNextPeriod = () => {
    const [year, month, day] = viewedPeriodStart.split('-');
    if (day === '01') {
      setViewedPeriodStart(`${year}-${month}-16`);
    } else {
      let nextMonth = parseInt(month) + 1;
      let nextYear = parseInt(year);
      if (nextMonth === 13) {
        nextMonth = 1;
        nextYear++;
      }
      const nextMonthStr = nextMonth.toString().padStart(2, '0');
      setViewedPeriodStart(`${nextYear}-${nextMonthStr}-01`);
    }
  };

  const { totalScore, habitStats } = useMemo(() => {
    let score = 0;
    const stats: Record<string, { points: number, streak: number, name: string }> = {};

    // Filter logs for the active period
    const periodLogs = allLogs.filter(l => l.date >= periodStart && l.date <= periodEnd);

    // Initialize stats
    habits.forEach(h => {
      stats[h.id] = { points: 0, streak: 0, name: h.name };
    });

    // Calculate points and streaks
    habits.forEach(h => {
      // Sort logs chronologically within the period
      const hLogs = periodLogs.filter(l => l.habitId === h.id).sort((a, b) => a.date.localeCompare(b.date));
      
      let eliteStreak = 0;
      let overallStreak = 0;
      let habitPoints = 0;
      let habitEliteCount = 0;
      let lastDate: Date | null = null;

      hLogs.forEach(log => {
        const logDate = new Date(log.date);
        
        // Track streaks
        if (lastDate) {
          // Calculate difference in days (ignoring daylight savings issues by using UTC strings or approx ms)
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
        
        // Base points
        habitPoints += getLevelScore(log.level);
        
        // Bonuses
        if (log.level === HabitLevel.Elite) {
          habitEliteCount++;
          if (habitEliteCount % 10 === 0) habitPoints += 3; // Specialist
        }

        if (eliteStreak === 3) habitPoints += 3;
        if (eliteStreak === 7) habitPoints += 5;
        if (overallStreak > 0 && overallStreak % 15 === 0) habitPoints += 20; // Habit Master
      });

      stats[h.id].points = habitPoints;
      
      const refDate = (currentDate >= periodStart && currentDate <= periodEnd) ? currentDate : periodEnd;
      stats[h.id].streak = calculateStreak(hLogs, refDate);
      
      score += habitPoints;
    });

    // Calculate global bonuses (Perfect Day & Big Hitter)
    const totalEliteWins = periodLogs.filter(l => l.level === HabitLevel.Elite).length;
    score += Math.floor(totalEliteWins / 15) * 3; // Big Hitter

    if (habits.length > 0) {
      const uniqueDates = [...new Set(periodLogs.map(l => l.date))];
      uniqueDates.forEach(date => {
        const eliteLogsForDate = periodLogs.filter(l => l.date === date && l.level === HabitLevel.Elite);
        // If the user got an Elite win for all currently tracked habits on this date
        if (eliteLogsForDate.length === habits.length) {
          score += 2;
        }
      });
    }

    return { totalScore: score, habitStats: Object.values(stats) };
  }, [habits, allLogs, currentDate, periodStart, periodEnd]);

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      
      {/* Period Navigation */}
      <View style={styles.periodNavContainer}>
        <TouchableOpacity onPress={handlePrevPeriod} style={styles.navButton}>
          <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.periodLabelContainer}>
          <Text style={styles.periodLabel}>{periodLabel}</Text>
        </View>

        <TouchableOpacity onPress={handleNextPeriod} style={styles.navButton}>
          <MaterialIcons name="chevron-right" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Total Score Card */}
      <View style={[styles.scoreCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
        <MaterialIcons name="emoji-events" size={48} color={colors.primary} />
        <Text style={styles.scoreTitle}>Total Elastic Score</Text>
        <Text style={[styles.scoreValue, { color: colors.primary }]}>{totalScore}</Text>
        <Text style={[styles.scoreSubtitle, { color: colors.text }]}>Points earned across all habits</Text>
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
        <View style={styles.infoHeader}>
          <MaterialIcons name="info-outline" size={20} color={colors.primary} />
          <Text style={styles.infoTitle}>How Points Work</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoBadge}><Text style={styles.infoBadgeText}>Mini</Text></View>
          <Text style={styles.infoDesc}>= 1 Point (Easy, minimal effort)</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoBadge}><Text style={styles.infoBadgeText}>Plus</Text></View>
          <Text style={styles.infoDesc}>= 2 Points (Moderate effort)</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoBadge}><Text style={styles.infoBadgeText}>Elite</Text></View>
          <Text style={styles.infoDesc}>= 3 Points (Significant effort)</Text>
        </View>

        <View style={[styles.infoHeader, { marginTop: 16 }]}>
          <MaterialIcons name="star" size={20} color="#FF9800" />
          <Text style={styles.infoTitle}>Bonuses</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.infoBadge, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}><Text style={[styles.infoBadgeText, { color: '#FF9800' }]}>+2 Pts</Text></View>
          <Text style={[styles.infoDesc, { flex: 1 }]} numberOfLines={2}>Perfect Day: Elite win for all habits</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.infoBadge, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}><Text style={[styles.infoBadgeText, { color: '#FF9800' }]}>+3 Pts</Text></View>
          <Text style={[styles.infoDesc, { flex: 1 }]} numberOfLines={2}>Hot Streak: 3 consecutive Elite wins</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.infoBadge, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}><Text style={[styles.infoBadgeText, { color: '#FF9800' }]}>+5 Pts</Text></View>
          <Text style={[styles.infoDesc, { flex: 1 }]} numberOfLines={2}>Unfreakinbelievable: 7 consecutive Elite wins</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.infoBadge, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}><Text style={[styles.infoBadgeText, { color: '#FF9800' }]}>+20 Pts</Text></View>
          <Text style={[styles.infoDesc, { flex: 1 }]} numberOfLines={2}>Habit Master: 15-day streak (Consistency!)</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.infoBadge, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}><Text style={[styles.infoBadgeText, { color: '#FF9800' }]}>+3 Pts</Text></View>
          <Text style={[styles.infoDesc, { flex: 1 }]} numberOfLines={2}>Specialist: 10 Elite wins for one habit</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.infoBadge, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}><Text style={[styles.infoBadgeText, { color: '#FF9800' }]}>+3 Pts</Text></View>
          <Text style={[styles.infoDesc, { flex: 1 }]} numberOfLines={2}>Big Hitter: 15 Elite wins across habits</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Habit Breakdown</Text>

      {/* Habit Stats List */}
      {habitStats.map((stat, index) => (
        <View key={index} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
          <View style={styles.statHeader}>
            <Text style={styles.statName}>{stat.name}</Text>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>{stat.points} pts</Text>
            </View>
          </View>
          
          <View style={styles.streakContainer}>
            <MaterialIcons 
              name="local-fire-department" 
              size={24} 
              color={stat.streak > 0 ? '#FF9800' : colors.outline} 
            />
            <Text style={[styles.streakText, { color: stat.streak > 0 ? '#FF9800' : colors.outline }]}>
              {stat.streak} {stat.streak === 1 ? 'Day' : 'Days'} Streak
            </Text>
          </View>
        </View>
      ))}

      {habitStats.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.outline }]}>No habits to track yet.</Text>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  periodNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  navButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 150, 136, 0.1)',
    borderRadius: 24,
  },
  periodLabelContainer: {
    flex: 1,
    alignItems: 'center',
  },
  periodLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    opacity: 0.8,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  scoreSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 4,
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoBadge: {
    backgroundColor: 'rgba(0, 150, 136, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
    marginRight: 12,
  },
  infoBadgeText: {
    color: '#009688',
    fontWeight: '600',
    fontSize: 12,
  },
  infoDesc: {
    fontSize: 14,
    opacity: 0.8,
  },
  statCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  pointsBadge: {
    backgroundColor: 'rgba(0, 150, 136, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pointsText: {
    color: '#009688',
    fontWeight: 'bold',
    fontSize: 14,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
  }
});
