# Improved Playwright Authentication System - Implementation Guide

## Changes Summary

### 1. **test-data/test-data-users.ts**

**Fixes:**

- Unified key names: `standardUser`, `problemUser`, `lockedOutUser` (consistent camelCase)
- Added TypeScript typing with `UserType` union type
- Added `getUserByType()` helper function
- Marked objects as `const` for better typing

**Before:**

```typescript
export const TEST_USERS = {
  standard_user: { ... },
  locked_out_user: { ... },
};
```

**After:**

```typescript
export const TEST_USERS = {
  standardUser: { ... },  // ✓ Consistent naming
  lockedOutUser: { ... },
};

export type UserType = keyof typeof TEST_USERS;
export function getUserByType(userType: UserType) { ... }
```

---

### 2. **locators/login-locators.ts**

**Fixes:**

- Created `LoginPageLocators` class for better encapsulation
- Added `isLoginPageDisplayed()` method for validation
- Improved error filters with `.filter({ hasText: ... })`
- Kept legacy exports for backward compatibility

**Benefits:**

- Better error handling with timeouts
- Cleaner syntax with class getters
- Reusable validation logic

---

### 3. **pages/LoginPage.ts**

**Fixes:**

- Uses new `LoginPageLocators` class
- Uses `UserType` for type-safe user selection
- Added `loginWithUserType(userType: UserType)` method
- Improved error messages with context
- Added specific error verification methods

**New Methods:**

```typescript
async loginWithUserType(userType: UserType): Promise<void>
async verifyInvalidCredentialsError(): Promise<void>
async verifyUserLockedError(): Promise<void>
async isErrorDisplayed(): Promise<boolean>
```

---

### 4. **fixtures/auth-config.ts**

**Fixes:**

- Removed confusing `getCredentialsForUser()` - use `getUserByType()` instead
- Added `authenticateUserByType()` function
- Added `getAuthFileForUserType()` helper
- Better error handling and logging
- Added `deleteAuthFile()` utility

**Key Changes:**

```typescript
// Before
const credentials = getCredentialsForUser("valid"); // ❌ confusing

// After
await authenticateUserByType(page, "standardUser"); // ✓ clear
```

---

### 5. **setup.ts**

**Fixes:**

- Uses `authenticateUserByType()` instead of confusing credentials lookup
- Added setup for all three user types
- Improved console logging with emoji for better visibility
- Consistent error handling

---

### 6. **playwright.config.ts**

**Improvements:**

- Created projects for each user type
- Each project has its own `storageState` file
- `setup` project runs first, then user-specific tests
- Dependencies ensure setup runs before tests

**Project Structure:**

```
setup (auth-standard-user, auth-problem-user, auth-locked-out-user)
  ↓
standard-user-tests (uses AUTH_FILES.standardUser)
problem-user-tests  (uses AUTH_FILES.problemUser)
locked-out-user-tests (uses AUTH_FILES.lockedOutUser)
```

---

## Implementation Steps

1. **Replace files:**
   - `test-data/users.ts` → `test-data/test-data-users.ts`
   - `locators/login-locators.ts`
   - `pages/LoginPage.ts`
   - `fixtures/auth-config.ts`
   - `setup.ts`
   - `playwright.config.ts`

2. **Update imports across your test files:**

   ```typescript
   // Old
   import { TEST_USERS } from "../test-data/users";
   import { TEST_URLS } from "../test-data/users";

   // New
   import { TEST_USERS, getUserByType } from "../test-data/test-data-users";
   import { TEST_URLS } from "../test-data/test-data-users";
   ```

3. **Update test structure (optional but recommended):**
   - Rename test files to match pattern: `*.test.ts`
   - Place them in `tests/` directory
   - Update `testDir` in `playwright.config.ts`

4. **Run setup:**

   ```bash
   npx playwright test setup
   ```

5. **Run tests:**
   ```bash
   npx playwright test standard-user-tests
   npx playwright test problem-user-tests
   ```

---

## Key Improvements

✅ **Consistency:** All user keys follow camelCase naming convention
✅ **Type Safety:** TypeScript `UserType` union prevents invalid keys
✅ **Clarity:** `authenticateUserByType()` is much clearer than `getCredentialsForUser()`
✅ **Encapsulation:** `LoginPageLocators` class hides implementation details
✅ **Flexibility:** Projects allow running tests with different auth states
✅ **Maintainability:** Single source of truth for URLs and user data
✅ **Error Handling:** Better error messages with context

---

## Testing the Auth System

```bash
# Run just the setup
npx playwright test setup

# Run tests with standard user (includes setup)
npx playwright test standard-user-tests

# Run all tests
npx playwright test

# Debug mode
npx playwright test --debug

# Headed mode (see browser)
npx playwright test example.test.ts --headed
```

## Running tests set up

```bash
# 1. First, run setup (creates auth files)
npx playwright test setup

# 2. Run example tests with standard user auth
npx playwright test example.test.ts

# 3. Or run specific test
npx playwright test example.test.ts -g "should display inventory page"

# 4. With UI mode (recommended)
npx playwright test example.test.ts --ui

# 5. Debug mode
npx playwright test example.test.ts --debug

# 6. Headed mode (see browser)
npx playwright test example.test.ts --headed

# 7. Quick set up
npx playwright test setup && npx playwright test example.test.ts --headed

```

# In power Shell run commands

# Opción 1: Comandos separados

npx playwright test setup
npx playwright test example.test.ts --headed

# Opción 2: Con punto y coma (una línea)

npx playwright test setup; npx playwright test example.test.ts --headed

# Opción 3: Solo tests (si ya corriste setup antes)

npx playwright test example.test.ts --headed

# Remove auth files (if needed)

rm -rf .auth

# Run set up

npx playwright test setup

# Run tests with standard user

npx playwright test standard-user-tests --headed

# Run tests with problem user

npx playwright test problem-user-tests --headed

If everything is working correctly, you should see:

✅ Authentication works for all user types

✅ State is saved and reused across tests

✅ Test reuses the same auth state without re-login

✅ Playwright logic is working correctly

# 1. Setup + ese test específico

npx playwright test setup; npx playwright test auth-example.test.ts --headed

npx playwright test setup; npx playwright test tests/api/data-driven/api-data-driven.test.ts --headed

# 2. Setup + todos los tests

npx playwright test setup; npx playwright test --headed

---

## Environment Variables

Make sure your `.env` has:

```
TEST_PASSWORD=my_secret_code
BASE_URL=https://codemify-demo-app.vercel.app/demo-app
```

Or they'll use the defaults from `test-data-users.ts`
