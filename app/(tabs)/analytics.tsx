import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useHabitStore } from '@/store/habitStore';
import { HabitLevel } from '@/types/habit';
import { calculatePeriodStats } from '@/utils/score';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';



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

    const lastDayOfMonth = new Date(Date.UTC(parseInt(year), parseInt(month), 0)).getUTCDate();
    let endDay = isFirstHalf ? '15' : lastDayOfMonth.toString();
    
    return {
      periodStart: viewedPeriodStart,
      periodEnd: `${year}-${month}-${endDay}`,
      periodLabel: `${monthName} ${isFirstHalf ? '1-15' : `16-${lastDayOfMonth}`}, ${year}`
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
    // Filter logs for the active period
    const periodLogs = allLogs.filter(l => l.date >= periodStart && l.date <= periodEnd);
    return calculatePeriodStats(habits, periodLogs, currentDate, periodEnd);
  }, [habits, allLogs, currentDate, periodStart, periodEnd]);

  const periodProgress = useMemo(() => {
    const days: string[] = [];
    const [year, month, startDay] = periodStart.split('-');
    const endDay = parseInt(periodEnd.split('-')[2]);
    for (let d = parseInt(startDay); d <= endDay; d++) {
      days.push(`${year}-${month}-${d.toString().padStart(2, '0')}`);
    }
    
    return habits.map(habit => {
      let miniCount = 0;
      let plusCount = 0;
      let eliteCount = 0;
      let totalCount = 0;
      
      const progress = days.map(day => {
        const log = allLogs.find(l => l.habitId === habit.id && l.date === day);
        if (log) {
          if (log.level === HabitLevel.Mini) miniCount++;
          if (log.level === HabitLevel.Plus) plusCount++;
          if (log.level === HabitLevel.Elite) eliteCount++;
          totalCount++;
        }
        return { date: day, level: log?.level || null };
      });
      
      return {
        habit,
        progress,
        counts: { mini: miniCount, plus: plusCount, elite: eliteCount, total: totalCount }
      };
    });
  }, [periodStart, periodEnd, habits, allLogs]);

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

      {habitStats.length > 0 && (
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Period Progress</Text>
      )}

      {habitStats.length > 0 && periodProgress.length > 0 && (
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
          
          <View style={{ gap: 8 }}>
            {periodProgress.map((pp, index) => (
              <View key={`grid-${index}`} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '600', width: 65, marginRight: 8, color: colors.text }} numberOfLines={1}>
                  {pp.habit.name}
                </Text>
                <View style={[styles.progressRow, { paddingBottom: 0, flex: 1 }]}>
                  {pp.progress.map((day, idx) => {
                    let initial = '';
                    let bgColor = 'transparent';
                    let textColor = colors.outline;
                    let borderColor = colors.outline;

                    if (day.level === HabitLevel.Mini) {
                      initial = 'M'; bgColor = colors.primaryContainer; textColor = colors.onPrimaryContainer; borderColor = colors.primaryContainer;
                    } else if (day.level === HabitLevel.Plus) {
                      initial = 'P'; bgColor = colors.primaryContainer; textColor = colors.onPrimaryContainer; borderColor = colors.primaryContainer;
                    } else if (day.level === HabitLevel.Elite) {
                      initial = 'E'; bgColor = colors.primaryContainer; textColor = colors.onPrimaryContainer; borderColor = colors.primaryContainer;
                    }
                    
                    return (
                      <View key={idx} style={[styles.historyCircle, { backgroundColor: bgColor, borderColor }]}>
                        <Text style={[styles.historyText, { color: textColor }]}>{initial}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', gap: 8 }}>
            {periodProgress.map((pp, index) => (
              <View key={`counts-${index}`} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '600', width: 65, marginRight: 8, color: colors.text }} numberOfLines={1}>
                  {pp.habit.name}
                </Text>
                <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between' }}>
                  <Text style={[styles.countText, { color: colors.text }]}>M:{pp.counts.mini}</Text>
                  <Text style={[styles.countText, { color: colors.text }]}>P:{pp.counts.plus}</Text>
                  <Text style={[styles.countText, { color: colors.text }]}>E:{pp.counts.elite}</Text>
                  <Text style={[styles.countText, { color: colors.primary, fontWeight: 'bold' }]}>Tot:{pp.counts.total}</Text>
                </View>
              </View>
            ))}

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', width: 65, marginRight: 8, color: colors.primary }}>
                Total
              </Text>
              <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between' }}>
                <Text style={[styles.countText, { color: colors.primary, fontWeight: '600' }]}>M:{periodProgress.reduce((sum, pp) => sum + pp.counts.mini, 0)}</Text>
                <Text style={[styles.countText, { color: colors.primary, fontWeight: '600' }]}>P:{periodProgress.reduce((sum, pp) => sum + pp.counts.plus, 0)}</Text>
                <Text style={[styles.countText, { color: colors.primary, fontWeight: '600' }]}>E:{periodProgress.reduce((sum, pp) => sum + pp.counts.elite, 0)}</Text>
                <Text style={[styles.countText, { color: colors.primary, fontWeight: 'bold' }]}>Tot:{periodProgress.reduce((sum, pp) => sum + pp.counts.total, 0)}</Text>
              </View>
            </View>
          </View>

        </View>
      )}

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
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  historyCircle: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  countsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  countText: {
    fontSize: 12,
  }
});
