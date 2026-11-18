import { useRouter } from 'expo-router';
import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { PremiumCard } from '@/components/PremiumCard';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/States';
import { chartReadiness } from '@/domain/birthProfile';
import { useI18n } from '@/i18n/I18n';
import { usePrimaryProfile } from '@/state/AppState';

export default function KundliScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const profile = usePrimaryProfile();

  return (
    <Screen>
      <AppHeader eyebrow={t('sanskrit')} title={t('kundliTitle')} />
      {!profile ? (
        <EmptyState
          title={t('kundliTitle')}
          body={t('kundliEmpty')}
          actionLabel={t('addProfile')}
          onAction={() => router.push('/birth-profile')}
        />
      ) : (
        <>
          <PremiumCard>
            <AppText variant="label">{t('factsTitle')}</AppText>
            <AppText variant="title" style={{ fontSize: 28 }}>
              {profile.fullName}
            </AppText>
            <AppText variant="body">
              {profile.birthDate}
              {profile.birthTime ? ` · ${profile.birthTime}` : ''}
            </AppText>
            <AppText variant="muted">
              {profile.cityLabel}, {profile.country}
            </AppText>
            <AppText variant="muted">{profile.timeZone ?? t('placeUnknownFact')}</AppText>
            {chartReadiness(profile) === 'time' ? (
              <AppText variant="muted">{t('timeUnknownFact')}</AppText>
            ) : null}
            {chartReadiness(profile) === 'place' ? (
              <AppText variant="muted">{t('placeUnknownFact')}</AppText>
            ) : null}
          </PremiumCard>
          <PremiumCard muted>
            <AppText variant="body">{t('kundliRefusal')}</AppText>
          </PremiumCard>
        </>
      )}
    </Screen>
  );
}
