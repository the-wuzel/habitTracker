import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Habit, HabitLevel, HabitLog } from '../types/habit';
import Colors from '../constants/Colors';

interface HabitCardProps {
  habit: Habit;
  todayLog?: HabitLog;
  onLogHabit: (habitId: string, level: HabitLevel) => void;
}

export default function HabitCard({ habit, todayLog, onLogHabit }: HabitCardProps) {
  const isLogged = !!todayLog;
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.surfaceVariant }]}>
        <View style={styles.cardContent}>
          <Text style={[styles.title, { color: colors.text }]}>{habit.name}</Text>
          
          <View style={styles.descriptionContainer}>
            <Text style={[styles.description, { color: colors.outline }]}>{habit.description}</Text>
          </View>
          
          <View style={styles.buttonRow}>
            <View style={styles.buttonColumn}>
              {todayLog?.level === HabitLevel.Mini ? (
                <TouchableOpacity style={[styles.buttonActive, { backgroundColor: colors.primaryContainer }]} onPress={() => onLogHabit(habit.id, HabitLevel.Mini)}>
                  <Text style={[styles.buttonActiveText, { color: colors.onPrimaryContainer }]}>Mini</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.buttonOutline, { borderColor: colors.outline }]} onPress={() => onLogHabit(habit.id, HabitLevel.Mini)}>
                  <Text style={[styles.buttonOutlineText, { color: colors.primary }]}>Mini</Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.goalText, { color: colors.secondary }]} numberOfLines={2} ellipsizeMode="tail">{habit.miniGoal}</Text>
            </View>
            
            <View style={styles.buttonColumn}>
              {todayLog?.level === HabitLevel.Plus ? (
                <TouchableOpacity style={[styles.buttonActive, { backgroundColor: colors.primaryContainer }]} onPress={() => onLogHabit(habit.id, HabitLevel.Plus)}>
                  <Text style={[styles.buttonActiveText, { color: colors.onPrimaryContainer }]}>Plus</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.buttonOutline, { borderColor: colors.outline }]} onPress={() => onLogHabit(habit.id, HabitLevel.Plus)}>
                  <Text style={[styles.buttonOutlineText, { color: colors.primary }]}>Plus</Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.goalText, { color: colors.secondary }]} numberOfLines={2} ellipsizeMode="tail">{habit.plusGoal}</Text>
            </View>
            
            <View style={styles.buttonColumn}>
              {todayLog?.level === HabitLevel.Elite ? (
                <TouchableOpacity style={[styles.buttonActive, { backgroundColor: colors.primaryContainer }]} onPress={() => onLogHabit(habit.id, HabitLevel.Elite)}>
                  <Text style={[styles.buttonActiveText, { color: colors.onPrimaryContainer }]}>Elite</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.buttonOutline, { borderColor: colors.outline }]} onPress={() => onLogHabit(habit.id, HabitLevel.Elite)}>
                  <Text style={[styles.buttonOutlineText, { color: colors.primary }]}>Elite</Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.goalText, { color: colors.secondary }]} numberOfLines={2} ellipsizeMode="tail">{habit.eliteGoal}</Text>
            </View>
          </View>
          
          {isLogged && (
            <View style={styles.logTextContainer}>
              <Text style={[styles.logText, { color: colors.secondary }]}>
                Logged today as {todayLog.level}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
  },
  card: {
    borderRadius: 16, // MD3 standard for cards
    elevation: 1, // MD3 elevation level 1
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 16, // MD3 Title Medium
    fontWeight: '500',
    letterSpacing: 0.15,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  description: {
    fontSize: 14, // MD3 Body Medium
    letterSpacing: 0.25,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
    justifyContent: 'space-between',
    gap: 8,
  },
  buttonColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  goalText: {
    fontSize: 10,
    textAlign: 'center',
  },
  logTextContainer: {
    marginTop: 16,
  },
  logText: {
    fontSize: 12, // MD3 Label Medium
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  buttonActive: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 100, // MD3 fully rounded
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 100, // MD3 fully rounded
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActiveText: {
    fontWeight: '500',
    fontSize: 14, // MD3 Label Large
    letterSpacing: 0.1,
  },
  buttonOutlineText: {
    fontWeight: '500',
    fontSize: 14, // MD3 Label Large
    letterSpacing: 0.1,
  }
});
