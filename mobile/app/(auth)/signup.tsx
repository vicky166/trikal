import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import { Field } from '@/components/Field';
import { PremiumCard } from '@/components/PremiumCard';
import { Screen } from '@/components/Screen';
import { signupSchema, type SignupInput } from '@/domain/auth';
import { useI18n } from '@/i18n/I18n';
import { useAppState } from '@/state/AppState';

export default function SignupScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const app = useAppState();
  const [notice, setNotice] = useState(false);
  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { displayName: '', email: '', password: '' },
  });

  return (
    <Screen>
      <AppHeader eyebrow={t('sanskrit')} title={t('signup')} back />
      <AppText variant="body">{t('authBody')}</AppText>
      <Field
        label={t('displayName')}
        value={form.watch('displayName')}
        onChangeText={(value) => form.setValue('displayName', value, { shouldValidate: true })}
        error={form.formState.errors.displayName?.message}
      />
      <Field
        label={t('email')}
        value={form.watch('email')}
        onChangeText={(value) => form.setValue('email', value, { shouldValidate: true })}
        autoCapitalize="none"
        keyboardType="email-address"
        error={form.formState.errors.email?.message}
      />
      <Field
        label={t('password')}
        value={form.watch('password')}
        onChangeText={(value) => form.setValue('password', value, { shouldValidate: true })}
        secureTextEntry
        autoCapitalize="none"
        error={form.formState.errors.password?.message}
      />
      <PrimaryButton label={t('signup')} onPress={form.handleSubmit(() => setNotice(true))} />
      {notice ? (
        <PremiumCard>
          <AppText variant="body">{t('authBody')}</AppText>
          <SecondaryButton
            label={t('useDevicePreview')}
            onPress={form.handleSubmit((values) => {
              app.startPreview({ displayName: values.displayName, email: values.email });
              router.replace('/home');
            })}
          />
        </PremiumCard>
      ) : null}
      <Pressable onPress={() => router.push('/login')}>
        <AppText variant="muted">{t('haveAccount')}</AppText>
      </Pressable>
    </Screen>
  );
}
