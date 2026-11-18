import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';

export function PremiumCard({
  children,
  muted = false,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: muted ? theme.cardMuted : theme.card,
          borderColor: theme.line,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return <AppText variant="label">{children}</AppText>;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    gap: 8,
  },
});
