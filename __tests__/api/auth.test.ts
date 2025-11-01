/**
 * Tests for /api/auth/login endpoint
 * 
 * Tests cover:
 * - Admin login flow
 * - User login flow (MST + password)
 * - Error cases
 * - Security validations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/login/route'

// Mock dependencies
vi.mock('@/lib/firebase-admin', () => ({
  adminAuth: {
    getUserByEmail: vi.fn(),
    createUser: vi.fn(),
    setCustomUserClaims: vi.fn(),
  },
  adminDb: {
    collection: vi.fn(() => ({
      where: vi.fn(() => ({
        limit: vi.fn(() => ({
          get: vi.fn(),
        })),
        get: vi.fn(),
      })),
      doc: vi.fn(() => ({
        update: vi.fn(),
      })),
    })),
  },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
}))

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Admin Login', () => {
    it('should login admin with valid email and password', async () => {
      const { adminDb, adminAuth } = await import('@/lib/firebase-admin')
      
      // Mock Firestore response
      const mockUsersSnapshot = {
        empty: false,
        docs: [{
          id: 'admin-1',
          data: () => ({
            email: 'admin@etax.local',
            password: 'admin123', // In real app, should be hashed
            role: 'admin',
            name: 'Quản trị viên',
          }),
        }],
      }

      vi.mocked(adminDb.collection).mockReturnValue({
        where: vi.fn(() => ({
          limit: vi.fn(() => ({
            get: vi.fn().mockResolvedValue(mockUsersSnapshot),
          })),
        })) as any,
      } as any)

      vi.mocked(adminAuth.getUserByEmail).mockResolvedValue({
        uid: 'firebase-uid-123',
        email: 'admin@etax.local',
      } as any)

      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@etax.local',
          password: 'admin123',
        }),
      })

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user.email).toBe('admin@etax.local')
    })

    it('should reject admin login with invalid password', async () => {
      const { adminDb } = await import('@/lib/firebase-admin')
      
      const mockUsersSnapshot = {
        empty: false,
        docs: [{
          id: 'admin-1',
          data: () => ({
            email: 'admin@etax.local',
            password: 'admin123',
            role: 'admin',
          }),
        }],
      }

      vi.mocked(adminDb.collection).mockReturnValue({
        where: vi.fn(() => ({
          limit: vi.fn(() => ({
            get: vi.fn().mockResolvedValue(mockUsersSnapshot),
          })),
        })) as any,
      } as any)

      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@etax.local',
          password: 'wrong-password',
        }),
      })

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(401)
      expect(data.error).toContain('Sai email hoặc mật khẩu')
    })

    it('should reject non-admin user trying to login as admin', async () => {
      const { adminDb } = await import('@/lib/firebase-admin')
      
      const mockUsersSnapshot = {
        empty: false,
        docs: [{
          id: 'user-1',
          data: () => ({
            email: 'user@etax.local',
            password: '123456',
            role: 'user', // Not admin
          }),
        }],
      }

      vi.mocked(adminDb.collection).mockReturnValue({
        where: vi.fn(() => ({
          limit: vi.fn(() => ({
            get: vi.fn().mockResolvedValue(mockUsersSnapshot),
          })),
        })) as any,
      } as any)

      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@etax.local',
          password: '123456',
        }),
      })

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(403)
      expect(data.error).toContain('Không có quyền admin')
    })
  })

  describe('User Login (MST + Password)', () => {
    it('should login user with valid MST and password', async () => {
      const { adminDb, adminAuth } = await import('@/lib/firebase-admin')
      
      const mockUsersSnapshot = {
        docs: [{
          id: 'user-1',
          data: () => ({
            role: 'user',
            password: '123456',
            mstList: ['00109202830'],
            name: 'Tử Xuân Chiến',
          }),
        }],
      }

      vi.mocked(adminDb.collection).mockReturnValue({
        where: vi.fn(() => ({
          get: vi.fn().mockResolvedValue(mockUsersSnapshot),
        })) as any,
      } as any)

      vi.mocked(adminAuth.getUserByEmail).mockResolvedValue({
        uid: 'firebase-uid-456',
        email: '00109202830@mst.local',
      } as any)

      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          mst: '00109202830',
          password: '123456',
        }),
      })

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user.mst).toBe('00109202830')
    })

    it('should reject user login with invalid MST', async () => {
      const { adminDb } = await import('@/lib/firebase-admin')
      
      const mockUsersSnapshot = {
        docs: [],
      }

      vi.mocked(adminDb.collection).mockReturnValue({
        where: vi.fn(() => ({
          get: vi.fn().mockResolvedValue(mockUsersSnapshot),
        })) as any,
      } as any)

      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          mst: '99999999999',
          password: '123456',
        }),
      })

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(401)
      expect(data.error).toContain('Sai MST hoặc mật khẩu')
    })

    it('should normalize MST by trimming whitespace', async () => {
      const { adminDb, adminAuth } = await import('@/lib/firebase-admin')
      
      const mockUsersSnapshot = {
        docs: [{
          id: 'user-1',
          data: () => ({
            role: 'user',
            password: '123456',
            mstList: ['00109202830'],
            name: 'Tử Xuân Chiến',
          }),
        }],
      }

      vi.mocked(adminDb.collection).mockReturnValue({
        where: vi.fn(() => ({
          get: vi.fn().mockResolvedValue(mockUsersSnapshot),
        })) as any,
      } as any)

      vi.mocked(adminAuth.getUserByEmail).mockResolvedValue({
        uid: 'firebase-uid-456',
        email: '00109202830@mst.local',
      } as any)

      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          mst: '  00109202830  ', // With spaces
          password: '123456',
        }),
      })

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.user.mst).toBe('00109202830') // Trimmed
    })
  })

  describe('Error Handling', () => {
    it('should return 400 when missing login credentials', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(400)
      expect(data.error).toContain('Thiếu thông tin đăng nhập')
    })

    it('should handle Firebase errors gracefully', async () => {
      const { adminDb } = await import('@/lib/firebase-admin')
      
      vi.mocked(adminDb.collection).mockImplementation(() => {
        throw new Error('Firebase connection failed')
      })

      const req = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@etax.local',
          password: 'admin123',
        }),
      })

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(500)
      expect(data.error).toBeTruthy()
    })
  })

  describe('Security', () => {
    it('should set HttpOnly cookie flag', async () => {
      // This test would verify cookie flags
      // Requires integration test with actual server
    })

    it('should set secure flag in production', async () => {
      // This test would verify secure cookie flag
      // Requires integration test
    })
  })
})





