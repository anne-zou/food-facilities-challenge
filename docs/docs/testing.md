---
sidebar_position: 4
---

# Testing

## Running Tests

```bash
npm test           # Run all tests once
npm run test:watch # Run tests in watch mode
```

## Test Structure

All tests are in `src/App.test.jsx`.

**Setup (beforeEach)**: Creates fresh SQLite database, creates `food_facilities` table, inserts 4 test records (Tacos El Primo, Burger Express, Pizza Palace, Taco Truck), assigns to `window.db`

**Cleanup (afterEach)**: Closes database, clears `window.db`

## Test Coverage

1. **Initial Data Load** - All rows display on mount
2. **Search by Applicant and Address** - Field-specific searching (e.g., "Burger Express", "Oak St")
3. **Partial/Fuzzy Search** - Partial matches ("Taco" → "Tacos El Primo" + "Taco Truck") and case-insensitive search
4. **Status Filtering** - Single/multi-status filtering, combined with text search
5. **Empty Search** - Submitting empty search reloads all data

## Testing Tools

- **Jest** (jsdom) - Test runner, config in `jest.config.js`, setup in `src/setupTests.js`
- **@testing-library/react** - `render()`, `screen`, `waitFor()`
- **@testing-library/user-event** - `user.type()`, `user.click()`, `user.clear()`
- **@testing-library/jest-dom** - `toBeInTheDocument()` and other DOM matchers

## Mocking

- **StyleX** - Mocked at `src/__mocks__/stylex.js` (identity functions)
- **CSS Modules** - `identity-obj-proxy` maps class names to themselves

## Writing New Tests

1. Add test data in `beforeEach` if needed
2. Create test/describe block
3. Render app, wait for load
4. Simulate user actions
5. Assert results (both positive and negative cases)

## Useful Commands

```bash
npm test -- -t "pattern"        # Run tests matching pattern
npm test -- App.test.jsx        # Run specific file
npm test -- --coverage          # Generate coverage report
```
