# Production Security Checklist (CSRF + Session + API)

Use this checklist before production deployment.

## A. CSRF Protection (Mandatory for Cookie Session Auth)
- [ ] Implement CSRF token endpoint (`GET /api/auth/csrf-token`)
- [ ] Generate token server-side and store in session
- [ ] Frontend sends token via custom header (e.g. `X-CSRF-Token`) on `POST/PUT/PATCH/DELETE`
- [ ] Backend validates token for all state-changing endpoints
- [ ] Return `403` for missing/invalid token
- [ ] Document explicit exemptions (if any) with risk rationale

## B. Session Security
- [ ] `session.cookie_httponly = 1`
- [ ] `session.cookie_secure = 1` in production HTTPS
- [ ] `session.cookie_samesite = Lax` or `Strict`
- [ ] Session ID regenerated on login and privilege changes
- [ ] Session inactivity timeout enforced
- [ ] Logout destroys server session and clears cookie

## C. Authentication and Authorization
- [ ] Every protected API checks authenticated session
- [ ] Role checks enforced server-side (not only in frontend)
- [ ] Object-level permission checks in detail/update/delete endpoints
- [ ] Consistent role naming across system (`admin` vs `administrator` resolved)

## D. Input Validation and Output Safety
- [ ] Validate and sanitize all request payloads
- [ ] Enforce max lengths and allowed values
- [ ] Keep prepared statements for all SQL operations
- [ ] Return JSON with fixed schema and no raw stack traces
- [ ] Remove debug logs for sensitive payloads/tokens/password metadata

## E. File Upload Security
- [ ] MIME allowlist and extension allowlist enforced
- [ ] File size limit enforced both server and app layers
- [ ] Store uploads outside web root or block direct execution
- [ ] Generate server-side filenames only
- [ ] Antivirus scan hook (if infra supports)

## F. Rate Limiting and Abuse Control
- [ ] Rate limit login, reset password, upload, and sensitive mutations
- [ ] Consistent retry-after responses for throttling
- [ ] Add lockout/backoff strategy for repeated failed logins

## G. Password and Account Recovery
- [ ] Use strong password hashing policy consistently
- [ ] Reset token is random, single-use, and short-lived
- [ ] Password reset does not leak account existence
- [ ] Invalidate active reset tokens after success

## H. Headers and CORS
- [ ] Restrict CORS origin to approved frontend domains
- [ ] Allow credentials only where necessary
- [ ] Add `X-Content-Type-Options: nosniff`
- [ ] Add `X-Frame-Options: DENY` or CSP `frame-ancestors`
- [ ] Add CSP policy baseline

## I. Logging and Monitoring
- [ ] Security-relevant events logged (auth failures, role changes, deletes)
- [ ] Logs avoid sensitive data (passwords, tokens, session IDs)
- [ ] Alerts configured for repeated failures and unusual patterns

## J. Pre-Release Security Validation
- [ ] Run PHP lint and frontend lint/build
- [ ] Test CSRF negative cases (`missing/invalid token`)
- [ ] Test authorization negative cases (`wrong role`, `cross-user access`)
- [ ] Test file upload bypass attempts (`mime spoof`, double extension)
- [ ] Document residual risks and accepted exceptions

## Minimal Backend Implementation Blueprint
1. Add middleware `backend/middleware/csrf.php`
2. Expose `GET /api/auth/csrf-token.php` to issue token
3. Include CSRF middleware in all mutating APIs
4. Update frontend `apiClient` to attach `X-CSRF-Token`
5. Verify with automated smoke tests for protected endpoints
