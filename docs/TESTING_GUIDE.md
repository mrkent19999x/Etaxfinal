# 🧪 Testing Guide

## 📋 Tổng Quan

Hệ thống testing cho eTax Web Application bao gồm:
- **Unit Tests**: Vitest cho API routes, hooks, utilities
- **E2E Tests**: Puppeteer cho end-to-end flows
- **Browser Tests**: MCP Browser tools cho manual/automated testing

---

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# With UI
npm run test:ui

# Coverage report
npm run test:coverage

# E2E tests (requires dev server)
npm run test:e2e:dev

# E2E tests with Vitest
npm run test:e2e:vitest
```

---

## 📝 Unit Tests

### Structure

```
__tests__/
├── api/              # API route tests
│   └── auth.test.ts
├── middleware.test.ts
├── hooks/            # Hook tests
├── lib/              # Service tests
└── e2e/              # E2E tests
    └── admin-to-user-flow.test.ts
```

### Writing Unit Tests

```typescript
import { describe, it, expect } from 'vitest'

describe('Feature Name', () => {
  it('should do something', () => {
    expect(true).toBe(true)
  })
})
```

### Mocking

```typescript
import { vi } from 'vitest'

vi.mock('@/lib/firebase-admin', () => ({
  adminAuth: {
    getUserByEmail: vi.fn(),
  },
}))
```

---

## 🌐 E2E Tests

### Structure

E2E tests use Puppeteer to test full user flows.

### Example Test

```typescript
import { describe, it, expect } from 'vitest'
import puppeteer from 'puppeteer'

describe('Login Flow', () => {
  it('should login successfully', async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    
    await page.goto('http://localhost:3000/login')
    await page.type('#mst-input', '00109202830')
    await page.type('#password-input', '123456')
    await page.click('button[type="submit"]')
    
    await page.waitForNavigation()
    expect(page.url()).not.toContain('/login')
    
    await browser.close()
  })
})
```

### Running E2E Tests

```bash
# Start dev server + run tests
npm run test:e2e:dev

# Or run tests separately (server must be running)
npm run test:e2e
```

---

## 🔍 Browser Tools Testing

### Using MCP Browser Tools

Có thể dùng MCP Browser tools để test thủ công hoặc automated:

1. **Navigate**: `@browser navigate to http://localhost:3000/login`
2. **Snapshot**: `@browser snapshot` (để xem page structure)
3. **Interact**: `@browser click`, `@browser type`
4. **Screenshot**: `@browser take_screenshot`

### Test Flow Example

```
1. Navigate to /admin/login
2. Take snapshot
3. Type email: admin@etax.local
4. Type password: admin123
5. Click submit button
6. Wait for navigation
7. Verify URL contains /admin
8. Take screenshot
```

---

## ✅ Test Checklist

### Admin Flow
- [ ] Admin login
- [ ] Admin dashboard access
- [ ] User management
- [ ] Content management
- [ ] Template management

### User Flow
- [ ] User login (MST + password)
- [ ] Home page access
- [ ] Navigation menu
- [ ] Feature pages (thông báo, tra cứu, etc.)
- [ ] Protected routes

### Security
- [ ] Route protection (middleware)
- [ ] Session validation
- [ ] Admin vs User separation
- [ ] Logout functionality

### Error Cases
- [ ] Invalid credentials
- [ ] Missing session
- [ ] Expired session
- [ ] Network errors

---

## 📊 Coverage Goals

- **Critical Paths**: ≥90%
- **API Routes**: ≥80%
- **Components**: ≥70%
- **Overall**: ≥75%

### Check Coverage

```bash
npm run test:coverage
```

Open `coverage/index.html` để xem chi tiết.

---

## 🐛 Debugging Tests

### Debug Unit Tests

```bash
# Run with Node debugger
node --inspect-brk node_modules/.bin/vitest

# Or use VS Code debugger
# Add breakpoint trong test file
```

### Debug E2E Tests

```bash
# Run in non-headless mode
HEADLESS=false npm run test:e2e

# Take screenshots
# Screenshots saved to `evidence/` directory
```

### Common Issues

1. **Tests timeout**: Tăng timeout trong test config
2. **Flaky tests**: Thêm retry logic hoặc fix race conditions
3. **Mock not working**: Check vi.mock() placement và hoisting

---

## 📚 Resources

- [Vitest Docs](https://vitest.dev/)
- [Puppeteer Docs](https://pptr.dev/)
- [Testing Library](https://testing-library.com/)

---

## 🎯 Best Practices

1. **Isolate tests**: Mỗi test độc lập, không phụ thuộc nhau
2. **Clean up**: Cleanup sau mỗi test (mocks, state)
3. **Use meaningful names**: Test names mô tả rõ behavior
4. **Test edge cases**: Test cả happy path và error cases
5. **Keep tests fast**: Unit tests < 100ms, E2E < 30s
6. **Maintain tests**: Update tests khi code thay đổi





