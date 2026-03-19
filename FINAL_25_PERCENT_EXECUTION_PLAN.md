# Final 25% Execution Plan (Fastest Path to Done)

This plan is ordered by impact and speed, based on current code status.

## Priority 0: Release Gate (Do First)
- [x] Frontend lint must pass with exit code 0 (done)
- [ ] No high/critical security gaps open
- [ ] Core end-to-end flows verified for 3 roles (student/advisor/admin)

## Priority 1: Security Hardening (Highest Risk, Fast Win)
Goal: remove production blockers from session-based API architecture.

1. CSRF protection for all state-changing endpoints
- [ ] Add CSRF token issue endpoint (e.g. `GET /api/auth/csrf-token`)
- [ ] Generate token in session and return token to frontend
- [ ] Require token header on `POST/PUT/PATCH/DELETE`
- [ ] Validate token in middleware and reject invalid/missing token (`403`)
- [ ] Exempt login/logout/reset-password only if intentionally designed and documented

2. Session cookie security
- [ ] Enforce `HttpOnly`, `Secure` (prod), and `SameSite=Lax/Strict`
- [ ] Regenerate session ID on login
- [ ] Set session timeout and inactive timeout policy

3. Input/output hardening
- [ ] Standardize API response schema (`success`, `message`, `data`, `error_code`)
- [ ] Remove debug logs that print sensitive values (tokens, raw payloads)
- [ ] Ensure strict file upload allowlist matches business policy

## Priority 2: Frontend Stability and Consistency
Goal: reduce runtime regression risk before UAT.

1. Resolve React hook dependency warnings (batch fix)
- [ ] Wrap loaders/filters with `useCallback` where needed
- [ ] Fix `useEffect` dependency arrays to remove stale closures
- [ ] Re-run lint until only acceptable warnings (or none)

2. Remove remaining mock logic
- [ ] Replace mock export behavior in `frontend/src/components/admin/AdminReports.js` with real export endpoint or disable button with clear label

3. API contract consistency
- [ ] Align role naming (`admin` vs `administrator`) across backend and frontend constants
- [ ] Align endpoint style (`/api/...` vs `/api/...php` usage)

## Priority 3: Core Flow Verification (UAT Blocking)
Goal: prove business rules and major user flows are correct.

1. Student flow
- [ ] Register/login
- [ ] Create request with upload
- [ ] Track status and view details

2. Advisor flow
- [ ] Login and review requests
- [ ] Approve/reject with reason/suggestion
- [ ] Verify capacity behavior

3. Admin flow
- [ ] User management CRUD + status + reset password
- [ ] Master data CRUD (faculty/department/program/expertise/term)

4. Business rule checks
- [ ] Max pending requests <= 5
- [ ] Duplicate pending request prevented
- [ ] Approve one request auto-cancels others
- [ ] Expire job updates pending to expired

## Priority 4: Test Automation Baseline
Goal: avoid manual-only release risk.

1. Frontend
- [ ] Add test framework (Jest/Vitest + Testing Library)
- [ ] Add smoke tests for login, request list rendering, and role redirect

2. Backend
- [ ] Add API smoke tests (PowerShell or Postman/Newman collection)
- [ ] Add one CI-style script to run PHP lint + API smoke checks

## Priority 5: Release Readiness
Goal: deployment with minimal surprises.

- [ ] Freeze env configuration and `.env` templates
- [ ] Update deployment guide with exact commands and rollback notes
- [ ] Run final regression checklist and attach evidence (screenshots/logs)

## Suggested 5-Day Sprint Split
- Day 1: CSRF middleware + session hardening
- Day 2: Frontend hook warnings + API contract cleanup
- Day 3: UAT full flows and bug fix pass
- Day 4: Add smoke tests and run repeatably
- Day 5: Release checklist + deployment dry run

## Completion Rule
Project is considered production-ready when:
- [ ] Lint/build pass
- [ ] Security checklist no high/critical open items
- [ ] Core UAT flows pass
- [ ] Deployment and rollback steps validated
