import { z } from 'zod'
import { getPasswordValidationMessage } from '../utils/password'
import { normalizeWhitespace } from '../utils/sanitize'

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(254, 'Email is too long')
  .email('Enter a valid email address')
  .transform((value) => value.toLowerCase())

const fullNameSchema = z
  .string()
  .trim()
  .min(2, 'Full name must be at least 2 characters')
  .max(80, 'Full name must be 80 characters or fewer')
  .transform(normalizeWhitespace)

const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .superRefine((value, ctx) => {
    const message = getPasswordValidationMessage(value)
    if (message) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message })
    }
  })

export const registerSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      })
    }
  })

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
