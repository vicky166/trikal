import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';
import { PrimaryButton } from './Buttons';

export function LoadingState({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={theme.gold} />
      <AppText variant="muted">{label}</AppText>
    </View>
  );
}

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.block}>
      <AppText variant="title" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="body" style={styles.body}>
        {body}
      </AppText>
      {actionLabel && onAction ? <PrimaryButton label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

export function ErrorState({
  title,
  body,
  onRetry,
  retryLabel,
}: {
  title: string;
  body: string;
  onRetry?: () => void;
  retryLabel: string;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.block, { borderColor: theme.line, borderWidth: 1, borderRadius: 18, padding: 16 }]}>
      <AppText variant="body" style={{ fontFamily: theme.fontSansMedium, color: theme.danger }}>
        {title}
      </AppText>
      <AppText variant="muted">{body}</AppText>
      {onRetry ? <PrimaryButton label={retryLabel} onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 28,
  },
  block: {
    gap: 12,
  },
  title: {
    fontSize: 28,
  },
  body: {
    opacity: 0.9,
  },
});
