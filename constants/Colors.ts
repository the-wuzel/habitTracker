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
  text: '#1C1B1F', // md3 onSurface
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
  text: '#E6E1E5', // md3 onSurface
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
