import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import { Field } from '@/components/Field';
import { PremiumCard } from '@/components/PremiumCard';
import { Screen } from '@/components/Screen';
import { loginSchema, type LoginInput } from '@/domain/auth';
import { useI18n } from '@/i18n/I18n';
import { useAppState } from '@/state/AppState';

export default function LoginScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const app = useAppState();
  const [notice, setNotice] = useState(false);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  function continueOnDevice(values: LoginInput) {
    const displayName = values.email.split('@')[0]?.replace(/[._-]+/g, ' ') || t('guestName');
    app.startPreview({ displayName, email: values.email });
    router.replace('/home');
  }

  return (
    <Screen>
      <AppHeader eyebrow={t('sanskrit')} title={t('authTitle')} back />
      <AppText variant="body">{t('authBody')}</AppText>
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
      <Pressable onPress={() => router.push('/forgot-password')}>
        <AppText variant="muted">{t('forgot')}</AppText>
      </Pressable>
      <PrimaryButton
        label={t('login')}
        onPress={form.handleSubmit(() => setNotice(true))}
      />
      {notice ? (
        <PremiumCard>
          <AppText variant="body">{t('authBody')}</AppText>
          <SecondaryButton
            label={t('useDevicePreview')}
            onPress={form.handleSubmit(continueOnDevice)}
          />
        </PremiumCard>
      ) : null}
      <View style={styles.row}>
        <AppText variant="muted">{t('needAccount')}</AppText>
        <Pressable onPress={() => router.push('/signup')}>
          <AppText>{t('signup')}</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
});
