import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, useColorScheme, Alert } from 'react-native';
import Colors from '../../constants/Colors';
import { useHabitStore } from '../../store/habitStore';
import { MaterialIcons } from '@expo/vector-icons';

export default function ManageHabitsScreen() {
  const { habits, addHabit, deleteHabit } = useHabitStore();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [miniGoal, setMiniGoal] = useState('');
  const [plusGoal, setPlusGoal] = useState('');
  const [eliteGoal, setEliteGoal] = useState('');

  const handleCreate = () => {
    if (!name.trim() || !miniGoal.trim() || !plusGoal.trim() || !eliteGoal.trim()) {
      Alert.alert('Validation', 'Please fill in all goal fields and the habit name.');
      return;
    }
    
    addHabit({
      name: name.trim(),
      description: description.trim(),
      miniGoal: miniGoal.trim(),
      plusGoal: plusGoal.trim(),
      eliteGoal: eliteGoal.trim()
    });

    // Reset form
    setName('');
    setDescription('');
    setMiniGoal('');
    setPlusGoal('');
    setEliteGoal('');
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Habit', 'Are you sure you want to delete this habit? All its logs will also be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(id) }
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: colors.text }]}>Manage Habits</Text>
        </View>

        {isCreating ? (
          <View style={[styles.card, { backgroundColor: colors.surfaceVariant }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Create New Habit</Text>
            
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

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Goals</Text>
            
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.outline, backgroundColor: colors.surface }]}
              placeholder="Mini Goal (e.g. 1 Pushup)"
              placeholderTextColor={colors.outline}
              value={miniGoal}
              onChangeText={setMiniGoal}
            />
            
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.outline, backgroundColor: colors.surface }]}
              placeholder="Plus Goal (e.g. 15 Pushups)"
              placeholderTextColor={colors.outline}
              value={plusGoal}
              onChangeText={setPlusGoal}
            />
            
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.outline, backgroundColor: colors.surface }]}
              placeholder="Elite Goal (e.g. 30 Pushups)"
              placeholderTextColor={colors.outline}
              value={eliteGoal}
              onChangeText={setEliteGoal}
            />

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsCreating(false)}>
                <Text style={{ color: colors.primary, fontWeight: '500' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.createBtn, { backgroundColor: colors.primary }]} onPress={handleCreate}>
                <Text style={{ color: colors.onPrimary, fontWeight: '500' }}>Save Habit</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {habits.length === 0 ? (
              <Text style={{ color: colors.secondary, textAlign: 'center', marginTop: 24 }}>No habits found.</Text>
            ) : (
              habits.map(habit => (
                <View key={habit.id} style={[styles.habitItem, { backgroundColor: colors.surfaceVariant }]}>
                  <View style={styles.habitItemInfo}>
                    <Text style={[styles.habitItemName, { color: colors.text }]}>{habit.name}</Text>
                    <Text style={{ color: colors.secondary, fontSize: 12, marginTop: 4 }}>
                      M: {habit.miniGoal} | P: {habit.plusGoal} | E: {habit.eliteGoal}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(habit.id)} style={{ padding: 8 }}>
                    <MaterialIcons name="delete" color={colors.error} size={24} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

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
    marginTop: 8,
    marginBottom: 8,
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
    marginTop: 16,
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
