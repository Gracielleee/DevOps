# BrainBytes Testing Strategy

## Overview

This document outlines the testing approach for the BrainBytes AI Tutoring Platform.

## Testing Levels


### 1. Unit Testing

Focuses on isolating the smallest testable parts of the application.

* **Frontend (React Components)**
  * Target: Individual components and utility functions.
  * Strategy: Render components in isolation, simulate user interactions (clicks, typing), and verify DOM output or state changes.
  * Tools: Jest, @testing-library/react.


* **Backend (Business Logic & Middleware)**
  * Target: Error handling middleware, utility functions, and model validations.
  * Strategy: Test specific error paths and isolated logic without hitting external services.
  * Tools: Jest.


### 2. Integration Testing

Verifies that different modules work together correctly.

* **API Endpoints**
    * Target: RESTful routes (/api/login, /api/messages, /api/materials, /api/profile).
    * Strategy: Use an in-memory database to perform real CRUD operations. Test authentication flows, pagination logic, and data integrity.
    * Tools: Supertest, MongoMemoryServer.

* **Database Interactions**
    * Target: Mongoose models.
    * Strategy: Ensure data is persisted correctly, relationships are maintained, and cleanup occurs between tests.

### 3. End-to-End (E2E) Testing

Simulates real user journeys in a browser environment.

  * Target: Critical user flows spanning multiple pages.
  * Strategy: Automate browser navigation, form filling, and assertion of page elements.
  * Tools: Playwright.

</br>

## Testing Tools

| Tool                       | Purpose                                 | Context            |
| -------------------------- | --------------------------------------- | ------------------ |
| **Jest**                   | Primary Test Runner & Assertion Library | Frontend & Backend |
| **@testing-library/react** | DOM Querying & Interaction Simulation   | React Components   |
| **Supertest**              | HTTP Request Simulation                 | API Endpoints      |
| **Playwright**             | Browser Automation                      | E2E Flows          |
| **MongoDB Memory Server**  | In-Memory Database Instance             | Backend Isolation  |

## Code Quality and Security

- **ESLint**: Static code analysis for JavaScript, apllied to both backend and frontend source code
- **Synk***: Vulnerability scanning tool to identify and fix security flaws in open-source dependencies and container images.
- **TruffleHog**: Secrets scanning to detect and prevent exposed secrets and tokens.
- **GitHub Actions**: Automated CI pipeline for running tests in `main.yml`

</br>

## Testing Best Practcies

1. **Write tests as you code**: Add tests when implementing new features
2. **Focus on critical paths**: Prioritize testing key functionality
3. **Keep tests simple**: Each test should verify one specific behavior
4. **Use descriptive names**: Test names should clearly explain what is being tested
5. **Maintain independence**: Tests should not depend on other tests


## How to Write Tests: Quick Examples
### 1. Frontend: Testing a Button Click

**Goal:** Ensure the "Submit" button triggers the form handler.
```
// frontend/components/ChatInput.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import ChatInput from './ChatInput';

test('sends message when button is clicked', () => {
  const mockSend = jest.fn(); // Create a fake function to track calls
  
  render(<ChatInput onSend={mockSend} />);
  
  // 1. Type into the box
  const input = screen.getByPlaceholderText('Type your question...');
  fireEvent.change(input, { target: { value: 'Hello' } });
  
  // 2. Click submit
  const button = screen.getByRole('button', { name: /send/i });
  fireEvent.click(button);
  
  // 3. Check if our fake function was called with the text
  expect(mockSend).toHaveBeenCalledWith('Hello');
});
```

### 2. Backend: Testing an API Endpoint

**Goal:** Verify that subjects can be retrieved

```
// backend/tests/integration.test.js
import request from 'supertest';
import app from '../app.js';
import Subject from '../src/models/subject.js';

it('returns a list of subjects', async () => {

  ...

  // Action: Request the list of all subjects
  const res = await request(app).get('/api/subjects');

  // Assertion: Check status and that data is a non-empty array
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.data)).toBe(true);
  expect(res.body.data.length).toBeGreaterThan(0);
});
```

### 3. Backend: Unit Testing Error Logic

**Goal:** Verify the app handles invalid IDs gracefully.
```
// backend/tests/errorHandler.test.js
it('returns 400 for invalid ID format', async () => {
  const { token } = await createTestUser();

  const res = await request(app)
    .get('/api/materials/invalid-id-123') // Not a real MongoDB ID
    .set('Authorization', `Bearer ${token}`);

  expect(res.status).toBe(400);
  expect(res.body.message).toBeDefined();
});
```

### 4. E2E: Testing a User Flow

**Goal:** Verify navigation from Home to Dashboard.
```
// frontend/tests/navigation.spec.js
import { test, expect } from '@playwright/test';

test('user can navigate to dashboard', async ({ page }) => {
  await page.goto('/'); // Start at home
  
  // Click the dashboard link
  await page.click('text=Dashboard');
  
  // Wait and verify URL changed
  await page.waitForURL(/dashboard/);
  expect(page.url()).toContain('/dashboard');
});
```

</br>

## How to Run & Debug Tests
### Prerequisites
Ensure dependencies are installed with `npm install`


### Running Tests

The project uses separate scripts for different test suites.


| Command               | Description                                         | Directory Context                 |
| --------------------- | --------------------------------------------------- | --------------------------------- |
| `npm run test`        | Runs **all Jest unit/integration tests**.           | `frontend` **or** `backend` |
| `npm run test:watch`  | Runs Jest in watch mode (re-runs on file change).   | `frontend` **or** `backend` |
| `npm run test:e2e`    | Runs **Playwright E2E tests**.                      | `frontend`                     |
| `npm run test:e2e:ui` | Launches Playwright's interactive UI for debugging. | `frontend`                     |
| `npm run lint` | Run linting with ESLint. | `frontend` **or** `backend`                   
> **Note:** Test commands must be run from within the specific project directory (frontend or backend).

</br>

#### Example Usage:
```
# To run frontend unit tests
cd frontend
npm run test

# To run backend integration/unit tests
cd backend
npm run test

# To run E2E tests
cd frontend
npm run test:e2e

# To run linting in backend
cd backend
npm run lint
```

## Debugging Tips
| Context                 | Approach                           |
| ----------------------- | ------------------------------------------- |
| **Frontend Unit**       | Use `screen.debug()` or `console.log(screen.asFragment())` to inspect rendered HTML.               |
| **Backend Unit**        | Verify mock return values match expected function outputs. Check `jest.fn().mock.calls`.           |
| **Backend Integration** | Ensure `process.env.JWT_SECRET` is set; verify `setup.js` is clearing DB collections before tests. |
| **Linting** | Trace configuration cascades with `npx eslint --debug path/to/file.js`. Very correct rules are apllied in the `eslint.config.mjs` files.|

