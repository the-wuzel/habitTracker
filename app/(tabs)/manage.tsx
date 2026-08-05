import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Colors from '../../constants/Colors';
import { useHabitStore } from '../../store/habitStore';
import { Habit, HabitOption } from '../../types/habit';

export default function ManageHabitsScreen() {
  const { habits, addHabit, updateHabit, deleteHabit } = useHabitStore();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [isCreating, setIsCreating] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
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
    Alert.alert('Delete Habit', 'Are you sure you want to delete this habit? All its logs will also be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(id) }
    ]);
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
        </View>

        {isCreating ? (
          <View style={[styles.card, { backgroundColor: colors.surfaceVariant }]}>
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

            <View style={styles.optionsHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Lateral Options</Text>
              {options.length < 3 && (
                <TouchableOpacity onPress={addOption}>
                  <Text style={{ color: colors.primary, fontWeight: '500' }}>+ Add Option</Text>
                </TouchableOpacity>
              )}
            </View>

            {options.map((option, idx) => (
              <View key={option.id} style={[styles.optionContainer, { borderColor: colors.outline, backgroundColor: colors.surface }]}>
                <View style={styles.optionHeader}>
                  <TextInput
                    style={[styles.optionNameInput, { color: colors.text }]}
                    value={option.name}
                    onChangeText={(val) => updateOption(idx, 'name', val)}
                    placeholder="Option Name (e.g. Pushups)"
                    placeholderTextColor={colors.outline}
                  />
                  {options.length > 1 && (
                    <TouchableOpacity onPress={() => removeOption(idx)}>
                      <MaterialIcons name="close" size={20} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.outline, backgroundColor: colors.surface, marginTop: 8 }]}
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
            ))}

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
                  <View key={habit.id} style={[styles.habitItem, { backgroundColor: colors.surfaceVariant }]}>
                    <View style={styles.habitItemInfo}>
                      <Text style={[styles.habitItemName, { color: colors.text }]}>{habit.name}</Text>
                      {habit.options && habit.options.length > 1 ? (
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
    marginBottom: 16,
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
    borderBottomColor: 'rgba(0,0,0,0.1)',
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
  }
});
