import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { BirthDetailsForm } from '@/components/BirthDetailsForm';
import { Screen } from '@/components/Screen';
import type { BirthProfileInput } from '@/domain/birthProfile';
import { useI18n } from '@/i18n/I18n';
import { useAppState } from '@/state/AppState';
import { useTheme } from '@/theme/ThemeProvider';

export default function BirthProfileScreen() {
  const { t } = useI18n();
  const theme = useTheme();
  const app = useAppState();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const editing = app.profiles.find((profile) => profile.id === params.id);

  function save(input: BirthProfileInput) {
    const saved = app.saveProfile(input, editing?.id);
    app.setPrimary(saved.id);
    router.replace('/home');
  }

  return (
    <Screen>
      <AppHeader eyebrow={t('sanskrit')} title={editing ? t('editProfile') : t('birthTitle')} back />
      <AppText variant="body">{t('birthBody')}</AppText>
      {app.profiles.length > 0 ? (
        <View style={styles.list}>
          <AppText variant="label">{t('savedProfiles')}</AppText>
          {app.profiles.map((profile) => {
            const primary = profile.id === app.primaryProfileId;
            return (
              <View key={profile.id} style={[styles.row, { borderColor: theme.line }]}>
                <View style={styles.copy}>
                  <AppText>{profile.fullName}</AppText>
                  <AppText variant="muted">
                    {profile.cityLabel}
                    {primary ? ` · ${t('primary')}` : ''}
                  </AppText>
                </View>
                <Pressable onPress={() => app.setPrimary(profile.id)}>
                  <AppText variant="muted">{t('setPrimary')}</AppText>
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : null}
      <BirthDetailsForm
        key={editing?.id ?? 'new'}
        initial={editing ?? undefined}
        onSubmit={save}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  row: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
