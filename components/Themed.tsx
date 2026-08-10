/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */
import { Text as DefaultText, View as DefaultView, StyleSheet } from 'react-native';

import { useColorScheme } from './useColorScheme';
import { useHabitStore } from '@/store/habitStore';

import Colors from '@/constants/Colors';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName] as unknown as string;
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  
  const { appFontSize } = useHabitStore();
  const scale = appFontSize === 'small' ? 0.85 : appFontSize === 'large' ? 1.15 : 1.0;
  
  const flatStyle = StyleSheet.flatten(style) || {};
  // If fontSize is defined in style, scale it. Otherwise use a default (14) * scale
  const fontSize = flatStyle.fontSize ? flatStyle.fontSize * scale : 14 * scale;

  return <DefaultText style={[{ color }, style, { fontSize }]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
