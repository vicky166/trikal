import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email().max(120),
  password: z.string().min(8).max(72),
});

export const signupSchema = loginSchema.extend({
  displayName: z.string().trim().min(2).max(80),
});

export const forgotSchema = z.object({
  email: z.string().trim().email().max(120),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
