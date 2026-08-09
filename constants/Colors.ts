const md3Light = {
  primary: '#6750A4',
  onPrimary: '#FFFFFF',
  primaryContainer: '#EADDFF',
  onPrimaryContainer: '#21005D',
  secondary: '#625B71',
  background: '#FEF7FF',
  surface: '#FEF7FF',
  surfaceVariant: '#E7E0EC',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  text: '#1C1B1F',
  error: '#B3261E',
  elevation: {
    level0: '#FEF7FF',
    level1: '#F7F2FA',
    level2: '#F3EDF7',
    level3: '#ECE6F0',
    level4: '#E6E0E9',
    level5: '#E2DCE5',
  }
};

const md3Dark = {
  primary: '#D0BCFF',
  onPrimary: '#381E72',
  primaryContainer: '#4F378B',
  onPrimaryContainer: '#EADDFF',
  secondary: '#CCC2DC',
  background: '#141218',
  surface: '#141218',
  surfaceVariant: '#49454F',
  outline: '#938F99',
  outlineVariant: '#49454F',
  text: '#E6E1E5',
  error: '#F2B8B5',
  elevation: {
    level0: '#141218',
    level1: '#1F1A24',
    level2: '#231D28',
    level3: '#28222E',
    level4: '#292430',
    level5: '#2C2735',
  }
};

export default {
  light: {
    ...md3Light,
    tint: md3Light.primary,
    tabIconDefault: md3Light.outline,
    tabIconSelected: md3Light.primary,
  },
  dark: {
    ...md3Dark,
    tint: md3Dark.primary,
    tabIconDefault: md3Dark.outline,
    tabIconSelected: md3Dark.primary,
  },
};

export type HabitPalette = {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
};

export const HabitColors: Record<string, { light: HabitPalette; dark: HabitPalette }> = {
  purple: {
    light: { primary: '#6750A4', onPrimary: '#FFFFFF', primaryContainer: '#EADDFF', onPrimaryContainer: '#21005D' },
    dark: { primary: '#D0BCFF', onPrimary: '#381E72', primaryContainer: '#4F378B', onPrimaryContainer: '#EADDFF' }
  },
  red: {
    light: { primary: '#B3261E', onPrimary: '#FFFFFF', primaryContainer: '#F9DEDC', onPrimaryContainer: '#410E0B' },
    dark: { primary: '#F2B8B5', onPrimary: '#601410', primaryContainer: '#8C1D18', onPrimaryContainer: '#F9DEDC' }
  },
  green: {
    light: { primary: '#386A20', onPrimary: '#FFFFFF', primaryContainer: '#B7F397', onPrimaryContainer: '#042100' },
    dark: { primary: '#9CD67D', onPrimary: '#0C3900', primaryContainer: '#225008', onPrimaryContainer: '#B7F397' }
  },
  blue: {
    light: { primary: '#0061A4', onPrimary: '#FFFFFF', primaryContainer: '#D1E4FF', onPrimaryContainer: '#001D36' },
    dark: { primary: '#9ECAFF', onPrimary: '#003258', primaryContainer: '#00497D', onPrimaryContainer: '#D1E4FF' }
  },
  orange: {
    light: { primary: '#8B5000', onPrimary: '#FFFFFF', primaryContainer: '#FFDCBE', onPrimaryContainer: '#2C1600' },
    dark: { primary: '#FFB870', onPrimary: '#4A2800', primaryContainer: '#693C00', onPrimaryContainer: '#FFDCBE' }
  },
  teal: {
    light: { primary: '#006A6A', onPrimary: '#FFFFFF', primaryContainer: '#6FF6F6', onPrimaryContainer: '#002020' },
    dark: { primary: '#4CDADA', onPrimary: '#003737', primaryContainer: '#005050', onPrimaryContainer: '#6FF6F6' }
  },
};
