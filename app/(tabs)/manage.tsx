import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, Switch, Modal } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Colors from '../../constants/Colors';
import { useHabitStore } from '../../store/habitStore';
import { Habit, HabitOption } from '../../types/habit';
import { useColorScheme } from '../../components/useColorScheme';

export default function ManageHabitsScreen() {
  const { habits, addHabit, updateHabit, deleteHabit, loadMockData, enableLateralFlexibility, toggleLateralFlexibility, themeMode, setThemeMode, compactMode, toggleCompactMode } = useHabitStore();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const cycleTheme = () => {
    if (themeMode === 'system') setThemeMode('light');
    else if (themeMode === 'light') setThemeMode('dark');
    else setThemeMode('system');
  };

  const getThemeIcon = () => {
    if (themeMode === 'light') return 'light-mode';
    if (themeMode === 'dark') return 'dark-mode';
    return 'brightness-auto';
  };

  const [isCreating, setIsCreating] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const defaultOption = () => ({ id: Date.now().toString(), name: 'Default Option', miniGoal: '', plusGoal: '', eliteGoal: '' });
  const [options, setOptions] = useState<HabitOption[]>([defaultOption()]);

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setName(habit.name);
    setDescription(habit.description);
    
    if (habit.options && habit.options.length > 0) {
      setOptions(habit.options);
    } else {
      setOptions([{
        id: Date.now().toString(),
        name: 'Default Option',
        miniGoal: habit.miniGoal,
        plusGoal: habit.plusGoal,
        eliteGoal: habit.eliteGoal,
      }]);
    }
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please provide a habit name.');
      return;
    }

    const invalidOption = options.find(opt => !opt.miniGoal.trim() || !opt.plusGoal.trim() || !opt.eliteGoal.trim());
    if (invalidOption) {
      Alert.alert('Validation', 'Please fill in all goal fields for all options.');
      return;
    }
    
    // Pick the first option's goals as the fallback legacy fields
    const defaultOpt = options[0];

    if (editingHabit) {
      updateHabit({
        ...editingHabit,
        name: name.trim(),
        description: description.trim(),
        miniGoal: defaultOpt.miniGoal.trim(),
        plusGoal: defaultOpt.plusGoal.trim(),
        eliteGoal: defaultOpt.eliteGoal.trim(),
        options: options.map(opt => ({
          ...opt,
          name: opt.name.trim(),
          miniGoal: opt.miniGoal.trim(),
          plusGoal: opt.plusGoal.trim(),
          eliteGoal: opt.eliteGoal.trim(),
        }))
      });
    } else {
      addHabit({
        name: name.trim(),
        description: description.trim(),
        miniGoal: defaultOpt.miniGoal.trim(),
        plusGoal: defaultOpt.plusGoal.trim(),
        eliteGoal: defaultOpt.eliteGoal.trim(),
        options: options.map(opt => ({
          ...opt,
          name: opt.name.trim(),
          miniGoal: opt.miniGoal.trim(),
          plusGoal: opt.plusGoal.trim(),
          eliteGoal: opt.eliteGoal.trim(),
        }))
      });
    }

    handleCancel();
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setOptions([defaultOption()]);
    setIsCreating(false);
    setEditingHabit(null);
  };

  const handleDelete = (id: string) => {
    setHabitToDelete(id);
  };

  const confirmDelete = () => {
    if (habitToDelete) {
      deleteHabit(habitToDelete);
      setHabitToDelete(null);
    }
  };

  const cancelDelete = () => {
    setHabitToDelete(null);
  };

  const updateOption = (index: number, field: keyof HabitOption, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length <= 1) {
      Alert.alert('Validation', 'A habit must have at least one option.');
      return;
    }
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length >= 3) {
      Alert.alert('Validation', 'You can only have up to 3 lateral options.');
      return;
    }
    setOptions([...options, { id: Date.now().toString(), name: `Option ${options.length + 1}`, miniGoal: '', plusGoal: '', eliteGoal: '' }]);
  };

  const moveOption = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === options.length - 1) return;
    
    const newOptions = [...options];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newOptions[targetIndex];
    newOptions[targetIndex] = newOptions[index];
    newOptions[index] = temp;
    setOptions(newOptions);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 50}
        extraHeight={Platform.OS === 'ios' ? 100 : 50}
      >
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: colors.text }]}>Manage Habits</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity 
              style={{ padding: 6, backgroundColor: colors.surfaceVariant, borderRadius: 20 }}
              onPress={cycleTheme}
            >
              <MaterialIcons name={getThemeIcon() as any} size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.mockBtn, { backgroundColor: colors.primaryContainer }]} 
              onPress={() => {
                Alert.alert('Load Mock Data', 'This will delete all current habits and logs. Are you sure?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Load Data', onPress: loadMockData }
                ]);
              }}
            >
              <Text style={{ color: colors.onPrimaryContainer, fontSize: 12, fontWeight: '500' }}>Mock</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingsRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: colors.text, fontSize: 14 }}>Lateral Flexibility</Text>
            <Switch 
              value={enableLateralFlexibility} 
              onValueChange={toggleLateralFlexibility}
              trackColor={{ false: colors.surfaceVariant, true: colors.primaryContainer }}
              thumbColor={enableLateralFlexibility ? colors.primary : colors.secondary}
              style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: colors.text, fontSize: 14 }}>Compact Mode</Text>
            <Switch 
              value={compactMode} 
              onValueChange={toggleCompactMode}
              trackColor={{ false: colors.surfaceVariant, true: colors.primaryContainer }}
              thumbColor={compactMode ? colors.primary : colors.secondary}
              style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
            />
          </View>
        </View>

        {isCreating ? (
          <View style={[styles.card, { backgroundColor: colors.elevation.level1 }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              {editingHabit ? 'Edit Habit' : 'Create New Habit'}
            </Text>
            
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.outline, backgroundColor: colors.surface }]}
              placeholder="Habit Name"
              placeholderTextColor={colors.outline}
              value={name}
              onChangeText={setName}
            />
            
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.outline, backgroundColor: colors.surface }]}
              placeholder="Description (Optional)"
              placeholderTextColor={colors.outline}
              value={description}
              onChangeText={setDescription}
            />

            {enableLateralFlexibility && (
              <View style={styles.optionsHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Lateral Options</Text>
                {options.length < 3 && (
                  <TouchableOpacity onPress={addOption}>
                    <Text style={{ color: colors.primary, fontWeight: '500' }}>+ Add Option</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {options.map((option, idx) => {
              if (!enableLateralFlexibility && idx > 0) return null;
              
              return (
              <View key={option.id} style={enableLateralFlexibility ? [styles.optionContainer, { borderColor: colors.outline, backgroundColor: colors.surface }] : { marginTop: 16 }}>
                {enableLateralFlexibility && (
                  <View style={[styles.optionHeader, { borderBottomColor: colors.outlineVariant }]}>
                    <TextInput
                      style={[styles.optionNameInput, { color: colors.text }]}
                      value={option.name}
                      onChangeText={(val) => updateOption(idx, 'name', val)}
                      placeholder="Option Name (e.g. Pushups)"
                      placeholderTextColor={colors.outline}
                    />
                    {options.length > 1 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <TouchableOpacity onPress={() => moveOption(idx, 'up')} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.3 : 1 }}>
                          <MaterialIcons name="arrow-upward" size={20} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => moveOption(idx, 'down')} disabled={idx === options.length - 1} style={{ opacity: idx === options.length - 1 ? 0.3 : 1 }}>
                          <MaterialIcons name="arrow-downward" size={20} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => removeOption(idx)}>
                          <MaterialIcons name="close" size={20} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.outline, backgroundColor: colors.surface, marginTop: enableLateralFlexibility ? 8 : 0 }]}
                  placeholder="Mini Goal (e.g. 1 Pushup)"
                  placeholderTextColor={colors.outline}
                  value={option.miniGoal}
                  onChangeText={(val) => updateOption(idx, 'miniGoal', val)}
                />
                
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.outline, backgroundColor: colors.surface }]}
                  placeholder="Plus Goal (e.g. 15 Pushups)"
                  placeholderTextColor={colors.outline}
                  value={option.plusGoal}
                  onChangeText={(val) => updateOption(idx, 'plusGoal', val)}
                />
                
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.outline, backgroundColor: colors.surface }]}
                  placeholder="Elite Goal (e.g. 30 Pushups)"
                  placeholderTextColor={colors.outline}
                  value={option.eliteGoal}
                  onChangeText={(val) => updateOption(idx, 'eliteGoal', val)}
                />
              </View>
              );
            })}

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={{ color: colors.primary, fontWeight: '500' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.createBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
                <Text style={{ color: colors.onPrimary, fontWeight: '500' }}>Save Habit</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {habits.length === 0 ? (
              <Text style={{ color: colors.secondary, textAlign: 'center', marginTop: 24 }}>No habits found.</Text>
            ) : (
              habits.map(habit => {
                const displayOpt = habit.options && habit.options.length > 0 ? habit.options[0] : habit;
                return (
                  <View key={habit.id} style={[styles.habitItem, { backgroundColor: colors.elevation.level1 }]}>
                    <View style={styles.habitItemInfo}>
                      <Text style={[styles.habitItemName, { color: colors.text }]}>{habit.name}</Text>
                      {enableLateralFlexibility && habit.options && habit.options.length > 1 ? (
                        <Text style={{ color: colors.secondary, fontSize: 12, marginTop: 4 }}>
                          {habit.options.length} Options
                        </Text>
                      ) : (
                        <Text style={{ color: colors.secondary, fontSize: 12, marginTop: 4 }}>
                          M: {displayOpt.miniGoal} | P: {displayOpt.plusGoal} | E: {displayOpt.eliteGoal}
                        </Text>
                      )}
                    </View>
                    <View style={styles.habitItemActions}>
                      <TouchableOpacity onPress={() => handleEdit(habit)} style={{ padding: 8 }}>
                        <MaterialIcons name="edit" color={colors.primary} size={24} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(habit.id)} style={{ padding: 8 }}>
                        <MaterialIcons name="delete" color={colors.error} size={24} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </KeyboardAwareScrollView>

      {!isCreating && (
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: colors.primaryContainer }]} 
          onPress={() => setIsCreating(true)}
        >
          <MaterialIcons name="add" color={colors.onPrimaryContainer} size={28} />
        </TouchableOpacity>
      )}

      <Modal
        visible={habitToDelete !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalDialog, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="delete-outline" size={24} color={colors.error} style={{ alignSelf: 'center', marginBottom: 16 }} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Delete Habit?</Text>
            <Text style={[styles.modalText, { color: colors.secondary }]}>
              Are you sure you want to delete this habit? All its logs will also be deleted. This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtn} onPress={cancelDelete}>
                <Text style={{ color: colors.primary, fontWeight: '500' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={confirmDelete}>
                <Text style={{ color: colors.error, fontWeight: '500' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  mockBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: 0,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  optionContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 8,
  },
  optionNameInput: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 16,
  },
  cancelBtn: {
    padding: 12,
    justifyContent: 'center',
  },
  createBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    justifyContent: 'center',
  },
  listContainer: {
    gap: 12,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  habitItemInfo: {
    flex: 1,
  },
  habitItemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  habitItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 20, // MD3 FAB shape
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    borderRadius: 28, // MD3 standard
    padding: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '400',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 100,
    minWidth: 64,
    alignItems: 'center',
  }
});
