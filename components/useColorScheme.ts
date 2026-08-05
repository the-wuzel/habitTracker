import { useColorScheme as useColorSchemeCore } from 'react-native';
import { useHabitStore } from '../store/habitStore';

export const useColorScheme = () => {
  const coreScheme = useColorSchemeCore();
  const themeMode = useHabitStore((state) => state.themeMode);
  
  if (themeMode === 'light') return 'light';
  if (themeMode === 'dark') return 'dark';
  
  return (coreScheme as string) === 'unspecified' ? 'light' : coreScheme;
};
