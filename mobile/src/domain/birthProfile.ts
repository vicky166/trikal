import { z } from 'zod';
import { isValidTimeZone } from './time';

export const genderSchema = z.enum(['female', 'male', 'other', 'unspecified']);

export const birthProfileInputSchema = z
  .object({
    fullName: z.string().trim().min(2).max(80),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    timePrecision: z.enum(['exact', 'unknown']),
    birthTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable(),
    cityId: z.string().trim().min(1).max(40).nullable(),
    cityLabel: z.string().trim().min(2).max(80),
    country: z.string().trim().min(2).max(56),
    timeZone: z.string().trim().min(1).max(64).nullable(),
    latitude: z.number().gte(-90).lte(90).nullable(),
    longitude: z.number().gte(-180).lte(180).nullable(),
    gender: genderSchema,
  })
  .superRefine((value, context) => {
    const [yearText, monthText, dayText] = value.birthDate.split('-');
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const date = new Date(year, month - 1, day);
    const real =
      date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    if (!real) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['birthDate'],
        message: 'Enter a real date.',
      });
    } else if (year < 1900 || date.getTime() > Date.now()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['birthDate'],
        message: 'Use a date from 1900 through today.',
      });
    }

    if (value.timePrecision === 'exact' && !value.birthTime) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['birthTime'],
        message: 'Enter the birth time, or mark it unknown.',
      });
    }

    if (value.timePrecision === 'unknown' && value.birthTime) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['birthTime'],
        message: 'Clear the birth time when it is unknown.',
      });
    }

    if (value.timeZone && !isValidTimeZone(value.timeZone)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['timeZone'],
        message: 'Time zone is not recognized.',
      });
    }

    const hasCoordinates = value.latitude !== null && value.longitude !== null;
    if (value.cityId && (!hasCoordinates || !value.timeZone)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cityId'],
        message: 'A listed city needs coordinates and a time zone.',
      });
    }
  });

export type BirthProfileInput = z.infer<typeof birthProfileInputSchema>;
export type Gender = z.infer<typeof genderSchema>;

export type BirthProfile = BirthProfileInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export function chartReadiness(profile: BirthProfileInput): 'ready' | 'time' | 'place' {
  if (profile.timePrecision !== 'exact' || !profile.birthTime) {
    return 'time';
  }
  if (
    profile.latitude === null ||
    profile.longitude === null ||
    !profile.timeZone ||
    !isValidTimeZone(profile.timeZone)
  ) {
    return 'place';
  }
  return 'ready';
}
