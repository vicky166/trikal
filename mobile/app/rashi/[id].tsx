import { useLocalSearchParams } from 'expo-router';
import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { PremiumCard } from '@/components/PremiumCard';
import { Screen } from '@/components/Screen';
import { findRashi } from '@/domain/rashis';
import { deviceTimeZone, formatLongDate } from '@/domain/time';
import { useI18n } from '@/i18n/I18n';
import { localeFor } from '@/i18n/languages';

const areas = ['career', 'love', 'health', 'finance', 'luckyNumber', 'luckyColour'] as const;

export default function RashiScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language } = useI18n();
  const rashi = findRashi(String(id));
  const today = formatLongDate(new Date(), localeFor(language), deviceTimeZone());

  return (
    <Screen>
      <AppHeader
        eyebrow={rashi?.sa ?? t('sanskrit')}
        title={rashi ? (language === 'en' ? rashi.en : rashi.hi) : t('horoscopeTitle')}
        back
      />
      <AppText variant="muted">
        {today} · {deviceTimeZone()}
      </AppText>
      <AppText variant="body">{t('unpublished')}</AppText>
      {areas.map((area) => (
        <PremiumCard key={area}>
          <AppText variant="label">{t(area)}</AppText>
          <AppText variant="body">{t('withheld')}</AppText>
        </PremiumCard>
      ))}
    </Screen>
  );
}
