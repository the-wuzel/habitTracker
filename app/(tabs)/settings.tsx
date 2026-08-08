import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import Colors from '../../constants/Colors';
import { useHabitStore } from '../../store/habitStore';
import { useColorScheme } from '../../components/useColorScheme';
import Material3Switch from '../../components/Material3Switch';

export default function SettingsScreen() {
  const { 
    themeMode, setThemeMode, 
    compactMode, toggleCompactMode, 
    enableLateralFlexibility, toggleLateralFlexibility, 
    loadMockData 
  } = useHabitStore();
  
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handleMockData = () => {
    Alert.alert('Load Mock Data', 'This will delete all current habits and logs. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Load Data', onPress: loadMockData }
    ]);
  };

  const themes = ['system', 'light', 'dark'] as const;

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>

      {/* Display Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Appearance</Text>
        
        <View style={[styles.card, { backgroundColor: colors.elevation.level1 }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="palette" size={24} color={colors.text} style={styles.settingIcon} />
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Theme</Text>
                <Text style={[styles.settingDescription, { color: colors.secondary }]}>
                  Choose your preferred color scheme
                </Text>
              </View>
            </View>
          </View>
          
          <View style={[styles.segmentedControl, { backgroundColor: colors.surfaceVariant }]}>
            {themes.map((theme) => (
              <TouchableOpacity
                key={theme}
                style={[
                  styles.segment,
                  themeMode === theme && { backgroundColor: colors.primaryContainer }
                ]}
                onPress={() => setThemeMode(theme)}
              >
                <Text style={[
                  styles.segmentText,
                  { color: themeMode === theme ? colors.onPrimaryContainer : colors.text }
                ]}>
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.settingRow} onPress={toggleCompactMode}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="view-compact" size={24} color={colors.text} style={styles.settingIcon} />
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Compact Mode</Text>
                <Text style={[styles.settingDescription, { color: colors.secondary }]}>
                  Maximize density on the dashboard
                </Text>
              </View>
            </View>
            <Material3Switch 
              value={compactMode} 
              onValueChange={toggleCompactMode}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feature Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Features</Text>
        
        <View style={[styles.card, { backgroundColor: colors.elevation.level1 }]}>
          <TouchableOpacity style={styles.settingRow} onPress={toggleLateralFlexibility}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="alt-route" size={24} color={colors.text} style={styles.settingIcon} />
              <View style={styles.textContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Lateral Flexibility</Text>
                <Text style={[styles.settingDescription, { color: colors.secondary }]}>
                  Enable multiple options (e.g., Run, Swim, Bike) for a single habit
                </Text>
              </View>
            </View>
            <Material3Switch 
              value={enableLateralFlexibility} 
              onValueChange={toggleLateralFlexibility}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Data</Text>
        
        <View style={[styles.card, { backgroundColor: colors.elevation.level1 }]}>
          <TouchableOpacity style={styles.settingRow} onPress={handleMockData}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="science" size={24} color={colors.text} style={styles.settingIcon} />
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Load Mock Data</Text>
                <Text style={[styles.settingDescription, { color: colors.secondary }]}>
                  Populate tracker with sample habits
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.secondary }]}>Antigravity Habit Tracker v1.0</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '400',
    letterSpacing: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    marginLeft: 56, // Align with text
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 16,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  }
});
