import { Tabs } from 'expo-router';
import { Text, Platform } from 'react-native';
import { useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();
  const tapCount = useRef(0);
  const lastTapTime = useRef(0);
  const activeTab = useRef('index');

  const handleTabPress = async (tabName: string) => {
    const now = Date.now();
    if (tabName !== activeTab.current) {
      activeTab.current = tabName;
      tapCount.current = 0;
      return;
    }
    if (now - lastTapTime.current < 600) {
      tapCount.current += 1;
    } else {
      tapCount.current = 1;
    }
    lastTapTime.current = now;
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      await AsyncStorage.setItem(`cheatActive_${tabName}`, 'true');
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 90 : 75,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
        },
        tabBarActiveTintColor: '#A855F7',
        tabBarInactiveTintColor: theme.textDim,
        headerShown: false,
        tabBarLabel: () => null,
        tabBarIconStyle: { width: 44, height: 44, overflow: 'visible' },
      }}
      screenListeners={({ route }) => ({
        tabPress: () => handleTabPress(route.name),
      })}
    >
      <Tabs.Screen name="index" options={{
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: focused ? 30 : 24, textAlign: 'center', includeFontPadding: false }}>🎲</Text>
        ),
      }} />
      <Tabs.Screen name="workshop" options={{
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: focused ? 30 : 24, textAlign: 'center', includeFontPadding: false }}>⚙️</Text>
        ),
      }} />
      <Tabs.Screen name="yesno" options={{
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: focused ? 30 : 24, textAlign: 'center', includeFontPadding: false }}>⚖️</Text>
        ),
      }} />
    </Tabs>
  );
}