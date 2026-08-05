import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, TouchableOpacity, SafeAreaView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useHabitStore } from '../store/habitStore';
import Colors from '../constants/Colors';
import { useColorScheme } from '../components/useColorScheme';

const pages = [
  {
    title: 'Elastic Habits',
    description: 'Welcome! This tracker is built on the philosophy of Elastic Habits. We value consistency over intensity, ensuring you never break the chain.',
    icon: 'track-changes' as const,
  },
  {
    title: 'Vertical Variations',
    description: 'Every day is different. Choose from 3 intensity levels for your habit:\n\n• Mini: Easy enough to do on your worst days.\n• Plus: A solid, standard effort.\n• Elite: A challenging goal for your best days.',
    icon: 'swap-vert' as const,
  },
  {
    title: 'The Power of Mini Habits',
    description: 'Mini habits are the foundation of this system. They must be stupidly simple—so easy you can do them every single day, no matter how tired or busy you are. This guarantees you never break the chain.',
    icon: 'radio-button-checked' as const,
  },
  {
    title: 'Lateral Flexibility',
    description: 'Boredom kills habits. Lateral flexibility allows you to define multiple paths (options) to complete the same habit, keeping things fresh.',
    icon: 'swap-horiz' as const,
  },
  {
    title: 'The Scoring System',
    description: 'Earn points to track your progress: Mini (1pt), Plus (2pts), and Elite (3pts). Achieve bonuses like "Perfect Day" or "Hot Streak" to boost your Elastic Score!',
    icon: 'emoji-events' as const,
  },
  {
    title: 'Ready to start?',
    description: "Let's build habits that bend, but never break.",
    icon: 'rocket-launch' as const,
  }
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const completeOnboarding = useHabitStore(state => state.completeOnboarding);
  
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / width);
    if (pageIndex !== currentPage) {
      setCurrentPage(pageIndex);
    }
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      scrollRef.current?.scrollTo({ x: (currentPage + 1) * width, animated: true });
    }
  };

  const handleStart = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {pages.map((page, index) => (
          <View key={index} style={[styles.page, { width }]}>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                <MaterialIcons name={page.icon} size={64} color="#ffffff" />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>{page.title}</Text>
              <Text style={[styles.description, { color: colors.secondary }]}>{page.description}</Text>
              
              {index === pages.length - 1 && (
                <TouchableOpacity 
                  style={[styles.startButton, { backgroundColor: colors.primary }]}
                  onPress={handleStart}
                >
                  <Text style={styles.startButtonText}>Get Started</Text>
                  <MaterialIcons name="arrow-forward" size={24} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {pages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { 
                  backgroundColor: index === currentPage ? colors.primary : colors.outline,
                  width: index === currentPage ? 24 : 8 
                }
              ]}
            />
          ))}
        </View>

        {currentPage < pages.length - 1 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={[styles.nextButtonText, { color: colors.primary }]}>Next</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.nextButtonPlaceholder} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 100,
    elevation: 2,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingBottom: 48,
    paddingTop: 16,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  nextButtonPlaceholder: {
    width: 80, // Approximate width of the "Next" button to keep pagination centered
  },
});
