import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Colors from '../../constants/Colors';

import BonusOverlay from '../../components/BonusOverlay';
import HabitCard from '../../components/HabitCard';
import { useHabitStore } from '../../store/habitStore';
import { HabitLevel, HabitLog } from '../../types/habit';
import { calculatePeriodStats, calculateStreak } from '../../utils/score';

const formatHeaderDate = (dateString: string) => {
  const today = new Date().toISOString().split('T')[0];
  if (dateString === today) return "Today's Habits";
  
  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterday = yesterdayObj.toISOString().split('T')[0];
  if (dateString === yesterday) return "Yesterday's Habits";

  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrow = tomorrowObj.toISOString().split('T')[0];
  if (dateString === tomorrow) return "Tomorrow's Habits";

  const [year, month, day] = dateString.split('-');
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayOfWeek = days[dateObj.getDay()];
  const currentYear = new Date().getFullYear().toString();
  const yearStr = year !== currentYear ? `, ${year}` : '';
  
  return `${dayOfWeek}, ${months[parseInt(month) - 1]} ${parseInt(day)}${yearStr}`;
};

export default function TabOneScreen() {
  const { habits, todayLogs, currentDate, isLoading, init, setDate, logHabit, removeLog, allLogs } = useHabitStore();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [isSimplifiedView, setIsSimplifiedView] = useState(false);
  const [recentBonuses, setRecentBonuses] = useState<{title: string, description: string}[]>([]);

  useEffect(() => {
    init();
  }, [init]);

  const { periodScore } = useMemo(() => {
    if (!habits || !allLogs) return { periodScore: 0 };
    
    // Determine period based on currentDate
    const [year, month, day] = currentDate.split('-');
    const isFirstHalf = parseInt(day) <= 15;
    const periodStart = `${year}-${month}-01`;
    const endDay = isFirstHalf ? '15' : '30';
    const periodEnd = `${year}-${month}-${endDay}`;
    
    const periodLogs = allLogs.filter(l => l.date >= periodStart && l.date <= periodEnd);
    const stats = calculatePeriodStats(habits, periodLogs, currentDate, periodEnd);
    
    return { periodScore: stats.totalScore };
  }, [habits, allLogs, currentDate]);

  const handlePrevDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1);
    setDate(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    setDate(date.toISOString().split('T')[0]);
  };

  const handleGoToToday = () => {
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleLogHabit = (habitId: string, level: HabitLevel, notes?: string, optionId?: string) => {
    const [year, month, day] = currentDate.split('-');
    const isFirstHalf = parseInt(day) <= 15;
    const periodStart = `${year}-${month}-01`;
    const endDay = isFirstHalf ? '15' : '30';
    const periodEnd = `${year}-${month}-${endDay}`;
    const periodLogsBefore = allLogs.filter(l => l.date >= periodStart && l.date <= periodEnd);
    
    const statsBefore = calculatePeriodStats(habits, periodLogsBefore, currentDate, periodEnd);
    
    // Perform log
    logHabit(habitId, level, notes, optionId);
    
    // Simulate what the stats are after log
    const newLog: HabitLog = {
      id: 'temp',
      habitId,
      date: currentDate,
      level,
      notes,
      optionId,
    };
    
    const periodLogsAfter = [
      ...periodLogsBefore.filter(l => !(l.habitId === habitId && l.date === currentDate)), 
      newLog
    ];
    const statsAfter = calculatePeriodStats(habits, periodLogsAfter, currentDate, periodEnd);
    
    const newlyAchieved: {title: string, description: string}[] = [];
    if (statsAfter.bonusCounts.specialist > statsBefore.bonusCounts.specialist) newlyAchieved.push({ title: 'Specialist', description: '10 Elite wins for one habit' });
    if (statsAfter.bonusCounts.hotStreak3 > statsBefore.bonusCounts.hotStreak3) newlyAchieved.push({ title: 'Hot Streak', description: '3 consecutive Elite wins' });
    if (statsAfter.bonusCounts.hotStreak7 > statsBefore.bonusCounts.hotStreak7) newlyAchieved.push({ title: 'Unfreakinbelievable', description: '7 consecutive Elite wins' });
    if (statsAfter.bonusCounts.habitMaster > statsBefore.bonusCounts.habitMaster) newlyAchieved.push({ title: 'Habit Master', description: '15-day streak (Consistency!)' });
    if (statsAfter.bonusCounts.bigHitter > statsBefore.bonusCounts.bigHitter) newlyAchieved.push({ title: 'Big Hitter', description: '15 Elite wins across habits' });
    if (statsAfter.bonusCounts.perfectDay > statsBefore.bonusCounts.perfectDay) newlyAchieved.push({ title: 'Perfect Day', description: 'Elite win for all habits' });

    if (newlyAchieved.length > 0) {
      setRecentBonuses(newlyAchieved);
    }
  };

  const isToday = currentDate === new Date().toISOString().split('T')[0];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <BonusOverlay bonuses={recentBonuses} onDismiss={() => setRecentBonuses([])} />
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePrevDay} style={styles.navButton}>
            <MaterialIcons name="chevron-left" color={colors.primary} size={24} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: colors.text, flex: 1, textAlign: 'center' }]} numberOfLines={1}>
            {formatHeaderDate(currentDate)}
          </Text>
          <TouchableOpacity onPress={handleNextDay} style={styles.navButton}>
            <MaterialIcons name="chevron-right" color={colors.primary} size={24} />
          </TouchableOpacity>
          {!isToday && (
            <TouchableOpacity onPress={handleGoToToday} style={[styles.navButton, { marginLeft: 4 }]}>
              <MaterialIcons name="today" color={colors.primary} size={24} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setIsSimplifiedView(!isSimplifiedView)} style={[styles.navButton, { marginLeft: 4 }]}>
            <MaterialIcons name={isSimplifiedView ? "visibility-off" : "visibility"} color={colors.primary} size={24} />
          </TouchableOpacity>
        </View>

        {!isSimplifiedView && (
          <View style={[styles.compactScoreCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
            <MaterialIcons name="emoji-events" size={24} color={colors.primary} />
            <Text style={[styles.compactScoreText, { color: colors.text }]}>Total Elastic Score:</Text>
            <Text style={[styles.compactScoreValue, { color: colors.primary }]}>{periodScore}</Text>
          </View>
        )}
        
        {currentDate.endsWith('-31') && (
          <View style={[styles.freeDayBanner, { backgroundColor: 'rgba(0, 150, 136, 0.1)', borderColor: colors.primary }]}>
            <MaterialIcons name="celebration" size={24} color={colors.primary} />
            <Text style={[styles.freeDayText, { color: colors.primary }]}>
              Today is a Free Day! You don't need to track anything.
            </Text>
          </View>
        )}
        
        {habits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 16, color: colors.secondary }}>
              No habits found. Start by creating one!
            </Text>
          </View>
        ) : (
          habits.map((habit) => {
            const todayLog = todayLogs.find((log) => log.habitId === habit.id);
            const hLogs = allLogs.filter(l => l.habitId === habit.id);
            const streak = calculateStreak(hLogs, currentDate);
            
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const dateStr = d.toISOString().split('T')[0];
              const logForDay = hLogs.find(l => l.date === dateStr);
              last7Days.push({
                date: dateStr,
                level: logForDay ? logForDay.level : null
              });
            }

            return (
               <HabitCard
                key={habit.id}
                habit={habit}
                todayLog={todayLog}
                streak={isSimplifiedView ? 0 : streak}
                last7Days={isSimplifiedView ? [] : last7Days}
                onLogHabit={handleLogHabit}
                onRemoveLog={removeLog}
              />
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: 8,
    paddingBottom: 40,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    padding: 8,
  },
  headerText: {
    fontSize: 24, // MD3 Headline Small
    fontWeight: '400',
    letterSpacing: 0,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  compactScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  compactScoreText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  compactScoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  freeDayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  freeDayText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
