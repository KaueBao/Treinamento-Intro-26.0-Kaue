import { vi } from 'vitest';
import { Role } from '@/generated/prisma';

const TEST_USER_ID = '11111111-1111-4111-8111-111111111111';

let currentRole: Role | null = null
let currentUser: any = null
let currentSession: any = null

export const getCurrentRole = () => currentRole;

export const setCurrentRole = (role: Role | null) => {
  currentRole = role
  
  if (role) {
    currentUser = {
      id: TEST_USER_ID,
      email: 'test@example.com',
      name: 'Test User'
    }
    currentSession = {
      id: 'test-session-id',
      userId: TEST_USER_ID,
      expiresAt: new Date(Date.now() + 864000),
      token: 'test-token'
    }
  } else {
    currentUser = null
    currentSession = null
  }
}

export const mockAuth = {
  api: {
    getSession: vi.fn().mockImplementation(() => {
      if (!currentSession) {
        return Promise.resolve({ data: null, error: null })
      }
      
      return Promise.resolve({
          user: currentUser,
          session: currentSession,
          role: currentRole
      })
    })
  }
}

export const mockGetUserRole = vi.fn().mockImplementation(() => {
  return Promise.resolve(currentRole)
})