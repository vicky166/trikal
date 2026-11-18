# TRIKAL — Product requirements

Brand: **TRIKAL (त्रिकाल)**  
Tagline: **Discover Your Cosmic Path.**  
Philosophy: Vedic astrology, read with modern care. The sky is calculated. The meaning is interpretive.

The launch surface is the website and installable PWA in `web/`. The Expo app in `mobile/` remains the native client and is not removed.

## Problem

People want a personal astrology reading that respects birth data, speaks Hindi, English, and Hinglish, and does not invent the sky. Most chat products guess planetary positions. TRIKAL must not.

## Users

- First audience: adults in India, on Android phones.
- Later: Indian diaspora and other countries. Time zones and cities outside India are in scope from the data model onward.
- Not a product for frightening people, selling guaranteed outcomes, or giving medical, legal, or financial advice.

## Product principles

1. Calculation and interpretation are separate systems.
2. Missing birth data is asked for. It is never filled in by the model.
3. Readings are interpretations, not guaranteed events.
4. Paid limits are enforced on the server.
5. A person can read, export, and delete their own data.
6. If a service is not connected, the app says so. It does not invent a chart, a score, a payment, or an answer.

## Outcomes

- A person can learn what TRIKAL is, choose a language, and continue as a guest.
- A person can save one or more birth profiles with validated date, time, place, and time zone.
- A person can open a Kundli built from a verified calculation, including rashi, nakshatra, lagna, houses, degrees, and dasha when the engine supports them.
- A person can read daily, weekly, and monthly horoscopes for all 12 rashis, with career, love, health, finance, lucky number, and lucky colour, dated in a real time zone.
- A person can ask a question in Hindi, English, or Hinglish and receive an answer grounded in their calculated chart.
- A person can compare two birth profiles with Ashtakoota / Guna Milan when that calculation is available.
- A person can preview, buy, read, and export reports.
- A person can subscribe on Android through Google Play Billing, restore a purchase, and see what the plan allows.

## Scope by area

### Identity

Splash, onboarding, language, login, signup, email verification or OTP when the auth provider supports it, forgot password, logout, guest preview, account deletion.

Gender is optional and is not required to create a profile.

### Birth profile

Full name, date of birth, exact birth time or an explicit "time unknown" choice, city, country, time zone. Date and time pickers. Location search. Edit. Several saved profiles, one primary.

Unknown birth time must block claims that depend on lagna or the exact house chart.

### Home

Greeting, date, rashi, nakshatra, a daily preview, planetary insight, and shortcuts to Kundli, the guide, compatibility, and reports. A membership path and a notifications path. Quiet layout.

### Guide (Ask)

Questions, suggested prompts, Hindi / English / Hinglish, history, titles, new conversation, save, copy, retry, loading, and errors. Streaming only if the server supports it.

The guide refuses to state planetary positions when no calculation is attached.

### Kundli

North Indian chart. South Indian chart when the engine can lay it out. Planets, twelve houses, rashi, nakshatra, lagna, degrees, current dasha, dasha timeline, and a short interpretation tied to those numbers.

### Horoscope

All 12 rashis. Daily, weekly, monthly. Career, love, health, finance, lucky number, lucky colour. The date and time zone of the reading are visible.

### Compatibility

Two birth profiles. Result and explanation only from a real Guna Milan or an equivalent documented method. The limits of a score are written on the result.

### Reports

Birth, career, marriage, relationship, finance, and yearly. Preview, free and paid sections, detail, PDF export, purchase history. Same calculation rule as Kundli.

### Membership

Free, monthly, and yearly. Comparison, purchase, status, restore, cancellation terms, payment history. Android digital subscriptions go through Google Play Billing. The client never marks a payment successful.

### Profile

Personal details, birth details, language, notifications, subscription, saved reports, chats, privacy, help, about, terms, privacy policy, delete account, logout.

## Free and premium

Free:

- Daily horoscope
- A small daily number of guide questions
- A basic Kundli preview
- One birth profile

Premium:

- A higher daily question limit
- Detailed Kundli
- Advanced reports
- More saved profiles
- Saved conversations

Exact numbers are configuration, not hardcoded in scattered screens. The server is the source of truth.

## Non-goals for the current build

- A production payment charge
- A production Kundli number without an ephemeris
- A medical, legal, or investment product
- Copying the layout of an existing astrology app

## Acceptance for a feature to be called ready

- The happy path and the failure path both render.
- Inputs are validated.
- Private data is scoped to the signed-in person.
- Typecheck passes.
- The feature does not invent astrology, money, or identity.
