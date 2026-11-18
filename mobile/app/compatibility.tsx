import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/Buttons';
import { PremiumCard } from '@/components/PremiumCard';
import { Screen } from '@/components/Screen';
import { EmptyState } from '@/components/States';
import { useI18n } from '@/i18n/I18n';
import { useAppState } from '@/state/AppState';
import { useTheme } from '@/theme/ThemeProvider';

export default function CompatibilityScreen() {
  const { t } = useI18n();
  const theme = useTheme();
  const app = useAppState();
  const router = useRouter();
  const [first, setFirst] = useState<string | null>(app.profiles[0]?.id ?? null);
  const [second, setSecond] = useState<string | null>(app.profiles[1]?.id ?? null);
  const [asked, setAsked] = useState(false);

  return (
    <Screen>
      <AppHeader title={t('compatibilityTitle')} back />
      <AppText variant="body">{t('compatibilityBody')}</AppText>
      {app.profiles.length < 2 ? (
        <EmptyState
          title={t('compatibilityTitle')}
          body={t('needTwo')}
          actionLabel={t('addProfile')}
          onAction={() => router.push('/birth-profile')}
        />
      ) : (
        <>
          {app.profiles.map((profile) => (
            <View key={profile.id} style={styles.row}>
              <AppText>{profile.fullName}</AppText>
              <View style={styles.picks}>
                <Pressable onPress={() => setFirst(profile.id)}>
                  <AppText style={{ color: first === profile.id ? theme.gold : theme.muted }}>A</AppText>
                </Pressable>
                <Pressable onPress={() => setSecond(profile.id)}>
                  <AppText style={{ color: second === profile.id ? theme.gold : theme.muted }}>B</AppText>
                </Pressable>
              </View>
            </View>
          ))}
          <PrimaryButton
            label={t('calculate')}
            disabled={!first || !second || first === second}
            onPress={() => setAsked(true)}
          />
          {asked ? (
            <PremiumCard>
              <AppText variant="body">{t('noScore')}</AppText>
            </PremiumCard>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  picks: {
    flexDirection: 'row',
    gap: 16,
  },
});
