import 'react-native-gesture-handler';
import { CormorantGaramond_500Medium, CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond';
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold } from '@expo-google-fonts/outfit';
import { TiroDevanagariSanskrit_400Regular } from '@expo-google-fonts/tiro-devanagari-sanskrit';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { I18nProvider } from '@/i18n/I18n';
import { AppStateProvider, useAppState } from '@/state/AppState';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { darkTheme, lightTheme } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Shell() {
  const app = useAppState();
  const theme = app.themeMode === 'light' ? lightTheme : darkTheme;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.background).catch(() => undefined);
  }, [theme.background]);

  if (!app.hydrated) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <I18nProvider language={app.language}>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.background },
          }}
        />
      </I18nProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    TiroDevanagariSanskrit_400Regular,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  );
}
