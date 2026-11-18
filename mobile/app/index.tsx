import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Mark } from '@/components/Mark';
import { Starfield } from '@/components/Starfield';
import { useI18n } from '@/i18n/I18n';
import { useAppState } from '@/state/AppState';
import { useTheme } from '@/theme/ThemeProvider';

export default function SplashScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const app = useAppState();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(app.onboardingComplete ? '/home' : '/onboarding');
    }, 1600);
    return () => clearTimeout(timer);
  }, [app.onboardingComplete, router]);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <Starfield color={theme.gold} />
      <Mark size={96} color={theme.gold} />
      <AppText variant="wordmark">{t('brand')}</AppText>
      <AppText variant="sanskrit" style={{ color: theme.gold }}>
        {t('sanskrit')}
      </AppText>
      <AppText variant="muted">{t('tagline')}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 28,
  },
});
