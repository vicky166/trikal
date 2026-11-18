import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { PremiumCard } from '@/components/PremiumCard';
import { Screen } from '@/components/Screen';
import { useI18n } from '@/i18n/I18n';
import type { CopyKey } from '@/i18n/copy';

const reports: CopyKey[] = [
  'reportBirth',
  'reportCareer',
  'reportMarriage',
  'reportRelationship',
  'reportFinance',
  'reportYearly',
];

export default function ReportsScreen() {
  const { t } = useI18n();
  return (
    <Screen>
      <AppHeader title={t('reportsTitle')} back />
      <AppText variant="body">{t('reportsBody')}</AppText>
      {reports.map((report) => (
        <PremiumCard key={report}>
          <AppText variant="title" style={{ fontSize: 26 }}>
            {t(report)}
          </AppText>
          <AppText variant="muted">{t('reportStatus')}</AppText>
        </PremiumCard>
      ))}
    </Screen>
  );
}
