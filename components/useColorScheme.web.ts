// NOTE: The default React Native styling doesn't support server rendering.
// Server rendered styles should not change between the first render of the HTML
// and the first render on the client. Typically, web developers will use CSS media queries
// to render different styles on the client and server, these aren't directly supported in React Native
// but can be achieved using a styling library like Nativewind.
import { useColorScheme as useColorSchemeCore } from 'react-native';
import { useHabitStore } from '../store/habitStore';

export function useColorScheme() {
  const coreScheme = useColorSchemeCore();
  const themeMode = useHabitStore((state) => state.themeMode);
  
  if (themeMode === 'light') return 'light';
  if (themeMode === 'dark') return 'dark';
  
  return (coreScheme as string) === 'unspecified' || !coreScheme ? 'light' : coreScheme;
}
