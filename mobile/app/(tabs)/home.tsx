import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Mark } from '@/components/Mark';
import { PlanetCard } from '@/components/PlanetCard';
import { PremiumCard } from '@/components/PremiumCard';
import { Screen } from '@/components/Screen';
import { SecondaryButton } from '@/components/Buttons';
import { chartReadiness } from '@/domain/birthProfile';
import { notebookNote } from '@/domain/notebook';
import { deviceTimeZone, formatLongDate } from '@/domain/time';
import { useI18n } from '@/i18n/I18n';
import { localeFor } from '@/i18n/languages';
import { useAppState, usePrimaryProfile } from '@/state/AppState';
import { useTheme } from '@/theme/ThemeProvider';

function greetingKey(date: Date) {
  const hour = date.getHours();
  if (hour < 12) {
    return 'greetingMorning' as const;
  }
  if (hour < 17) {
    return 'greetingAfternoon' as const;
  }
  return 'greetingEvening' as const;
}

export default function HomeScreen() {
  const { t, language } = useI18n();
  const theme = useTheme();
  const router = useRouter();
  const app = useAppState();
  const profile = usePrimaryProfile();
  const now = new Date();
  const zone = deviceTimeZone();
  const name = app.preview?.displayName || profile?.fullName || t('guestName');
  const ready = profile ? chartReadiness(profile) : null;

  return (
    <Screen>
      <View style={styles.top}>
        <Mark size={36} color={theme.gold} />
        <AppText variant="label" style={{ color: theme.gold }}>
          {t('brand')}
        </AppText>
      </View>
      {app.preview ? <AppText variant="muted">{t('deviceBanner')}</AppText> : null}
      <View style={styles.greeting}>
        <AppText variant="muted">{t(greetingKey(now))}</AppText>
        <AppText variant="title">{name}</AppText>
        <AppText variant="body">{formatLongDate(now, localeFor(language), zone)}</AppText>
        <AppText variant="muted">{zone}</AppText>
      </View>

      <PremiumCard>
        <AppText variant="title" style={styles.cardTitle}>
          {profile ? t('chartPendingTitle') : t('chartWaitingTitle')}
        </AppText>
        <AppText variant="body">{profile ? t('chartPendingBody') : t('chartWaitingBody')}</AppText>
        {ready === 'time' ? <AppText variant="muted">{t('timeUnknownFact')}</AppText> : null}
        {ready === 'place' ? <AppText variant="muted">{t('placeUnknownFact')}</AppText> : null}
        <SecondaryButton
          label={profile ? t('editProfile') : t('addProfile')}
          onPress={() => router.push(profile ? `/birth-profile?id=${profile.id}` : '/birth-profile')}
        />
      </PremiumCard>

      {profile ? (
        <View style={styles.planets}>
          <PlanetCard name={t('sun')} value={t('planetsWaiting')} />
          <PlanetCard name={t('moon')} value={t('planetsWaiting')} />
          <PlanetCard name={t('lagna')} value={t('planetsWaiting')} />
        </View>
      ) : null}

      <PremiumCard muted>
        <AppText variant="label">{t('dailyTitle')}</AppText>
        <AppText variant="body">{t('dailyBody')}</AppText>
      </PremiumCard>

      <View style={styles.grid}>
        {[
          [t('shortcutKundli'), '/kundli'],
          [t('shortcutAsk'), '/ask'],
          [t('shortcutMatch'), '/compatibility'],
          [t('shortcutReports'), '/reports'],
        ].map(([label, href]) => (
          <Pressable
            key={href}
            onPress={() => router.push(href)}
            style={[styles.shortcut, { backgroundColor: theme.card, borderColor: theme.line }]}
          >
            <AppText style={{ fontFamily: theme.fontSansMedium }}>{label}</AppText>
          </Pressable>
        ))}
      </View>

      <PremiumCard>
        <AppText variant="label">{t('notebook')}</AppText>
        <AppText variant="body">{notebookNote(now, language)}</AppText>
      </PremiumCard>

      <PremiumCard>
        <AppText variant="title" style={styles.cardTitle}>
          {t('premiumTitle')}
        </AppText>
        <AppText variant="body">{t('premiumBody')}</AppText>
        <SecondaryButton label={t('seePlans')} onPress={() => router.push('/plans')} />
      </PremiumCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  greeting: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 26,
  },
  planets: {
    flexDirection: 'row',
    gap: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shortcut: {
    width: '48%',
    minHeight: 72,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
});
