import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useColorScheme } from './useColorScheme';

interface Props {
  bonuses: { title: string, description: string }[];
  onDismiss: () => void;
}

export default function BonusOverlay({ bonuses, onDismiss }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      onDismiss();
    });
  }, [opacity, scale, translateY, onDismiss]);
  
  useEffect(() => {
    if (bonuses.length > 0) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        })
      ]).start();
      
      timeoutRef.current = setTimeout(() => {
        dismiss();
      }, 3500);
      
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [bonuses, dismiss]);

  if (bonuses.length === 0) return null;

  return (
    <Pressable style={styles.overlay} onPress={dismiss}>
      <Animated.View 
        style={[
          styles.card, 
          { backgroundColor: colors.primaryContainer, borderColor: colors.primary }, 
          {
            opacity,
            transform: [
              { scale },
              { translateY }
            ]
          }
        ]}
      >
        <MaterialIcons name="celebration" size={56} color={colors.primary} />
        <Text style={[styles.title, { color: colors.onPrimaryContainer }]}>Bonus Achieved!</Text>
        {bonuses.map((b, i) => (
          <View key={i} style={styles.bonusRow}>
            <MaterialIcons name="star" size={24} color="#FFC107" style={styles.star} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bonusText, { color: colors.onPrimaryContainer }]}>{b.title}</Text>
              <Text style={[styles.bonusDesc, { color: colors.onPrimaryContainer, opacity: 0.8 }]} numberOfLines={2}>{b.description}</Text>
            </View>
          </View>
        ))}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  card: {
    padding: 32,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    minWidth: 280,
    maxWidth: '90%',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    width: '100%',
  },
  star: {
    marginRight: 12,
  },
  bonusText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  bonusDesc: {
    fontSize: 14,
    fontWeight: '500',
  }
});
