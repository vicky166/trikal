import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { useI18n } from '@/i18n/I18n';

export default function PlansScreen() {
  const { t } = useI18n();
  return (
    <Screen>
      <AppHeader title={t('plansTitle')} back />
      <AppText variant="body">{t('plansBody')}</AppText>
      <SubscriptionCard name={t('planFree')} body={t('planFreeBody')} status={t('currentAccess')} />
      <SubscriptionCard
        name={t('planMonthly')}
        body={t('planMonthlyBody')}
        status={t('purchaseOff')}
        actionLabel={t('purchaseOff')}
        disabled
        onPress={() => undefined}
      />
      <SubscriptionCard
        name={t('planYearly')}
        body={t('planYearlyBody')}
        status={t('purchaseOff')}
        actionLabel={t('purchaseOff')}
        disabled
        onPress={() => undefined}
      />
    </Screen>
  );
}
