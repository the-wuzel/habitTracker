import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Colors from '../constants/Colors';
import { useHabitStore } from '../store/habitStore';
import { Habit, HabitLevel, HabitLog, HabitOption } from '../types/habit';

interface HabitCardProps {
  habit: Habit;
  todayLog?: HabitLog;
  streak?: number;
  last7Days?: { date: string, level: HabitLevel | null }[];
  onLogHabit: (habitId: string, level: HabitLevel, notes?: string, optionId?: string) => void;
  onRemoveLog: (habitId: string) => void;
}

export default function HabitCard({ habit, todayLog, streak = 0, last7Days = [], onLogHabit, onRemoveLog }: HabitCardProps) {
  const isLogged = !!todayLog;
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { enableLateralFlexibility } = useHabitStore();

  const hasOptions = enableLateralFlexibility && habit.options && habit.options.length > 1;
  const defaultOption = habit.options && habit.options.length > 0 ? habit.options[0] : (habit as unknown as HabitOption);
  
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    todayLog?.optionId || (habit.options?.[0]?.id ?? 'default')
  );

  // Update selected option if log changes externally
  useEffect(() => {
    if (todayLog?.optionId) {
      setSelectedOptionId(todayLog.optionId);
    }
  }, [todayLog]);

  const currentOption = hasOptions 
    ? habit.options!.find(o => o.id === selectedOptionId) || habit.options![0]
    : defaultOption;

  const handleLogHabit = (level: HabitLevel) => {
    onLogHabit(habit.id, level, undefined, hasOptions ? selectedOptionId : undefined);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.surfaceVariant }]}>
        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]}>{habit.name}</Text>
            {streak > 0 && (
              <View style={styles.streakContainer}>
                <MaterialIcons name="local-fire-department" size={18} color="#FF9800" />
                <Text style={styles.streakText}>{streak}</Text>
              </View>
            )}
          </View>
          
          {!!habit.description && (
            <View style={styles.descriptionContainer}>
              <Text style={[styles.description, { color: colors.outline }]}>{habit.description}</Text>
            </View>
          )}

          {hasOptions && (
            <View style={styles.optionsScrollContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsRow}>
                {habit.options!.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.optionChip,
                      { borderColor: colors.outline },
                      selectedOptionId === opt.id && { backgroundColor: colors.primaryContainer, borderColor: colors.primaryContainer }
                    ]}
                    onPress={() => setSelectedOptionId(opt.id)}
                  >
                    <Text 
                      style={[
                        styles.optionChipText, 
                        { color: selectedOptionId === opt.id ? colors.onPrimaryContainer : colors.outline }
                      ]}
                    >
                      {opt.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          
          <View style={styles.buttonRow}>
            <View style={styles.buttonColumn}>
              {todayLog?.level === HabitLevel.Mini ? (
                <TouchableOpacity style={[styles.buttonActive, { backgroundColor: colors.primaryContainer }]} onPress={() => onRemoveLog(habit.id)}>
                  <Text style={[styles.buttonActiveText, { color: colors.onPrimaryContainer }]}>Mini</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.buttonOutline, { borderColor: colors.outline }]} onPress={() => handleLogHabit(HabitLevel.Mini)}>
                  <Text style={[styles.buttonOutlineText, { color: colors.primary }]}>Mini</Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.goalText, { color: colors.secondary }]} numberOfLines={2} ellipsizeMode="tail">{currentOption.miniGoal}</Text>
            </View>
            
            <View style={styles.buttonColumn}>
              {todayLog?.level === HabitLevel.Plus ? (
                <TouchableOpacity style={[styles.buttonActive, { backgroundColor: colors.primaryContainer }]} onPress={() => onRemoveLog(habit.id)}>
                  <Text style={[styles.buttonActiveText, { color: colors.onPrimaryContainer }]}>Plus</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.buttonOutline, { borderColor: colors.outline }]} onPress={() => handleLogHabit(HabitLevel.Plus)}>
                  <Text style={[styles.buttonOutlineText, { color: colors.primary }]}>Plus</Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.goalText, { color: colors.secondary }]} numberOfLines={2} ellipsizeMode="tail">{currentOption.plusGoal}</Text>
            </View>
            
            <View style={styles.buttonColumn}>
              {todayLog?.level === HabitLevel.Elite ? (
                <TouchableOpacity style={[styles.buttonActive, { backgroundColor: colors.primaryContainer }]} onPress={() => onRemoveLog(habit.id)}>
                  <Text style={[styles.buttonActiveText, { color: colors.onPrimaryContainer }]}>Elite</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.buttonOutline, { borderColor: colors.outline }]} onPress={() => handleLogHabit(HabitLevel.Elite)}>
                  <Text style={[styles.buttonOutlineText, { color: colors.primary }]}>Elite</Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.goalText, { color: colors.secondary }]} numberOfLines={2} ellipsizeMode="tail">{currentOption.eliteGoal}</Text>
            </View>
          </View>
          
          {last7Days.length > 0 && (
            <View style={styles.historyContainer}>
              {last7Days.map((day, idx) => {
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
  optionsScrollContainer: {
    marginTop: 12,
    marginBottom: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  optionChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 16,
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  streakText: {
    color: '#FF9800',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 12,
  },
  historyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  historyCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyText: {
    fontSize: 12,
    fontWeight: 'bold',
  }
});
