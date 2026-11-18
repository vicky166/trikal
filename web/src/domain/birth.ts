import { z } from 'zod'
import { findCity } from './places.ts'

export const birthInputSchema = z
  .object({
    fullName: z.string().trim().min(2).max(80),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    timePrecision: z.enum(['exact', 'unknown']),
    birthTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable(),
    timeZone: z.string().trim().min(1).nullable(),
    cityId: z.string().trim().min(1).max(40).nullable(),
    cityLabel: z.string().trim().min(2).max(80),
    country: z.string().trim().min(2).max(56),
    latitude: z.number().gte(-90).lte(90).nullable(),
    longitude: z.number().gte(-180).lte(180).nullable(),
    gender: z.enum(['female', 'male', 'other', 'unspecified']),
  })
  .superRefine((value, context) => {
    const [yearText, monthText, dayText] = value.birthDate.split('-')
    const year = Number(yearText)
    const month = Number(monthText)
    const day = Number(dayText)
    const date = new Date(year, month - 1, day)
    const real = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    if (!real || year < 1900 || date.getTime() > Date.now()) {
      context.addIssue({ code: 'custom', message: 'Use a real date from 1900 through today.', path: ['birthDate'] })
    }
    if (value.timePrecision === 'exact' && !value.birthTime) {
      context.addIssue({ code: 'custom', message: 'Enter the birth time or mark it unknown.', path: ['birthTime'] })
    }
    if (value.timePrecision === 'unknown' && value.birthTime) {
      context.addIssue({ code: 'custom', message: 'Clear the clock when the time is unknown.', path: ['birthTime'] })
    }
    if (value.timeZone) {
      try {
        Intl.DateTimeFormat('en-IN', { timeZone: value.timeZone }).format(new Date())
      } catch {
        context.addIssue({ code: 'custom', message: 'Time zone is not recognized.', path: ['timeZone'] })
      }
    }
    if (value.cityId) {
      const city = findCity(value.cityId)
      if (!city) {
        context.addIssue({ code: 'custom', message: 'Choose a city from the list.', path: ['cityId'] })
      } else if (
        value.latitude !== city.latitude ||
        value.longitude !== city.longitude ||
        value.timeZone !== city.timeZone ||
        value.country !== city.country
      ) {
        context.addIssue({
          code: 'custom',
          message: 'Coordinates and time zone must match the selected city.',
          path: ['latitude'],
        })
      }
    } else if (value.latitude !== null || value.longitude !== null) {
      context.addIssue({
        code: 'custom',
        message: 'Coordinates are accepted only from the city list.',
        path: ['latitude'],
      })
    }
  })

export type BirthInput = z.infer<typeof birthInputSchema>

export function chartReady(input: BirthInput): 'ready' | 'time' | 'place' {
  if (input.timePrecision !== 'exact' || !input.birthTime || !input.timeZone) return 'time'
  if (input.latitude === null || input.longitude === null || !input.cityId) return 'place'
  return 'ready'
}

export const loginSchema = z.object({
  email: z.email().max(120),
  password: z.string().min(8).max(72),
})
