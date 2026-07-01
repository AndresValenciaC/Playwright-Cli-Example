# Test Setup Guide - beforeAll vs beforeEach

## Quick Reference

| Test Type | Setup | Auth | Context |
|-----------|-------|------|---------|
| **API** | `beforeAll` | Manual | `apiContext` |
| **E2E/UI** | `beforeEach` | Auto | `page` |
| **Integration** | `beforeAll` | Manual | `apiContext` |
| **Accessibility** | `beforeEach` | Auto | `page` |
| **Performance** | `beforeAll` | Manual | `apiContext` |

---

## When to Use Each

### beforeAll + apiContext (API Tests Only)

**Use when:**
- Testing API endpoints directly
- Making HTTP requests (GET, POST, PUT, DELETE)
- Testing backend logic without UI
- Testing performance or integration

**Why beforeAll?**
- Executes **once** before all tests in describe block
- Faster (reuses same context)
- Perfect for API requests

**Example:**
```typescript
test.describe("API Tests", () => {
  let apiContext;

  test.beforeAll(async ({ playwright }, testInfo) => {
    apiContext = await playwright.request.newContext({
      storageState: AUTH_FILES.standardUser,
    });
  });

  test("fetch products", async () => {
    const response = await apiContext.get("/products");
    expect(response.status()).toBe(200);
  });
});
```

---

### beforeEach + page (UI/E2E Tests Only)

**Use when:**
- Testing user interactions (click, fill, drag)
- Testing visual workflows
- Testing state management
- Testing accessibility
- Testing forms and validations

**Why beforeEach?**
- Executes **before each test**
- Each test gets clean, isolated page
- No test pollution
- **Authentication is automatic via storageState**

**Example:**
```typescript
test.describe("E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // storageState loaded automatically by playwright.config.ts
    await page.goto(`${TEST_URLS.base}${TEST_URLS.inventory}`);
  });

  test("add product to cart", async ({ page }) => {
    // Already authenticated - no login needed
    const button = page.locator("button");
    await button.click();
  });
});
```

---

## Authentication

### API Tests
```typescript
// ✅ MANUAL - Must pass storageState to apiContext
test.beforeAll(async ({ playwright }, testInfo) => {
  apiContext = await playwright.request.newContext({
    storageState: AUTH_FILES.standardUser, // ← Inject cookies here
  });
});
```

### UI/E2E Tests
```typescript
// ✅ AUTOMATIC - playwright.config.ts handles it
// No beforeAll needed
test.beforeEach(async ({ page }) => {
  await page.goto(TEST_URLS.inventory);
  // Already authenticated by storageState
});
```

---

## Why No beforeAll for UI Tests?

**Because storageState is automatic:**

```typescript
// playwright.config.ts already does this:
projects: [
  {
    name: "standard-user-tests",
    use: {
      storageState: AUTH_FILES.standardUser, // ← Loaded here
    },
  },
];
```

**Flow:**
1. Setup creates auth files ✓
2. Config loads storageState automatically ✓
3. Every `page.goto()` has cookies/tokens ✓
4. No manual auth needed ✓

---

## Decision Tree

```
Am I testing an API endpoint?
├─ YES → Use beforeAll + apiContext
└─ NO (UI/Click/Form/Visual?)
   └─ Use beforeEach + page
```

---

## File Checklist

### New API Test File
- [ ] Add `beforeAll` with `apiContext`
- [ ] Add `afterAll` with `apiContext.dispose()`
- [ ] Use `apiContext.get()`, `post()`, etc.
- [ ] Pass `storageState` to `newContext()`

### New E2E/UI Test File
- [ ] Add `beforeEach` with `page.goto()`
- [ ] ❌ DO NOT add `beforeAll`
- [ ] ❌ DO NOT create `apiContext`
- [ ] Use `page.click()`, `page.fill()`, etc.

---

## Common Mistakes

❌ **Wrong:** beforeAll in E2E test
```typescript
test.beforeAll(async ({ playwright }) => {
  // Don't do this for UI tests
  apiContext = await playwright.request.newContext();
});
```

✅ **Right:** beforeEach in E2E test
```typescript
test.beforeEach(async ({ page }) => {
  await page.goto(TEST_URLS.inventory);
});
```

---

❌ **Wrong:** Manual login in E2E test
```typescript
test("should buy", async ({ page }) => {
  await page.goto(BASE_URL);
  await page.fill("username", "user"); // ← Unnecessary
  await page.fill("password", "pass"); // ← Unnecessary
});
```

✅ **Right:** Use storageState
```typescript
test("should buy", async ({ page }) => {
  await page.goto(TEST_URLS.inventory); // Already authenticated
});
```

---

## Template Copy-Paste

### API Test Template
```typescript
import { APIRequestContext, expect, test } from "@playwright/test";
import { setupAuthenticatedAPI } from "../fixtures/api-test-helpers";

test.describe("API Suite", () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright }, testInfo) => {
    apiContext = await setupAuthenticatedAPI(playwright, testInfo);
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test("should fetch data", async () => {
    const response = await apiContext.get("/endpoint");
    expect(response.status()).toBe(200);
  });
});
```

### E2E Test Template
```typescript
import { expect, test } from "@playwright/test";
import { TEST_URLS } from "../test-data/test-data-users";

test.describe("E2E Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${TEST_URLS.base}${TEST_URLS.inventory}`);
  });

  test("should complete flow", async ({ page }) => {
    const button = page.locator("button");
    await button.click();
    expect(page.url()).toContain("checkout");
  });
});
```

---

## Summary

**beforeAll + apiContext:**
- API tests only
- Manual authentication
- Executes once
- Reuses same context

**beforeEach + page:**
- UI/E2E tests only
- Automatic authentication (via storageState)
- Executes each test
- Fresh page per test

**Never mix:** Don't use apiContext in E2E tests. Don't use beforeAll in UI tests.
