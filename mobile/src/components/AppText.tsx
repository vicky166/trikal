import { Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Variant = 'wordmark' | 'title' | 'sanskrit' | 'body' | 'muted' | 'label' | 'button';

const variantStyle: Record<Variant, TextStyle> = {
  wordmark: { fontSize: 42, letterSpacing: 6, lineHeight: 48 },
  title: { fontSize: 32, lineHeight: 36 },
  sanskrit: { fontSize: 18, lineHeight: 28 },
  body: { fontSize: 16, lineHeight: 24 },
  muted: { fontSize: 14, lineHeight: 21 },
  label: { fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', lineHeight: 16 },
  button: { fontSize: 16, lineHeight: 20 },
};

export function AppText({
  variant = 'body',
  style,
  ...props
}: TextProps & { variant?: Variant; style?: StyleProp<TextStyle> }) {
  const theme = useTheme();
  const fontFamily =
    variant === 'wordmark' || variant === 'title'
      ? theme.fontSerif
      : variant === 'sanskrit'
        ? theme.fontDevanagari
        : variant === 'button' || variant === 'label'
          ? theme.fontSansSemibold
          : theme.fontSans;
  const color = variant === 'muted' || variant === 'label' ? theme.muted : theme.ivory;
  return <Text {...props} style={[{ fontFamily, color }, variantStyle[variant], style]} />;
}
