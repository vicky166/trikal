import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useI18n } from '../i18n/I18n';
import type { CopyKey } from '../i18n/copy';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';

const tabs: { name: string; key: CopyKey; icon: 'home' | 'kundli' | 'ask' | 'horoscope' | 'profile' }[] = [
  { name: 'home', key: 'tabHome', icon: 'home' },
  { name: 'kundli', key: 'tabKundli', icon: 'kundli' },
  { name: 'ask', key: 'tabAsk', icon: 'ask' },
  { name: 'horoscope', key: 'tabHoroscope', icon: 'horoscope' },
  { name: 'profile', key: 'tabProfile', icon: 'profile' },
];

function TabIcon({ icon, color }: { icon: (typeof tabs)[number]['icon']; color: string }) {
  if (icon === 'home') {
    return (
      <Svg width={22} height={22} viewBox="0 0 22 22">
        <Path d="M3 14c2.2-4 5-6.5 8-6.5S16.8 10 19 14" stroke={color} strokeWidth={1.4} fill="none" />
        <Circle cx="11" cy="6.2" r="1.3" fill={color} />
      </Svg>
    );
  }
  if (icon === 'kundli') {
    return (
      <Svg width={22} height={22} viewBox="0 0 22 22">
        <Path d="M11 2.5 19.5 11 11 19.5 2.5 11Z" stroke={color} strokeWidth={1.3} fill="none" />
        <Path d="M11 2.5v17M2.5 11h17" stroke={color} strokeWidth={1} />
      </Svg>
    );
  }
  if (icon === 'ask') {
    return (
      <Svg width={22} height={22} viewBox="0 0 22 22">
        <Path d="M4 6.5h14v8H8l-4 3v-11Z" stroke={color} strokeWidth={1.3} fill="none" />
      </Svg>
    );
  }
  if (icon === 'horoscope') {
    return (
      <Svg width={22} height={22} viewBox="0 0 22 22">
        <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={1.3} fill="none" />
        <Path d="M11 4v2.2M11 15.8V18M4 11h2.2M15.8 11H18" stroke={color} strokeWidth={1.2} />
      </Svg>
    );
  }
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22">
      <Circle cx="11" cy="8" r="2.4" stroke={color} strokeWidth={1.3} fill="none" />
      <Path d="M5.5 17.2c1.2-2.4 3-3.6 5.5-3.6s4.3 1.2 5.5 3.6" stroke={color} strokeWidth={1.3} fill="none" />
    </Svg>
  );
}

export function BottomNavigation({
  state,
  navigateToTab,
}: {
  state: { index: number; routes: { key: string; name: string }[] };
  navigateToTab: (routeKey: string) => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.backgroundRaised,
          borderTopColor: theme.line,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      {tabs.map((tab) => {
        const routeIndex = state.routes.findIndex((route) => route.name === tab.name);
        const active = state.index === routeIndex;
        const color = active ? theme.gold : theme.muted;
        return (
          <Pressable
            key={tab.name}
            accessibilityRole="button"
            onPress={() => {
              const route = state.routes[routeIndex];
              if (!route || active) {
                return;
              }
              navigateToTab(route.key);
            }}
            style={styles.item}
          >
            <TabIcon icon={tab.icon} color={color} />
            <AppText variant="label" style={{ color, letterSpacing: 0.4, fontSize: 10 }}>
              {t(tab.key)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
});
