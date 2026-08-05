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
