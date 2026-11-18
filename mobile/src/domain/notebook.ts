import type { Language } from '../i18n/languages';
import { dayOfYear } from './time';

const notes: Record<Language, string[]> = {
  en: [
    'A nakshatra is the Moon’s mansion. It describes a quality of mind, not a promise.',
    'Lagna needs an exact birth time. Without it, the house chart stays closed.',
    'A Guna score compares two charts. It is not a verdict on two people.',
    'Dasha is a timing frame. It does not force an event.',
    'The tropical sign and the Vedic rashi are different measurements.',
    'A daily horoscope speaks to a rashi, not to every detail of one life.',
    'Interpretation follows calculation. The order is the whole method.',
  ],
  hi: [
    'नक्षत्र चंद्रमा का घर है। यह मन की प्रवृत्ति बताता है, कोई वचन नहीं।',
    'लग्न के लिए जन्म का सही समय चाहिए। समय के बिना भाव चक्र नहीं खुलता।',
    'गुण मिलान दो कुंडलियों की तुलना है। यह दो लोगों का फ़ैसला नहीं।',
    'दशा समय का ढाँचा है। वह किसी घटना को बाध्य नहीं करती।',
    'ट्रॉपिकल राशि और वैदिक राशि अलग माप हैं।',
    'दैनिक राशिफल एक राशि से बात करता है, एक पूरे जीवन से नहीं।',
    'अर्थ गणना के बाद आता है। यही क्रम पूरी विधि है।',
  ],
  hinglish: [
    'Nakshatra Chandra ka ghar hai. Ye swabhav batata hai, koi promise nahi.',
    'Lagna ke liye exact birth time chahiye. Bina time ke house chart band rehta hai.',
    'Guna score do charts ki comparison hai. Do logon ka faisla nahi.',
    'Dasha timing ka frame hai. Wo kisi event ko force nahi karti.',
    'Tropical sign aur Vedic rashi alag measurement hain.',
    'Daily horoscope ek rashi se baat karta hai, poori zindagi se nahi.',
    'Pehle calculation, phir interpretation. Yahi method hai.',
  ],
};

export function notebookNote(date: Date, language: Language): string {
  const list = notes[language];
  return list[dayOfYear(date) % list.length] ?? list[0];
}
