import React, { useEffect } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, View, Text, useColorScheme } from 'react-native';
import Colors from '../../constants/Colors';

import HabitCard from '../../components/HabitCard';
import { useHabitStore } from '../../store/habitStore';

export default function TabOneScreen() {
  const { habits, todayLogs, isLoading, init, logHabit } = useHabitStore();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  useEffect(() => {
    init();
  }, [init]);

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
          <Text style={[styles.headerText, { color: colors.text }]}>Today's Habits</Text>
        </View>
        
        {habits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 16, color: colors.secondary }}>
              No habits found. Start by creating one!
            </Text>
          </View>
        ) : (
          habits.map((habit) => {
            const todayLog = todayLogs.find((log) => log.habitId === habit.id);
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                todayLog={todayLog}
                onLogHabit={logHabit}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
