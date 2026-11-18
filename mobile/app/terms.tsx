import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { useI18n } from '@/i18n/I18n';

export default function TermsScreen() {
  const { t } = useI18n();
  return (
    <Screen>
      <AppHeader title={t('terms')} back />
      <AppText variant="body">{t('termsBody')}</AppText>
    </Screen>
  );
}
