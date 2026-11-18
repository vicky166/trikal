import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { useI18n } from '@/i18n/I18n';

export default function AboutScreen() {
  const { t } = useI18n();
  return (
    <Screen>
      <AppHeader eyebrow={t('sanskrit')} title={t('about')} back />
      <AppText variant="body">{t('aboutBody')}</AppText>
      <AppText variant="muted">{t('tagline')}</AppText>
    </Screen>
  );
}
