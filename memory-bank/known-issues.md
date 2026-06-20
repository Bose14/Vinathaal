# Known Issues

## Active Bugs

### 1. Credits Always Shows 100
**File**: `src/pages/Index.tsx:882`  
**Problem**: After successfully fetching real credits from the API (`setUserCredits(data.credits)` on line 877), line 882 immediately overwrites it with `setUserCredits(100)` — the displayed credit count is always 100 regardless of actual balance.  
**Fix**: Delete line 882.

```ts
// line 877 — correct
setUserCredits(data.credits);
// line 882 — delete this line
setUserCredits(100); // ← BUG: overwrites real value
```

---

### 2. Hardcoded JWT Secret — Security Issue
**File**: `backend/routes/googleLoginRoute.js:7`  
**Problem**: `const JWT_SECRET = "8a895d7b..."` is hardcoded in source code. If this repo is ever public or accessed by others, the secret is compromised — anyone can forge valid Google auth tokens.  
**Fix**: Add `JWT_SECRET` to AWS SSM Parameter Store, load via `config.JWT_SECRET`, use in `jwt.sign()`.

---

### 3. `stats.js` Uses Inconsistent DB Query Pattern
**File**: `backend/routes/stats.js`  
**Problem**: Uses `db.promise().query()` (returns `[rows, fields]`) while every other route uses `db.query()` (returns rows directly). Technically works because mysql2 pools retain the `.promise()` method even after promisification, but it's a hidden inconsistency that will break if `awsdb.js` is refactored.  
**Fix**:
```js
// Current (inconsistent)
const [userRows] = await db.promise().query('SELECT COUNT(*) as count FROM users');

// Fixed
const userRows = await db.query('SELECT COUNT(*) as count FROM users');
userRows[0].count
```

---

### 4. `templateId` Not Saved to Database
**File**: `backend/routes/s3Upload.js:55`  
**Problem**: `POST /api/store-upload-metadata` receives `templateId` in the body but the INSERT query omits it. The `question_papers` table has no `template_id` column. History entries have no record of which template was used.  
**Fix**: Add `ALTER TABLE question_papers ADD COLUMN template_id INT DEFAULT 0;` and update the INSERT:
```js
'INSERT INTO question_papers (user_id, qp_s3_url, created_at, subjectName, template_id) VALUES (?,?,?,?,?)',
[id, objectURL, dateTime, subjectName, templateId]
```

---

### 5. Hardcoded PDF Owner Password
**File**: `backend/routes/EncryptPDF.js:22`  
**Problem**: `const ownerPassword = "owner123"` — this allows anyone who knows the constant to unlock restrictions on any PDF produced by this app.  
**Fix**: Add `PDF_OWNER_PASSWORD` to SSM and load via `config.PDF_OWNER_PASSWORD`.

---

### 6. `EditableQuestionPaper.tsx` Is Entirely Dead Code
**File**: `src/components/EditableQuestionPaper.tsx`  
**Problem**: The entire file (~400 lines) is commented out. It's imported and used in `Result.tsx` but renders nothing — previously provided inline editing of the generated paper.  
**Fix**: Either rebuild the component or remove the import from `Result.tsx`.

---

## Unfinished Features

### MCQ Generator
- `src/pages/MCQGenerator.tsx` has a complete UI but **no backend `/api/generate-mcq` route**
- Submitting the form does nothing
- `MCQAnswerKey.tsx` page also exists but depends on the missing MCQ backend
- Route `/mcq-generator` is reachable and auth-guarded — just silently incomplete

### Community Feature
- `src/pages/CreateCommunity.tsx` exists at `/create-community`
- No backend routes found — planned future feature

### Payment Integration
- Pricing page shows Free / Pro (₹299) / Institution (₹999) plans
- "Start Pro Trial" button only runs `console.log` — no payment gateway
- No Razorpay, Stripe, or other payment provider integrated
- Credits are purely manual (5 default on signup; no way for users to buy more)

### Profile Picture Persistence
- Saved to `localStorage` key `profilePicture_<email>` only
- Lost on browser data clear / different device / incognito
- Not stored in DB or S3

---

## Code Quality Issues

### Dead Code in `pdfGenerator.ts`
Lines 1–243 are the old print-window implementation (commented out). Active code starts at line 247. Safe to delete the commented block.

### Dead Code in `DefaultTemplate.tsx`
Lines 1–42 are an earlier version without sub-question support (commented out). Safe to delete.

### `parseSyllabus` Regex is Fragile
Generator.tsx `parseSyllabus()` uses regex on Tesseract OCR output. OCR errors (inconsistent spacing, newlines, garbled characters) can cause it to return 0 units, which blocks generation entirely. Consider making the unit parser more tolerant or adding a manual fallback text area.

### Perplexity Token Limit
`generateWithPerplexity` has `max_tokens: 1024`. For large sections (10+ questions with sub-questions), the response may be truncated mid-list, producing incomplete question sets. Consider increasing to 2048–4096 for large papers.

---

## Security Summary

| Issue | File | Severity |
|-------|------|----------|
| Hardcoded JWT secret | `googleLoginRoute.js:7` | Critical if repo is public |
| Hardcoded qpdf owner password | `EncryptPDF.js:22` | Medium |
| `/api/generate-questions` has no auth | `server.js` | Medium (Perplexity API abuse) |
| `/api/auth/google` has no rate limiting | `server.js` | Medium |
| `/api/encrypt-pdf` has no auth | `server.js` | Low |
| `apiToken` stored in `localStorage` plaintext | Frontend | Low (XSS risk) |
