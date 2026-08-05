import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, View, Text, useColorScheme, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

import HabitCard from '../../components/HabitCard';
import { useHabitStore } from '../../store/habitStore';
import { calculatePeriodStats, calculateStreak } from '../../utils/score';

export default function TabOneScreen() {
  const { habits, todayLogs, currentDate, isLoading, init, setDate, logHabit, removeLog, allLogs } = useHabitStore();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [isSimplifiedView, setIsSimplifiedView] = useState(false);

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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePrevDay} style={styles.navButton}>
            <MaterialIcons name="chevron-left" color={colors.primary} size={24} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: colors.text, flex: 1, textAlign: 'center' }]} numberOfLines={1}>
            {currentDate === new Date().toISOString().split('T')[0] ? "Today's Habits" : currentDate}
          </Text>
          <TouchableOpacity onPress={handleNextDay} style={styles.navButton}>
            <MaterialIcons name="chevron-right" color={colors.primary} size={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsSimplifiedView(!isSimplifiedView)} style={[styles.navButton, { marginLeft: 8 }]}>
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
              const d = new Date(currentDate);
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
                onLogHabit={logHabit}
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
