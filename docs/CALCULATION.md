# Calculation method

TRIKAL calculates a chart in the browser. The guide does not calculate it.

## Ephemeris

[Astronomy Engine](https://github.com/cosinekitty/astronomy) 2.1.19, MIT licence. Geocentric true ecliptic longitude of date comes from `GeoVector` plus `Ecliptic`.

Swiss Ephemeris is not used. Its library is AGPL unless a separate commercial licence is purchased. That decision is still open, and the AGPL build is not in this repository.

## Ayanamsa

Mean Lahiri, anchored at 23.857056° at J2000, plus the IAU precession polynomial `5028.796195 T + 1.1054348 T²` arcseconds. Nutation is omitted. Published mean values at 12:00 UTC on 1 January 1900, 2000, and 2020 match within 0.01°. A true Lahiri value that includes nutation can differ by about 17 arcseconds.

## What is calculated

- Sidereal longitude of Sun, Moon, Mars, Mercury, Jupiter, Venus, and Saturn.
- Mean lunar node (Meeus) as Rahu, and Ketu opposite it. Both are marked retrograde by the mean motion. This is not the true node.
- Lagna from Greenwich apparent sidereal time, east longitude, and true obliquity of date.
- Whole-sign houses from the sidereal lagna.
- Nakshatra and pada from the sidereal longitude. One nakshatra is 13°20′. One pada is 3°20′.
- Navamsa by the movable / fixed / dual rule.
- Vimshottari dasha from the Moon’s nakshatra. A year in the balance is 365.25 days.
- Retrograde when the tropical longitude decreases over the next 24 hours.

A placement within 0.05° of a sign boundary is marked uncertain.

## What is withheld

- Any chart when the birth time is unknown, or when the place is not one of the listed city centres. Coordinates are not guessed.
- Yoni and Vashya points. The total out of 36 is therefore not shown.
- Written horoscope text, lucky numbers, and colours.
- Uranus, Neptune, and Pluto. They are not part of this Parashari chart.

## Place and time

Listed cities use published city-centre coordinates, not a street address. Local time is converted with the runtime IANA data, which includes daylight saving where that zone has it. India Standard Time is +05:30.

## Checked references

- Mean Lahiri: 22.4605° (1900), 23.8571° (2000), 24.1365° (2020), each at 12:00 UTC.
- Sidereal Sun at 2000-01-01 00:00 UTC within 0.5° of 16° Sagittarius, the figure in the Lahiri ephemeris tables for that instant.
- Ascendant increases by about 30° across two hours at the equator.
- 12:00 in London on 15 June 2020 converts to 11:00 UTC. 06:40 in Kolkata converts to 01:10 UTC.
