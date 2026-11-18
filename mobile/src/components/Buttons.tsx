import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({ label, onPress, disabled, loading }: Props) {
  const theme = useTheme();
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.button, opacity: inactive ? 0.45 : pressed ? 0.86 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.buttonText} />
      ) : (
        <AppText variant="button" style={{ color: theme.buttonText }}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, disabled }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: 'transparent',
          borderColor: theme.line,
          borderWidth: 1,
          opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
        },
      ]}
    >
      <AppText variant="button">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
});
