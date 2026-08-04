import React, { useEffect } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, View, Text, useColorScheme, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

import HabitCard from '../../components/HabitCard';
import { useHabitStore } from '../../store/habitStore';

export default function TabOneScreen() {
  const { habits, todayLogs, currentDate, isLoading, init, setDate, logHabit } = useHabitStore();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  useEffect(() => {
    init();
  }, [init]);

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
          <Text style={[styles.headerText, { color: colors.text }]}>{currentDate === new Date().toISOString().split('T')[0] ? "Today's Habits" : currentDate}</Text>
          <TouchableOpacity onPress={handleNextDay} style={styles.navButton}>
            <MaterialIcons name="chevron-right" color={colors.primary} size={24} />
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
