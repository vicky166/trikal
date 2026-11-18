import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { useI18n } from '@/i18n/I18n';

export default function PrivacyScreen() {
  const { t } = useI18n();
  return (
    <Screen>
      <AppHeader title={t('privacy')} back />
      <AppText variant="body">{t('privacyBody')}</AppText>
    </Screen>
  );
}
