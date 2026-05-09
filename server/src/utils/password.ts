export const PASSWORD_RULES = [
  'Minimum 8 characters',
  'At least 1 uppercase letter',
  'At least 1 lowercase letter',
  'At least 1 number',
  'At least 1 special character',
] as const

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d^].{7,}$/

export function isStrongPassword(value: string) {
  if (value.length < 8) return false
  if (!/[A-Z]/.test(value)) return false
  if (!/[a-z]/.test(value)) return false
  if (!/\d/.test(value)) return false
  if (!/[^A-Za-z\d]/.test(value)) return false
  return true
}

export function getPasswordValidationMessage(value: string) {
  return isStrongPassword(value)
    ? undefined
    : 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
}
