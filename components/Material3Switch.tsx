import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
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
    Animated.timing(animValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // color interpolation requires false
    }).start();
  }, [value, animValue]);

  // Interpolations
  const trackBackgroundColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceVariant, colors.primaryContainer]
  });

  const trackBorderColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.outline, colors.primaryContainer]
  });

  const thumbTranslateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 24] // Track width 52, Thumb max 24. 52 - 24 - 4 = 24.
  });

  const thumbSize = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 24]
  });

  const thumbColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.outline, colors.onPrimaryContainer]
  });

  const iconOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  return (
    <Pressable 
      onPress={() => onValueChange(!value)} 
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View style={[
        styles.track, 
        { 
          backgroundColor: trackBackgroundColor,
          borderColor: trackBorderColor,
        }
      ]}>
        <Animated.View style={[
          styles.thumbContainer,
          { transform: [{ translateX: thumbTranslateX }] }
        ]}>
          <Animated.View style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              backgroundColor: thumbColor,
            }
          ]}>
            <Animated.View style={{ opacity: iconOpacity }}>
              {value && <MaterialIcons name="check" size={16} color={colors.primaryContainer} />}
            </Animated.View>
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
  thumbContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
  },
  thumb: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
