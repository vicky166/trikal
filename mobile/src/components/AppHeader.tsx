import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';

export function AppHeader({
  title,
  eyebrow,
  back = false,
}: {
  title: string;
  eyebrow?: string;
  back?: boolean;
}) {
  const theme = useTheme();
  const router = useRouter();
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        {eyebrow ? (
          <AppText variant="sanskrit" style={{ color: theme.gold }}>
            {eyebrow}
          </AppText>
        ) : null}
        <AppText variant="title">{title}</AppText>
      </View>
      {back ? (
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <AppText variant="muted">←</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 4,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
});
