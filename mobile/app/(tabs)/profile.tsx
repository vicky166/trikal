import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { languages, type Language } from '@/i18n/languages';
import { useI18n } from '@/i18n/I18n';
import { useAppState, usePrimaryProfile } from '@/state/AppState';
import { useTheme } from '@/theme/ThemeProvider';

export default function ProfileScreen() {
  const { t } = useI18n();
  const theme = useTheme();
  const app = useAppState();
  const profile = usePrimaryProfile();
  const router = useRouter();
  const [removed, setRemoved] = useState(false);

  const rows: { label: string; onPress: () => void }[] = [
    { label: t('birthTitle'), onPress: () => router.push('/birth-profile') },
    { label: t('plansTitle'), onPress: () => router.push('/plans') },
    { label: t('about'), onPress: () => router.push('/about') },
    { label: t('privacy'), onPress: () => router.push('/privacy') },
    { label: t('terms'), onPress: () => router.push('/terms') },
    {
      label: t('login'),
      onPress: () => router.push('/login'),
    },
  ];

  return (
    <Screen>
      <AppHeader eyebrow={t('sanskrit')} title={t('profileTitle')} />
      <AppText variant="title" style={{ fontSize: 28 }}>
        {app.preview?.displayName || profile?.fullName || t('guestName')}
      </AppText>
      {app.preview ? <AppText variant="muted">{t('deviceBanner')}</AppText> : null}

      <View style={styles.block}>
        <AppText variant="label">{t('languageTitle')}</AppText>
        <View style={styles.inline}>
          {languages.map((language) => (
            <Pressable key={language} onPress={() => app.setLanguage(language)}>
              <AppText style={{ color: app.language === language ? theme.gold : theme.muted }}>
                {language === 'en' ? t('langEn') : language === 'hi' ? t('langHi') : t('langHinglish')}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.block}>
        <AppText variant="label">{t('appearance')}</AppText>
        <View style={styles.inline}>
          {(['dark', 'light'] as const).map((mode) => (
            <Pressable key={mode} onPress={() => app.setThemeMode(mode)}>
              <AppText style={{ color: app.themeMode === mode ? theme.gold : theme.muted }}>
                {t(mode)}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.notice, { borderColor: theme.line }]}>
        <AppText variant="label">{t('notifications')}</AppText>
        <AppText variant="muted">{t('notificationsBody')}</AppText>
      </View>

      {rows.map((row) => (
        <Pressable key={row.label} onPress={row.onPress} style={styles.link}>
          <AppText>{row.label}</AppText>
          <AppText variant="muted">→</AppText>
        </Pressable>
      ))}

      {app.preview ? (
        <Pressable onPress={() => app.endPreview()}>
          <AppText variant="muted">{t('endPreview')}</AppText>
        </Pressable>
      ) : null}
      <Pressable
        onPress={() => {
          app.clearDevice();
          setRemoved(true);
          router.replace('/onboarding');
        }}
      >
        <AppText style={{ color: theme.danger }}>{t('deleteDevice')}</AppText>
      </Pressable>
      {removed ? <AppText variant="muted">{t('deleted')}</AppText> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 8,
  },
  inline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  notice: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  link: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
});
