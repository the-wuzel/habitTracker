import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Text } from './Themed';
import Colors, { HabitColors } from '../constants/Colors';
import { useHabitStore } from '../store/habitStore';
import { Habit, HabitLevel, HabitLog, HabitOption } from '../types/habit';
import { useColorScheme } from './useColorScheme';

interface HabitCardProps {
  habit: Habit;
  todayLog?: HabitLog;
  streak?: number;
  last7Days?: { date: string, level: HabitLevel | null, log?: HabitLog }[];
  onLogHabit: (habitId: string, level: HabitLevel, notes?: string, optionId?: string, logDate?: string) => void;
  onRemoveLog: (habitId: string, dateStr?: string) => void;
}

export default function HabitCard({ habit, todayLog, streak = 0, last7Days = [], onLogHabit, onRemoveLog }: HabitCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { enableLateralFlexibility, compactMode } = useHabitStore();

  const habitColorPalette = HabitColors[habit.color || 'purple']?.[colorScheme] || HabitColors.purple[colorScheme];

  const hasOptions = enableLateralFlexibility && habit.options && habit.options.length > 1;
  const defaultOption = habit.options && habit.options.length > 0 ? habit.options[0] : (habit as unknown as HabitOption);
  
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    todayLog?.optionId || (habit.options?.[0]?.id ?? 'default')
  );
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);

  // Update selected option if log changes externally
  useEffect(() => {
    if (todayLog?.optionId) {
      setSelectedOptionId(todayLog.optionId);
    }
  }, [todayLog]);

  useEffect(() => {
    if (selectedHistoryDate) {
      const dayData = last7Days.find(d => d.date === selectedHistoryDate);
      if (dayData?.log?.optionId) {
        setSelectedOptionId(dayData.log.optionId);
      } else if (habit.options?.[0]?.id) {
        setSelectedOptionId(habit.options[0].id);
      }
    }
  }, [selectedHistoryDate, last7Days]);

  const currentOption = hasOptions 
    ? habit.options!.find(o => o.id === selectedOptionId) || habit.options![0]
    : defaultOption;

  const isTodayLogActive = !hasOptions || todayLog?.optionId === selectedOptionId;

  const handleLogHabit = (level: HabitLevel) => {
    onLogHabit(habit.id, level, undefined, hasOptions ? selectedOptionId : undefined);
  };

  const renderModal = () => {
    if (!selectedHistoryDate) return null;
    
    const dayData = last7Days.find(d => d.date === selectedHistoryDate);
    const dayLog = dayData?.log;
    const isDayLogActive = !hasOptions || dayLog?.optionId === selectedOptionId;
    
    return (
      <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setSelectedHistoryDate(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedHistoryDate(null)}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalDialog, { backgroundColor: colors.surface }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={[styles.title, { color: colors.text }]}>{habit.name}</Text>
                <Text style={{ color: colors.secondary }}>{selectedHistoryDate}</Text>
              </View>

              {hasOptions && (
                <View style={[styles.optionsScrollContainer, { marginTop: 0 }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionsRow}>
                    {habit.options!.map((opt) => {
                      const isCompleted = opt.id === dayLog?.optionId;
                      const isSelected = selectedOptionId === opt.id;
                      
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[
                            styles.optionChip,
                            { borderColor: colors.outlineVariant },
                            isSelected && { backgroundColor: habitColorPalette.primaryContainer, borderColor: habitColorPalette.primaryContainer },
                            isCompleted && !isSelected && { borderColor: habitColorPalette.primaryContainer, borderWidth: 1.5, paddingVertical: 5.5, paddingHorizontal: 11.5 },
                          ]}
                          onPress={() => setSelectedOptionId(opt.id)}
                        >
                          <Text 
                            style={[
                              styles.optionChipText, 
                              { color: colors.outline },
                              isSelected && { color: habitColorPalette.onPrimaryContainer },
                              isCompleted && !isSelected && { color: habitColorPalette.onPrimaryContainer, fontWeight: 'bold' },
                            ]}
                          >
                            {opt.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              <View style={styles.buttonRow}>
                <View style={styles.buttonColumn}>
                  {dayLog?.level === HabitLevel.Mini ? (
                    <TouchableOpacity 
                      style={[
                        isDayLogActive ? styles.buttonActive : styles.buttonOutline, 
                        isDayLogActive 
                          ? { backgroundColor: habitColorPalette.primaryContainer } 
                          : { borderColor: habitColorPalette.primaryContainer, borderWidth: 1.5, paddingVertical: 9.5, paddingHorizontal: 23.5 }
                      ]} 
                      onPress={() => onRemoveLog(habit.id, selectedHistoryDate)}
                    >
                      <Text style={[
                        isDayLogActive ? styles.buttonActiveText : styles.buttonOutlineText, 
                        isDayLogActive 
                          ? { color: habitColorPalette.onPrimaryContainer }
                          : { color: habitColorPalette.onPrimaryContainer, fontWeight: 'bold' }
                      ]}>Mini</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={[
                        styles.buttonOutline, 
                        { borderColor: colors.outlineVariant }
                      ]} onPress={() => onLogHabit(habit.id, HabitLevel.Mini, undefined, hasOptions ? selectedOptionId : undefined, selectedHistoryDate)}>
                      <Text style={[styles.buttonOutlineText, { color: habitColorPalette.primary }]}>Mini</Text>
                    </TouchableOpacity>
                  )}
                  <Text style={[styles.goalText, { color: colors.secondary }]} numberOfLines={2} ellipsizeMode="tail">{currentOption.miniGoal}</Text>
                </View>

                <View style={styles.buttonColumn}>
                  {dayLog?.level === HabitLevel.Plus ? (
                    <TouchableOpacity 
                      style={[
                        isDayLogActive ? styles.buttonActive : styles.buttonOutline, 
                        isDayLogActive 
                          ? { backgroundColor: habitColorPalette.primaryContainer } 
                          : { borderColor: habitColorPalette.primaryContainer, borderWidth: 1.5, paddingVertical: 9.5, paddingHorizontal: 23.5 }
                      ]} 
                      onPress={() => onRemoveLog(habit.id, selectedHistoryDate)}
                    >
                      <Text style={[
                        isDayLogActive ? styles.buttonActiveText : styles.buttonOutlineText, 
                        isDayLogActive 
                          ? { color: habitColorPalette.onPrimaryContainer }
                          : { color: habitColorPalette.onPrimaryContainer, fontWeight: 'bold' }
                      ]}>Plus</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={[
                        styles.buttonOutline, 
                        { borderColor: colors.outlineVariant }
                      ]} onPress={() => onLogHabit(habit.id, HabitLevel.Plus, undefined, hasOptions ? selectedOptionId : undefined, selectedHistoryDate)}>
                      <Text style={[styles.buttonOutlineText, { color: habitColorPalette.primary }]}>Plus</Text>
                    </TouchableOpacity>
                  )}
                  <Text style={[styles.goalText, { color: colors.secondary }]} numberOfLines={2} ellipsizeMode="tail">{currentOption.plusGoal}</Text>
                </View>

                <View style={styles.buttonColumn}>
                  {dayLog?.level === HabitLevel.Elite ? (
                    <TouchableOpacity 
                      style={[
                        isDayLogActive ? styles.buttonActive : styles.buttonOutline, 
                        isDayLogActive 
                          ? { backgroundColor: habitColorPalette.primaryContainer } 
                          : { borderColor: habitColorPalette.primaryContainer, borderWidth: 1.5, paddingVertical: 9.5, paddingHorizontal: 23.5 }
                      ]} 
                      onPress={() => onRemoveLog(habit.id, selectedHistoryDate)}
                    >
                      <Text style={[
                        isDayLogActive ? styles.buttonActiveText : styles.buttonOutlineText, 
                        isDayLogActive 
                          ? { color: habitColorPalette.onPrimaryContainer }
                          : { color: habitColorPalette.onPrimaryContainer, fontWeight: 'bold' }
                      ]}>Elite</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={[
                        styles.buttonOutline, 
                        { borderColor: colors.outlineVariant }
                      ]} onPress={() => onLogHabit(habit.id, HabitLevel.Elite, undefined, hasOptions ? selectedOptionId : undefined, selectedHistoryDate)}>
                      <Text style={[styles.buttonOutlineText, { color: habitColorPalette.primary }]}>Elite</Text>
                    </TouchableOpacity>
                  )}
                  <Text style={[styles.goalText, { color: colors.secondary }]} numberOfLines={2} ellipsizeMode="tail">{currentOption.eliteGoal}</Text>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    );
  };

  if (compactMode) {
    return (
      <View style={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.elevation.level1, paddingHorizontal: 16, paddingVertical: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[styles.title, { color: colors.text, flex: 1, marginRight: 8 }]} numberOfLines={1}>{habit.name}</Text>
            
            {last7Days.length > 0 && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {last7Days.map((day, idx) => {
                  let initial = '';
                  let bgColor = 'transparent';
                  let textColor = colors.outline;
                  let borderColor = colors.outline;
                  const isTodayStr = new Date().toISOString().split('T')[0] === day.date;

                  if (day.level === HabitLevel.Mini) {
                    initial = 'M'; bgColor = habitColorPalette.primaryContainer; textColor = habitColorPalette.onPrimaryContainer; borderColor = habitColorPalette.primaryContainer;
                  } else if (day.level === HabitLevel.Plus) {
                    initial = 'P'; bgColor = habitColorPalette.primaryContainer; textColor = habitColorPalette.onPrimaryContainer; borderColor = habitColorPalette.primaryContainer;
                  } else if (day.level === HabitLevel.Elite) {
                    initial = 'E'; bgColor = habitColorPalette.primaryContainer; textColor = habitColorPalette.onPrimaryContainer; borderColor = habitColorPalette.primaryContainer;
                  }
                  
                  return (
                    <TouchableOpacity 
                      key={idx} 
                      onPress={() => setSelectedHistoryDate(day.date)}
                      style={[
                        styles.historyCircle, 
                        { width: 24, height: 24, borderRadius: 12 },
                        { backgroundColor: bgColor, borderColor },
                        isTodayStr && { borderWidth: 2, borderColor: habitColorPalette.primary }
                      ]}
                    >
                      <Text style={[
                        styles.historyText, 
                        { fontSize: 10 },
                        { color: textColor }
                      ]}>{initial}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>
        {renderModal()}
      </View>
    );
  }

  // Non-compact layout
  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.elevation.level1 }]}>
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
                {habit.options!.map((opt) => {
                  const isCompleted = opt.id === todayLog?.optionId;
                  const isSelected = selectedOptionId === opt.id;
                  
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.optionChip,
                        { borderColor: colors.outlineVariant },
                        isSelected && { backgroundColor: habitColorPalette.primaryContainer, borderColor: habitColorPalette.primaryContainer },
                        isCompleted && !isSelected && { borderColor: habitColorPalette.primaryContainer, borderWidth: 1.5, paddingVertical: 5.5, paddingHorizontal: 11.5 },
                      ]}
                      onPress={() => setSelectedOptionId(opt.id)}
                    >
                    <Text 
                      style={[
                        styles.optionChipText, 
                        { color: colors.outline },
                        isSelected && { color: habitColorPalette.onPrimaryContainer },
                        isCompleted && !isSelected && { color: habitColorPalette.onPrimaryContainer, fontWeight: 'bold' },
                      ]}
                    >
                      {opt.name}
                    </Text>
                  </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
          
          <View style={styles.buttonRow}>
            <View style={styles.buttonColumn}>
              {todayLog?.level === HabitLevel.Mini ? (
                <TouchableOpacity 
                  style={[
                    isTodayLogActive ? styles.buttonActive : styles.buttonOutline, 
                    isTodayLogActive 
                      ? { backgroundColor: habitColorPalette.primaryContainer } 
                      : { borderColor: habitColorPalette.primaryContainer, borderWidth: 1.5, paddingVertical: 9.5, paddingHorizontal: 23.5 }
                  ]} 
                  onPress={() => onRemoveLog(habit.id)}
                >
                  <Text style={[
                    isTodayLogActive ? styles.buttonActiveText : styles.buttonOutlineText, 
                    isTodayLogActive 
                      ? { color: habitColorPalette.onPrimaryContainer }
                      : { color: habitColorPalette.onPrimaryContainer, fontWeight: 'bold' }
                  ]}>
                    Mini
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[
                    styles.buttonOutline, 
                    { borderColor: colors.outlineVariant }
                  ]} onPress={() => handleLogHabit(HabitLevel.Mini)}>
                  <Text style={[styles.buttonOutlineText, { color: habitColorPalette.primary }]}>Mini</Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.goalText, { color: colors.secondary }]} numberOfLines={2} ellipsizeMode="tail">{currentOption.miniGoal}</Text>
            </View>
            
            <View style={styles.buttonColumn}>
              {todayLog?.level === HabitLevel.Plus ? (
                <TouchableOpacity 
                  style={[
                    isTodayLogActive ? styles.buttonActive : styles.buttonOutline, 
                    isTodayLogActive 
                      ? { backgroundColor: habitColorPalette.primaryContainer } 
                      : { borderColor: habitColorPalette.primaryContainer, borderWidth: 1.5, paddingVertical: 9.5, paddingHorizontal: 23.5 }
                  ]} 
                  onPress={() => onRemoveLog(habit.id)}
                >
                  <Text style={[
                    isTodayLogActive ? styles.buttonActiveText : styles.buttonOutlineText, 
                    isTodayLogActive 
                      ? { color: habitColorPalette.onPrimaryContainer }
                      : { color: habitColorPalette.onPrimaryContainer, fontWeight: 'bold' }
                  ]}>
                    Plus
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[
                    styles.buttonOutline, 
                    { borderColor: colors.outlineVariant }
                  ]} onPress={() => handleLogHabit(HabitLevel.Plus)}>
                  <Text style={[styles.buttonOutlineText, { color: habitColorPalette.primary }]}>Plus</Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.goalText, { color: colors.secondary }]} numberOfLines={2} ellipsizeMode="tail">{currentOption.plusGoal}</Text>
            </View>
            
            <View style={styles.buttonColumn}>
              {todayLog?.level === HabitLevel.Elite ? (
                <TouchableOpacity 
                  style={[
                    isTodayLogActive ? styles.buttonActive : styles.buttonOutline, 
                    isTodayLogActive 
                      ? { backgroundColor: habitColorPalette.primaryContainer } 
                      : { borderColor: habitColorPalette.primaryContainer, borderWidth: 1.5, paddingVertical: 9.5, paddingHorizontal: 23.5 }
                  ]} 
                  onPress={() => onRemoveLog(habit.id)}
                >
                  <Text style={[
                    isTodayLogActive ? styles.buttonActiveText : styles.buttonOutlineText, 
                    isTodayLogActive 
                      ? { color: habitColorPalette.onPrimaryContainer }
                      : { color: habitColorPalette.onPrimaryContainer, fontWeight: 'bold' }
                  ]}>
                    Elite
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[
                    styles.buttonOutline, 
                    { borderColor: colors.outlineVariant }
                  ]} onPress={() => handleLogHabit(HabitLevel.Elite)}>
                  <Text style={[styles.buttonOutlineText, { color: habitColorPalette.primary }]}>Elite</Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.goalText, { color: colors.secondary }]} numberOfLines={2} ellipsizeMode="tail">{currentOption.eliteGoal}</Text>
            </View>
          </View>
          
          {last7Days.length > 0 && (
            <View style={[styles.historyContainer, { borderTopColor: colors.outlineVariant }]}>
              {last7Days.map((day, idx) => {
                let initial = '';
                let bgColor = 'transparent';
                let textColor = colors.outline;
                let borderColor = colors.outline;

                if (day.level === HabitLevel.Mini) {
                  initial = 'M'; bgColor = habitColorPalette.primaryContainer; textColor = habitColorPalette.onPrimaryContainer; borderColor = habitColorPalette.primaryContainer;
                } else if (day.level === HabitLevel.Plus) {
                  initial = 'P'; bgColor = habitColorPalette.primaryContainer; textColor = habitColorPalette.onPrimaryContainer; borderColor = habitColorPalette.primaryContainer;
                } else if (day.level === HabitLevel.Elite) {
                  initial = 'E'; bgColor = habitColorPalette.primaryContainer; textColor = habitColorPalette.onPrimaryContainer; borderColor = habitColorPalette.primaryContainer;
                }
                
                return (
                  <View key={idx} style={[
                    styles.historyCircle, 
                    { backgroundColor: bgColor, borderColor }
                  ]}>
                    <Text style={[
                      styles.historyText, 
                      { color: textColor }
                    ]}>{initial}</Text>
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
  buttonActive: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 100, // MD3 fully rounded
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 28,
    padding: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  }
});
