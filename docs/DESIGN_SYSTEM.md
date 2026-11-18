# TRIKAL — Design system

## Intent

Night before a lamp is lit. Ink, indigo, and a thin line of temple gold. The interface should feel still. It should not look like a chat template, a purple gradient startup, or another astrology app's home screen.

Trikal means three times. The mark is three arcs around a bindu: past, present, future. It is drawn in the app. It is not a stock icon.

## Colour

Dark is the default. Light tokens exist so components never hardcode a hex.

| Token | Dark | Light | Use |
| --- | --- | --- | --- |
| background | `#090814` | `#F6F1E8` | Screen |
| backgroundRaised | `#120F1C` | `#FFFBF5` | Bars, sheets |
| card | `#171322` | `#FFFFFF` | Cards |
| cardMuted | `#1E1930` | `#F3EBE0` | Secondary panels |
| line | `rgba(212, 184, 122, 0.28)` | `rgba(92, 68, 32, 0.18)` | Hairlines |
| gold | `#C6A36A` | `#8C6730` | Mark, small emphasis |
| goldSoft | `#E4D2A8` | `#6E5228` | Secondary gold text on dark only; on light use gold |
| ivory | `#F3EDE2` | `#1A1524` | Primary text |
| muted | `#9C93A8` | `#645C70` | Secondary text |
| violet | `#6E5A8A` | `#5C4A78` | Rare supporting tone |
| danger | `#D47A72` | `#9C3E3A` | Errors |
| success | `#8AA884` | `#3E6848` | Confirmation |

Gold is for the mark, a one-pixel edge, and a single word. It is not a fill for large buttons. Primary actions are ivory on ink, or ink on ivory in light mode.

Do not add extra gradients. The only field is a very slow wash from background to a slightly raised indigo at the top of the splash.

## Type

| Role | Family | Notes |
| --- | --- | --- |
| Wordmark, screen titles | Cormorant Garamond | High contrast serif. Sizes 28–44. Tight leading. |
| Sanskrit and Hindi display | Tiro Devanagari Sanskrit | The word त्रिकाल and short Sanskrit labels. |
| UI, body, forms | Outfit | 14–16 body. 12 only for meta text, never for a task. |

Line length on a phone stays under about 38 characters for titles. Body line height is about 1.45.

## Space

4, 8, 12, 16, 20, 24, 32, 48. Screen padding is 20. Card padding is 16 or 20. Related items sit 8 apart. Sections sit 24 apart.

Radius: 14 for controls, 18 for cards. No mixed random radii.

## Mark and motif

- Mark: three open arcs and a bindu, stroke 1.25, gold.
- A chart wheel, when shown empty, is a hairline circle and twelve ticks. It is not a populated Kundli.
- No full-bleed mandala. A few hairline triangles may sit behind the splash at under 8% opacity.

## Motion

- Splash stars: opacity only, slow, few.
- Screen changes: the platform stack transition.
- No bouncing cards, no parallax, no looping gold shimmer.

## Web

The same tokens are the Tailwind theme in `web/src/index.css`. Public pages use the dark theme. Type is self-hosted: Cormorant Garamond, Outfit, and Tiro Devanagari Sanskrit. The mark is the same three arcs and bindu, drawn in SVG.

## Components

| Component | Role |
| --- | --- |
| `PrimaryButton` | One main action per view. |
| `SecondaryButton` | Dismiss, skip, secondary path. |
| `AppHeader` | Title, optional Sanskrit, back. |
| `PremiumCard` | Membership invitation. Not a fake price charge. |
| `HoroscopeCard` | One rashi. Name and period. No invented prediction text. |
| `PlanetCard` | A planet row. Degrees only when the API sent them. |
| `BirthDetailsForm` | Validated birth profile. |
| `ChatMessage` | Person or guide. Guide messages only from the server. |
| `LoadingState` | Skeleton blocks in the card colour. |
| `EmptyState` | What is missing and the next action. |
| `ErrorState` | What failed and a retry. |
| `BottomNavigation` | The five tabs. |
| `SubscriptionCard` | One plan. Purchase stays disabled until billing exists. |

## Layout

- Design width: a modern Android phone, with padding that still holds on a narrow 360dp screen and a large phone.
- Respect safe areas.
- Thumb reach: the primary action sits in the lower half of forms.
- Both themes must remain readable. Muted text is never below the token.

## Voice

Calm, specific, and short. Say "reading" or "interpretation", not "guaranteed" or "destiny confirmed". Name the missing fact when the app cannot continue.

Example question chips are labelled as examples. They are not sample answers.
