# Production Fixes (June 2026)

Production-readiness rewrite completed 2026-06-20. All 10 issues below were found and fixed.

**Root cause**: Project was developed locally and never fully switched to production config — localhost URLs everywhere, security issues in server setup, duplicate route registrations, and inconsistent database query patterns.

---

## Bug Fixes

### 1. Google Auth Routes Behind `protect` Middleware
**File**: `backend/server.js`  
**Problem**: `googleLoginRoute` and `googleSignupRoute` were registered _after_ `app.use(protect)`, meaning any Google login attempt required a valid API token to proceed — impossible for new users.  
**Fix**: Moved both routes before `app.use(protect)`.

### 2. CORS `origin: "*"` With `credentials: true`
**File**: `backend/server.js`  
**Problem**: The CORS spec prohibits `credentials: true` with a wildcard origin. All credentialed requests from the browser were being blocked.  
**Fix**: Changed to `origin: config.FRONTEND_URL || 'http://localhost:8080'`.

### 3. Duplicate Route Registrations
**File**: `backend/server.js`  
**Problem**: `/health` was registered twice (lines 84 and 113); `/api/user` was registered twice (lines 95 and 99).  
**Fix**: Removed duplicate registrations.

### 4. Inconsistent DB Queries in `auth.js`
**File**: `backend/routes/auth.js`  
**Problem**: `forgot-password` and `reset-password` routes used `db.promise().query()` which returns `[rows, fields]`, while the rest of the app uses `db.query()` which returns rows directly. This caused the wrong data to be used (field metadata instead of rows).  
**Fix**: Unified both routes to use `db.query()`.

### 5. Silent Null Crash in `deduct-credits`
**File**: `backend/routes/creditsHandling.js`  
**Problem**: If user not found, `rows = undefined`. The code did `Array.isArray(undefined)` → false → `userRow = undefined` → `Number(undefined) = NaN` → `NaN < 1` is false → deduction attempted on a non-existent user without error.  
**Fix**: Added explicit `if (!rows || rows.length === 0)` check before accessing `rows[0]`.

### 6. All Frontend API URLs Hardcoded to `localhost:3001`
**Files**: `Generator.tsx`, `Login.tsx`, `Signup.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`, `Support.tsx`, `Index.tsx`, `Result.tsx`, `ShareDialog.tsx`, `S3Uploads.ts`  
**Problem**: Every single `fetch`/`axios` call pointed to `http://localhost:3001` — the production deployment was completely non-functional.  
**Fix**: Created `src/lib/api.ts` exporting `API_BASE = (import.meta.env.VITE_API_URL) ?? 'http://localhost:3001/api'`. Replaced all hardcoded URLs across 10 files.

### 7. Hardcoded Google Client ID
**File**: `src/pages/Login.tsx`  
**Problem**: `client_id="961571231420-..."` was inline in JSX — would break if the client ID changes, and exposes it unnecessarily.  
**Fix**: Moved to `VITE_GOOGLE_CLIENT_ID` env var, added to `.env` and `.env.production`.

### 8. ShareDialog URL Typo
**File**: `src/components/ShareDialog.tsx`  
**Problem**: `"http://loclhost:3001/api/send-email"` (missing 'a' in localhost) — email sharing was broken.  
**Fix**: Replaced with `` `${API_BASE}/send-email` ``.

### 9. Generator.tsx — 1,100+ Lines of Dead Code
**File**: `src/pages/Generator.tsx`  
**Problem**: Lines 1–1109 were entirely commented-out old implementation. File was 2,253 lines total.  
**Fix**: Rewrote file containing only the active code (lines 1110–2253).

### 10. S3Uploads.ts — 100+ Lines of Dead Code
**File**: `src/utils/S3Uploads.ts`  
**Problem**: Lines 1–103 were entirely commented-out old implementation. Unused `useState` import.  
**Fix**: Rewrote file with only the active code and clean imports.

---

## Files Changed

| File | Change Type |
|------|-------------|
| `backend/server.js` | Fixed CORS, duplicate routes, Google auth ordering |
| `backend/routes/auth.js` | Unified to `db.query()` pattern |
| `backend/routes/creditsHandling.js` | Fixed null check in deduct-credits |
| `src/lib/api.ts` | **New file** — central API_BASE export |
| `.env` | **New file** — local dev environment |
| `.env.production` | Updated — added `VITE_GOOGLE_CLIENT_ID` |
| `src/pages/Generator.tsx` | Removed 1100+ lines dead code, API_BASE, 4 URLs fixed |
| `src/pages/Login.tsx` | API_BASE, env var for Google Client ID, 2 URLs |
| `src/pages/Signup.tsx` | API_BASE, 2 URLs |
| `src/pages/ForgotPassword.tsx` | API_BASE, 1 URL |
| `src/pages/ResetPassword.tsx` | API_BASE, 1 URL |
| `src/pages/Support.tsx` | API_BASE, 2 URLs |
| `src/pages/Index.tsx` | API_BASE, 2 URLs |
| `src/pages/Result.tsx` | API_BASE, 2 URLs (different commented headers) |
| `src/components/ShareDialog.tsx` | API_BASE, typo fix |
| `src/utils/S3Uploads.ts` | Removed 100+ lines dead code, API_BASE, 2 URLs |
