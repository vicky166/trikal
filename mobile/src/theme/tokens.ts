export type Theme = {
  mode: 'dark' | 'light';
  background: string;
  backgroundRaised: string;
  card: string;
  cardMuted: string;
  line: string;
  gold: string;
  ivory: string;
  muted: string;
  violet: string;
  danger: string;
  success: string;
  button: string;
  buttonText: string;
  secondary: string;
  fontSerif: string;
  fontSerifMedium: string;
  fontSans: string;
  fontSansMedium: string;
  fontSansSemibold: string;
  fontDevanagari: string;
};

const type = {
  fontSerif: 'CormorantGaramond_600SemiBold',
  fontSerifMedium: 'CormorantGaramond_500Medium',
  fontSans: 'Outfit_400Regular',
  fontSansMedium: 'Outfit_500Medium',
  fontSansSemibold: 'Outfit_600SemiBold',
  fontDevanagari: 'TiroDevanagariSanskrit_400Regular',
};

export const darkTheme: Theme = {
  mode: 'dark',
  background: '#090814',
  backgroundRaised: '#120F1C',
  card: '#171322',
  cardMuted: '#1E1930',
  line: 'rgba(212, 184, 122, 0.28)',
  gold: '#C6A36A',
  ivory: '#F3EDE2',
  muted: '#9C93A8',
  violet: '#6E5A8A',
  danger: '#D47A72',
  success: '#8AA884',
  button: '#F3EDE2',
  buttonText: '#14111A',
  secondary: '#241E33',
  ...type,
};

export const lightTheme: Theme = {
  mode: 'light',
  background: '#F6F1E8',
  backgroundRaised: '#FFFBF5',
  card: '#FFFFFF',
  cardMuted: '#F3EBE0',
  line: 'rgba(92, 68, 32, 0.18)',
  gold: '#8C6730',
  ivory: '#1A1524',
  muted: '#645C70',
  violet: '#5C4A78',
  danger: '#9C3E3A',
  success: '#3E6848',
  button: '#1A1524',
  buttonText: '#F6F1E8',
  secondary: '#E7DCCB',
  ...type,
};
