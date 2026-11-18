import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/Buttons';
import { ChatMessage } from '@/components/ChatMessage';
import { Screen } from '@/components/Screen';
import { ErrorState } from '@/components/States';
import { useI18n } from '@/i18n/I18n';
import type { CopyKey } from '@/i18n/copy';
import { useTheme } from '@/theme/ThemeProvider';

const chips: CopyKey[] = ['chipChart', 'chipCareer', 'chipMatch', 'chipDasha', 'chipNakshatra'];

export default function AskScreen() {
  const { t } = useI18n();
  const theme = useTheme();
  const [text, setText] = useState('');
  const [offline, setOffline] = useState(false);

  return (
    <Screen
      footer={
        <View style={styles.composer}>
          <TextInput
            value={text}
            onChangeText={(value) => {
              setText(value);
              setOffline(false);
            }}
            placeholder={t('askPlaceholder')}
            placeholderTextColor={theme.muted}
            multiline
            style={[
              styles.input,
              {
                color: theme.ivory,
                borderColor: theme.line,
                backgroundColor: theme.card,
                fontFamily: theme.fontSans,
              },
            ]}
          />
          <PrimaryButton
            label={t('askSend')}
            disabled={text.trim().length < 2}
            onPress={() => setOffline(true)}
          />
        </View>
      }
    >
      <AppHeader eyebrow={t('sanskrit')} title={t('askTitle')} />
      <ChatMessage tone="note" body={t('askBoundary')} />
      <AppText variant="label">{t('example')}</AppText>
      <View style={styles.chips}>
        {chips.map((chip) => (
          <Pressable
            key={chip}
            onPress={() => setText(t(chip))}
            style={[styles.chip, { borderColor: theme.line, backgroundColor: theme.card }]}
          >
            <AppText variant="muted">{t(chip)}</AppText>
          </Pressable>
        ))}
      </View>
      {offline ? <ErrorState title={t('askOffline')} body={t('askBoundary')} retryLabel={t('retry')} onRetry={() => setOffline(false)} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: {
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  composer: {
    gap: 10,
  },
  input: {
    minHeight: 52,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
});
