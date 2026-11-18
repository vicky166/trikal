import assert from 'node:assert/strict';
import test from 'node:test';
import { cities } from './cities';
import { birthProfileInputSchema, chartReadiness } from './birthProfile';
import { isValidTimeZone } from './time';

const valid = {
  fullName: 'Meera Iyer',
  birthDate: '1994-03-12',
  timePrecision: 'exact' as const,
  birthTime: '06:40',
  cityId: 'chennai',
  cityLabel: 'Chennai',
  country: 'India',
  timeZone: 'Asia/Kolkata',
  latitude: 13.0827,
  longitude: 80.2707,
  gender: 'unspecified' as const,
};

test('accepts a complete birth profile', () => {
  const parsed = birthProfileInputSchema.parse(valid);
  assert.equal(chartReadiness(parsed), 'ready');
});

test('rejects a future date and an unknown time that still carries a clock value', () => {
  const future = birthProfileInputSchema.safeParse({
    ...valid,
    birthDate: '2999-01-01',
  });
  assert.equal(future.success, false);

  const mixed = birthProfileInputSchema.safeParse({
    ...valid,
    timePrecision: 'unknown',
    birthTime: '06:40',
  });
  assert.equal(mixed.success, false);
});

test('exact time without a clock is not chart-ready', () => {
  const parsed = birthProfileInputSchema.safeParse({
    ...valid,
    timePrecision: 'exact',
    birthTime: null,
  });
  assert.equal(parsed.success, false);
});

test('unknown time blocks lagna readiness even with a city', () => {
  const parsed = birthProfileInputSchema.parse({
    ...valid,
    timePrecision: 'unknown',
    birthTime: null,
  });
  assert.equal(chartReadiness(parsed), 'time');
});

test('a custom city without coordinates is not chart-ready', () => {
  const parsed = birthProfileInputSchema.parse({
    ...valid,
    cityId: null,
    cityLabel: 'A village',
    timeZone: null,
    latitude: null,
    longitude: null,
  });
  assert.equal(chartReadiness(parsed), 'place');
});

test('every gazetteer time zone is real', () => {
  for (const city of cities) {
    assert.equal(isValidTimeZone(city.timeZone), true, city.id);
  }
});
