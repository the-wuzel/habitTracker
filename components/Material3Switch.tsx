import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from './useColorScheme';
import Colors from '../constants/Colors';

interface Material3SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export default function Material3Switch({ value, onValueChange, disabled = false }: Material3SwitchProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Animation values
  const animValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: value ? 1 : 0,
      useNativeDriver: false, // Color interpolation requires false
      bounciness: 4,
      speed: 14,
    }).start();
  }, [value, animValue]);

  // Interpolations matching exact M3 specs
  const trackBackgroundColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceVariant, colors.primary]
  });

  const trackBorderColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.outline, colors.primary]
  });

  // Track is 52px wide, border is 2px. Inner width = 48px.
  // Thumb is fixed at 24px wide for layout, but scales down to 16px.
  // Unchecked center should be 16px from outer edge (14px from inner edge). Left = 14 - 12 = 2.
  // Checked center should be 36px from outer edge (34px from inner edge). Left = 34 - 12 = 22.
  const thumbTranslateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22] 
  });

  const thumbScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [16 / 24, 1]
  });

  const thumbColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.outline, colors.onPrimary]
  });

  const iconOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  const iconScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1]
  });

  return (
    <Pressable 
      onPress={(e: any) => {
        e?.stopPropagation?.();
        onValueChange(!value);
      }} 
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      style={{ opacity: disabled ? 0.5 : 1, cursor: (Platform.OS === 'web' && !disabled) ? 'pointer' : undefined }}
    >
      <Animated.View style={[
        styles.track, 
        { 
          backgroundColor: trackBackgroundColor,
          borderColor: trackBorderColor,
        }
      ]}>
        <Animated.View style={[
          styles.thumb,
          {
            backgroundColor: thumbColor,
            transform: [
              { translateX: thumbTranslateX },
              { scale: thumbScale }
            ]
          }
        ]}>
          <Animated.View style={{ 
            opacity: iconOpacity, 
            transform: [{ scale: iconScale }] 
          }}>
            <MaterialIcons name="check" size={16} color={colors.primary} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 52,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
  }
});
