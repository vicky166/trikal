import { Tabs } from 'expo-router';
import { BottomNavigation } from '@/components/BottomNavigation';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => (
        <BottomNavigation state={props.state} navigateToTab={props.navigateToTab} />
      )}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="kundli" />
      <Tabs.Screen name="ask" />
      <Tabs.Screen name="horoscope" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
