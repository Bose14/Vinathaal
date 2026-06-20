# Backend Routes

All routes registered in `backend/server.js`. Factory pattern: each route file exports a function receiving `(db, config, perplexityService, transporter)` and returns an Express router.

---

## Public Routes (No Auth Required)

### Auth

| Method | Path | File | Body |
|--------|------|------|------|
| POST | `/api/auth/signup` | `routes/auth.js` | `{ name, email, password }` |
| POST | `/api/auth/login` | `routes/auth.js` | `{ email, password }` |
| POST | `/api/auth/forgot-password` | `routes/auth.js` | `{ email }` |
| POST | `/api/auth/reset-password` | `routes/auth.js` | `{ token, newPassword }` |
| POST | `/api/auth/google` | `routes/googleLoginRoute.js` | `{ token }` (Google access token) |
| POST | `/api/auth/google-signup` | `routes/googleSignupRoute.js` | Google OAuth data |

**signup** — bcrypt hashes password, inserts user with 5 credits, returns `{ message, user: { id, name, email, api_token } }`

**login** — bcrypt compare, returns same shape

**forgot-password** — generates UUID reset token, sets 1-hour expiry in DB, sends email via Nodemailer

**reset-password** — validates `reset_token_expires > NOW()`, bcrypt hashes new password, clears token fields

**google** — verifies Google access token via `googleapis.com/oauth2/v1/userinfo`, signs app JWT, returns `{ success, token: jwt, user: { googleId, name, email, picture } }`
> ⚠️ JWT secret is hardcoded in this file — should load from `config.JWT_SECRET`

---

### Question Generation

**POST `/api/generate-questions`** — `routes/generate.js`  
Body: `{ subjectName, sections, unitTopics }`  
No auth required (open to abuse — known issue).

Two modes per section (determined by which config key is present):

**autoConfig mode** (bulk):
- Distributes `questionCount` evenly across `units[]`
- One Perplexity call per unit
- Prompt maps difficulty: `easy` → "definition or concept-based", `medium` → "application-based with explanation", `hard` → "analytical or scenario-based"

**individualConfig mode** (per-question):
- One Perplexity call for all `aiQuestionCount` questions from `defaultUnit`
- Returns numbered list, parsed line-by-line

Response: `{ sections: [{ name, questions: [{ text, marks, difficulty, unit, isAIGenerated, subQuestionsCount }] }] }`

---

### Credits

**POST `/api/get-credits`** — `routes/creditsHandling.js`  
Body: `{ email }`  
Returns: `{ email, credits: number }`

**POST `/api/deduct-credits`** — `routes/creditsHandling.js`  
Body: `{ email }`  
Checks `credits >= 1` before deducting. Returns: `{ message, credits: newTotal }`

---

### File Operations

**POST `/api/send-email`** — `routes/sendPDFEmail.js`  
Body: multipart — `{ receiverEmail, senderEmail, title, userName, file (PDF) }`  
Sends PDF as Nodemailer attachment using `config.EMAIL_USER` / `config.EMAIL_PASS`

**POST `/api/encrypt-pdf`** — `routes/EncryptPDF.js`  
Body: multipart — `{ pdf (file), password (string) }`  
- No password given → returns original PDF unchanged  
- With password → `qpdf --encrypt <userPwd> owner123 256 -- input output` → encrypted PDF  
> ⚠️ Owner password `"owner123"` is hardcoded. Requires qpdf CLI on EC2.

---

### S3 / Storage

**GET `/api/get-upload-url`** — `routes/s3Upload.js`  
Query: `?filename=...&filetype=...`  
Returns: `{ uploadURL (presigned PUT, 5min expiry), objectURL }`  
objectURL format: `https://<bucket>.s3.<region>.amazonaws.com/<filename>`

**POST `/api/store-upload-metadata`** — `routes/s3Upload.js`  
Body: `{ email, uploadURL, objectURL, dateTime, subjectName, templateId }`  
Inserts into `question_papers`: `(user_id, qp_s3_url, created_at, subjectName)`  
> ⚠️ `templateId` is accepted but NOT stored — INSERT query doesn't include it

**POST `/api/get-questions-paper-history`** — `routes/s3Upload.js`  
Body: `{ email }`  
Returns last 3 papers: `{ email, data: [{ objectUrl, created_at, subjectName }] }`

---

### Stats & Support

**GET `/api/stats`** — `routes/stats.js`  
Returns: `{ totalPapers, activeUsers, avgTime: 3 (hardcoded), satisfaction: 98 (hardcoded) }`  
> ⚠️ Uses `db.promise().query()` — inconsistent with rest of app

**POST `/api/support`** — `routes/support.js`  
Body: `{ fullName, email, subject, message }`

**POST `/api/slack-alert`** — `routes/slack.js`  
Body: `{ fullName, email, subject, message }`  
Posts to `config.SLACK_WEBHOOK_URL` with color `#36A64F`

**GET `/health`**  
Returns: `{ status: 'OK', timestamp: ISO string }`

---

## Protected Routes (Bearer Token Required)

Header: `Authorization: Bearer <btoa(api_token)>`

`protect` middleware: decodes base64 → DB lookup by `api_token` → sets `req.user` or 401.

---

**POST `/api/extract-syllabus`** — `routes/extract.js`  
Body: multipart — `image` field  
Pipeline:
1. Sharp: resize 1500px, grayscale, threshold 140, sharpen, normalize
2. Tesseract.js OCR with character whitelist
3. Smart Roman numeral normalizer (fixes `UNIT If` → `UNIT III`)
4. Subject name extraction: regex `\b[A-Z]{1,3}\d{4}\b\s+(.*)` (matches course codes like MA3151)
5. Slices text from `UNIT I` to `OUTCOMES`/`TEXT BOOKS`/`REFERENCES`
6. Cleans up temp files

Returns: `{ subjectName, syllabusText }`

---

**POST `/api/generate-answer-key`** — `routes/generateAnswer.js`  
Body: `{ questionPaper: { subject, questions: [{ text, marks }] } }`  
Prompt requests JSON: `[{ question, keywords: [{ point, marks }], totalMarks }]`  
Tries `JSON.parse()`, falls back to raw string.  
Returns: `{ answerKey: parsed | rawString }`

---

### User CRUD (`/api/user/*`)

| Method | Path | Body |
|--------|------|------|
| POST | `/api/user/create` | `{ name, email, role }` |
| PUT | `/api/user/update/:id` | `{ name, email, role }` |
| DELETE | `/api/user/delete/:id` | — |
| GET | `/api/user/list` | — |

---

## Perplexity Service

File: `backend/services/generateWithPerplexity.js`  
Factory: `createPerplexityService(config)` → `{ generateWithPerplexity(prompt) }`

```js
// Config keys used
config.PERPLEXITY_API_KEY
config.PERPLEXITY_ENDPOINT
config.PERPLEXITY_MODEL

// Request settings
max_tokens: 1024
temperature: 0.7
system: "You are an expert academic question generator."

// Return value
response.data?.choices?.[0]?.message?.content || ""
```
