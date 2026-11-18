import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { HoroscopeCard } from '@/components/HoroscopeCard';
import { Screen } from '@/components/Screen';
import { rashis } from '@/domain/rashis';
import { useI18n } from '@/i18n/I18n';

export default function HoroscopeScreen() {
  const { t, language } = useI18n();
  const router = useRouter();

  return (
    <Screen>
      <AppHeader eyebrow={t('sanskrit')} title={t('horoscopeTitle')} />
      <AppText variant="body">{t('horoscopeBody')}</AppText>
      <View style={styles.grid}>
        {rashis.map((rashi) => (
          <HoroscopeCard
            key={rashi.id}
            sanskrit={rashi.sa}
            title={language === 'en' ? rashi.en : rashi.hi}
            subtitle={language === 'en' ? rashi.hi : rashi.en}
            onPress={() => router.push(`/rashi/${rashi.id}`)}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
