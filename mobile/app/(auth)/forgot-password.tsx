import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/Buttons';
import { PremiumCard } from '@/components/PremiumCard';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { forgotSchema } from '@/domain/auth';
import { useI18n } from '@/i18n/I18n';

export default function ForgotPasswordScreen() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const form = useForm<{ email: string }>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  return (
    <Screen>
      <AppHeader title={t('forgot')} back />
      <Field
        label={t('email')}
        value={form.watch('email')}
        onChangeText={(value) => form.setValue('email', value, { shouldValidate: true })}
        autoCapitalize="none"
        keyboardType="email-address"
        error={form.formState.errors.email?.message}
      />
      <PrimaryButton label={t('sendReset')} onPress={form.handleSubmit(() => setSent(true))} />
      {sent ? (
        <PremiumCard>
          <AppText variant="body">{t('resetUnavailable')}</AppText>
        </PremiumCard>
      ) : null}
    </Screen>
  );
}
