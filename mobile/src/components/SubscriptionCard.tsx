import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import { SecondaryButton } from './Buttons';

export function SubscriptionCard({
  name,
  body,
  status,
  actionLabel,
  onPress,
  disabled,
}: {
  name: string;
  body: string;
  status: string;
  actionLabel?: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.line }]}>
      <AppText variant="label" style={{ color: theme.gold }}>
        {status}
      </AppText>
      <AppText variant="title" style={styles.name}>
        {name}
      </AppText>
      <AppText variant="muted">{body}</AppText>
      {actionLabel && onPress ? (
        <SecondaryButton label={actionLabel} onPress={onPress} disabled={disabled} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  name: {
    fontSize: 28,
  },
});
