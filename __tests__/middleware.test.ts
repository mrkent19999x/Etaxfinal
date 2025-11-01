/**
 * Tests for Next.js middleware
 * 
 * Tests cover:
 * - Public path access
 * - Protected path redirects
 * - Admin route protection
 * - Session validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '@/middleware'

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server')
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(() => ({ type: 'next' })),
      redirect: vi.fn((url) => ({ type: 'redirect', url: url.toString() })),
    },
  }
})

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Public Paths', () => {
    it('should allow access to /login', async () => {
      const req = new NextRequest('http://localhost:3000/login')
      const res = await middleware(req)
      
      expect(NextResponse.next).toHaveBeenCalled()
    })

    it('should allow access to /admin/login', async () => {
      const req = new NextRequest('http://localhost:3000/admin/login')
      const res = await middleware(req)
      
      expect(NextResponse.next).toHaveBeenCalled()
    })

    it('should allow access to /api/auth/login', async () => {
      const req = new NextRequest('http://localhost:3000/api/auth/login')
      const res = await middleware(req)
      
      expect(NextResponse.next).toHaveBeenCalled()
    })

    it('should allow access to static assets', async () => {
      const req = new NextRequest('http://localhost:3000/_next/static/chunk.js')
      const res = await middleware(req)
      
      expect(NextResponse.next).toHaveBeenCalled()
    })
  })

  describe('Protected User Routes', () => {
    it('should redirect to /login when no session cookie', async () => {
      const req = new NextRequest('http://localhost:3000/thong-bao')
      const res = await middleware(req)
      
      expect(NextResponse.redirect).toHaveBeenCalled()
      const redirectCall = vi.mocked(NextResponse.redirect).mock.calls[0][0]
      expect(redirectCall.toString()).toContain('/login')
    })

    it('should allow access with valid session cookie', async () => {
      const sessionData = JSON.stringify({
        uid: 'user-123',
        mst: '00109202830',
        admin: false,
      })
      
      const req = new NextRequest('http://localhost:3000/thong-bao', {
        headers: {
          cookie: `etax_session=${encodeURIComponent(sessionData)}`,
        },
      })
      
      const res = await middleware(req)
      expect(NextResponse.next).toHaveBeenCalled()
    })
  })

  describe('Admin Routes', () => {
    it('should redirect to /admin/login when accessing /admin without session', async () => {
      const req = new NextRequest('http://localhost:3000/admin')
      const res = await middleware(req)
      
      expect(NextResponse.redirect).toHaveBeenCalled()
      const redirectCall = vi.mocked(NextResponse.redirect).mock.calls[0][0]
      expect(redirectCall.toString()).toContain('/admin/login')
    })

    it('should redirect to /admin/login when user session is not admin', async () => {
      const sessionData = JSON.stringify({
        uid: 'user-123',
        mst: '00109202830',
        admin: false, // Not admin
      })
      
      const req = new NextRequest('http://localhost:3000/admin', {
        headers: {
          cookie: `etax_session=${encodeURIComponent(sessionData)}`,
        },
      })
      
      const res = await middleware(req)
      expect(NextResponse.redirect).toHaveBeenCalled()
      const redirectCall = vi.mocked(NextResponse.redirect).mock.calls[0][0]
      expect(redirectCall.toString()).toContain('/admin/login')
    })

    it('should allow access to /admin with valid admin session', async () => {
      const sessionData = JSON.stringify({
        uid: 'admin-123',
        email: 'admin@etax.local',
        admin: true,
      })
      
      const req = new NextRequest('http://localhost:3000/admin', {
        headers: {
          cookie: `etax_session=${encodeURIComponent(sessionData)}`,
        },
      })
      
      const res = await middleware(req)
      expect(NextResponse.next).toHaveBeenCalled()
    })
  })

  describe('Session Validation', () => {
    it('should redirect when session cookie is invalid JSON', async () => {
      const req = new NextRequest('http://localhost:3000/thong-bao', {
        headers: {
          cookie: 'etax_session=invalid-json',
        },
      })
      
      const res = await middleware(req)
      expect(NextResponse.redirect).toHaveBeenCalled()
    })

    it('should redirect when session cookie missing uid', async () => {
      const sessionData = JSON.stringify({
        // Missing uid
        mst: '00109202830',
      })
      
      const req = new NextRequest('http://localhost:3000/thong-bao', {
        headers: {
          cookie: `etax_session=${encodeURIComponent(sessionData)}`,
        },
      })
      
      const res = await middleware(req)
      expect(NextResponse.redirect).toHaveBeenCalled()
    })
  })
})





