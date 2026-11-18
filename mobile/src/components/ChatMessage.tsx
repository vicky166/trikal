import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './AppText';

export function ChatMessage({
  tone,
  body,
}: {
  tone: 'person' | 'note';
  body: string;
}) {
  const theme = useTheme();
  const person = tone === 'person';
  return (
    <View
      style={[
        styles.bubble,
        person ? styles.person : styles.note,
        {
          backgroundColor: person ? theme.secondary : theme.card,
          borderColor: theme.line,
        },
      ]}
    >
      <AppText variant="body">{body}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '92%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  person: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  note: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
});
