import bcrypt from 'bcryptjs'

export interface AdminUser {
  id: string
  email: string
  role: 'owner' | 'creator' | 'viewer'
  name: string
}

// Temporary admin credentials (will move to database later)
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@gritcollective.com',
  password: process.env.ADMIN_PASSWORD || 'supersecret123',
  user: {
    id: '1',
    email: process.env.ADMIN_EMAIL || 'admin@gritcollective.com',
    role: 'owner' as const,
    name: 'Admin User'
  }
}

export async function validateCredentials(email: string, password: string): Promise<AdminUser | null> {
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    return ADMIN_CREDENTIALS.user
  }
  return null
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Session management (simple cookie-based for now)
export function createSession(user: AdminUser) {
  return {
    user,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}