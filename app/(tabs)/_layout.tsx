import { Link, Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialIcons>['name'];
  focused: boolean;
  color: string;
  colors: any;
}) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 64, height: 32, marginBottom: 4 }}>
      {props.focused && (
        <View
          style={{
            position: 'absolute',
            backgroundColor: props.colors.primaryContainer,
            width: 64,
            height: 32,
            borderRadius: 16,
          }}
        />
      )}
      <MaterialIcons
        name={props.name}
        size={26}
        color={props.focused ? props.colors.onPrimaryContainer : props.color}
        style={{ zIndex: 1 }}
      />
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.outline,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 8,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          color: colors.text,
          fontSize: 22,
        },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Track',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="check-circle" color={color} focused={focused} colors={colors} />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable style={{ marginRight: 15 }}>
                {({ pressed }) => (
                  <MaterialIcons
                    name="info"
                    size={25}
                    color={colors.text}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          title: 'Manage',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="format-list-bulleted" color={color} focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="bar-chart" color={color} focused={focused} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="settings" color={color} focused={focused} colors={colors} />
          ),
        }}
      />
    </Tabs>
  );
}
