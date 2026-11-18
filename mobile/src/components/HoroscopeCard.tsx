import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';

export function HoroscopeCard({
  sanskrit,
  title,
  subtitle,
  onPress,
}: {
  sanskrit: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.line, opacity: pressed ? 0.82 : 1 },
      ]}
    >
      <AppText variant="sanskrit" style={{ color: theme.gold }}>
        {sanskrit}
      </AppText>
      <View style={styles.copy}>
        <AppText variant="body" style={{ fontFamily: theme.fontSansMedium }}>
          {title}
        </AppText>
        {subtitle ? <AppText variant="muted">{subtitle}</AppText> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    minHeight: 108,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    justifyContent: 'space-between',
    gap: 12,
  },
  copy: {
    gap: 2,
  },
});
