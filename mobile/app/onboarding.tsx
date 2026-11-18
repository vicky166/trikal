import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import { Mark } from '@/components/Mark';
import { Screen } from '@/components/Screen';
import { useI18n } from '@/i18n/I18n';
import { languages, type Language } from '@/i18n/languages';
import { useAppState } from '@/state/AppState';
import { useTheme } from '@/theme/ThemeProvider';

const steps = ['onboardingOne', 'onboardingTwo', 'onboardingThree'] as const;

export default function OnboardingScreen() {
  const { t } = useI18n();
  const theme = useTheme();
  const app = useAppState();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<Language>(app.language);
  const languageStep = step === steps.length;

  function finish(nextLanguage: Language) {
    app.completeOnboarding(nextLanguage);
    router.replace('/home');
  }

  return (
    <Screen
      footer={
        languageStep ? (
          <PrimaryButton label={t('continue')} onPress={() => finish(language)} />
        ) : (
          <View style={styles.actions}>
            <SecondaryButton label={t('skip')} onPress={() => finish(language)} />
            <View style={styles.grow}>
              <PrimaryButton label={t('next')} onPress={() => setStep((value) => value + 1)} />
            </View>
          </View>
        )
      }
    >
      <Mark size={64} color={theme.gold} />
      {languageStep ? (
        <View style={styles.copy}>
          <AppText variant="title">{t('languageTitle')}</AppText>
          <AppText variant="body">{t('languageBody')}</AppText>
          <View style={styles.languages}>
            {languages.map((item) => {
              const selected = item === language;
              const label = item === 'en' ? t('langEn') : item === 'hi' ? t('langHi') : t('langHinglish');
              return (
                <Pressable
                  key={item}
                  onPress={() => {
                    setLanguage(item);
                    app.setLanguage(item);
                  }}
                  style={[
                    styles.language,
                    {
                      borderColor: selected ? theme.gold : theme.line,
                      backgroundColor: theme.card,
                    },
                  ]}
                >
                  <AppText>{label}</AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.copy}>
          <AppText variant="label">
            {step + 1} / {steps.length + 1}
          </AppText>
          <AppText variant="title">
            {step === 0 ? t('onboardingOneTitle') : step === 1 ? t('onboardingTwoTitle') : t('onboardingThreeTitle')}
          </AppText>
          <AppText variant="body">
            {step === 0 ? t('onboardingOneBody') : step === 1 ? t('onboardingTwoBody') : t('onboardingThreeBody')}
          </AppText>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  copy: {
    gap: 12,
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  grow: {
    flex: 1,
  },
  languages: {
    gap: 10,
    marginTop: 8,
  },
  language: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
