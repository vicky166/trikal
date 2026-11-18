import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';

export function PlanetCard({ name, value }: { name: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.line }]}>
      <AppText variant="label">{name}</AppText>
      <AppText variant="body" style={{ fontFamily: theme.fontSansMedium }}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 8,
    minHeight: 84,
  },
});
