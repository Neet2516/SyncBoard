export interface RegisterFormValues {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export interface LoginFormValues {
  email: string
  password: string
}

export type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>
export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>

function validateEmail(email: string) {
  if (!email.trim()) return 'Email is required'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim()) ? '' : 'Enter a valid email address'
}

function validatePassword(password: string) {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must include at least 1 uppercase letter'
  if (!/[a-z]/.test(password)) return 'Password must include at least 1 lowercase letter'
  if (!/\d/.test(password)) return 'Password must include at least 1 number'
  if (!/[^A-Za-z\d]/.test(password)) return 'Password must include at least 1 special character'
  return ''
}

export function validateRegisterForm(values: RegisterFormValues): RegisterFormErrors {
  const errors: RegisterFormErrors = {}

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required'
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters'
  }

  const emailError = validateEmail(values.email)
  if (emailError) errors.email = emailError

  const passwordError = validatePassword(values.password)
  if (passwordError) errors.password = passwordError

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm password is required'
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return errors
}

export function validateLoginForm(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {}

  const emailError = validateEmail(values.email)
  if (emailError) errors.email = emailError

  if (!values.password) {
    errors.password = 'Password is required'
  }

  return errors
}
