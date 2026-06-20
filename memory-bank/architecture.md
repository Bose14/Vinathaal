# Architecture & Data Flow

## Core Pipeline (Happy Path)

```
User uploads syllabus image
        ↓
POST /api/extract-syllabus  (Sharp preprocess → Tesseract OCR)
        ↓
Returns { subjectName, syllabusText }
        ↓
User configures sections (marks, difficulty, units, mode)
        ↓
POST /api/generate-questions  (Perplexity AI, one call per unit per section)
        ↓
Returns { sections: [{ name, questions: [] }] }
        ↓
sessionStorage.setItem("questionPaperConfig", JSON.stringify(config))
        ↓
navigate('/result/:templateId')
        ↓
Result page renders DOM using TemplateRegistry[templateId]
        ↓
S3Upload() called once: generatePDF("question-paper-content") → html2canvas → jsPDF blob
        ↓
GET /api/get-upload-url  →  PUT to S3 (presigned)  →  POST /api/store-upload-metadata
        ↓
User downloads PDF / encrypts / exports Word / shares via email
```

---

## Auth Flow

### Email/Password
```
POST /api/auth/signup  →  bcrypt hash  →  INSERT users  →  return { api_token }
POST /api/auth/login   →  bcrypt compare  →  return { api_token }
```

### Google OAuth
```
Frontend LoginSocialGoogle  →  Google access token (ya29...)
        ↓
POST /api/auth/google  { token: googleAccessToken }
        ↓
Backend: GET googleapis.com/oauth2/v1/userinfo?access_token=...
        ↓
Sign JWT with app secret  →  return { token: appJWT, user: { name, email, picture } }
```

### Token Storage (Frontend)
```js
localStorage.setItem('user', JSON.stringify(user))   // full user object
localStorage.setItem('authToken', token)              // JWT or api_token
localStorage.setItem('apiToken', user.api_token)      // raw api_token for Bearer auth
```

### Protected Route Header
```
Authorization: Bearer <btoa(api_token)>   // base64 encoded
```
The `protect` middleware decodes base64 → raw token → DB lookup → sets `req.user`.

---

## State Transfer Between Pages

| From | To | Mechanism | Key | Value |
|------|----|-----------|-----|-------|
| Generator | Result | sessionStorage | `questionPaperConfig` | Full config JSON |
| Generator | Result | sessionStorage | `token` | Random string (S3 filename suffix) |
| Generator | Result | sessionStorage | `shouldUploadOnce` | `"true"` |
| Generator | Result | react-router state | `templateID` | Number (0–3) |
| Login | anywhere | sessionStorage | `redirectAfterLogin` | Path string |

---

## Route Registration Order in `server.js`

Order matters — public routes must come before `app.use(protect)`:

```js
// 1. Middleware
app.use(cors(...))
app.use(express.json())
app.use(morgan-style logger)

// 2. Public routes (no auth)
app.use('/api', generateRoute(perplexityService))
app.use('/api', creditsHandling(db))
app.use('/api', sendPDFEmail(config))
app.use('/api/auth', authRoutes(db, transporter, config))
app.use('/api', EncryptPDF())
app.use('/api', s3Upload(config, db))
app.use('/api', statsRoutes(db, config))
app.use('/api', googleLoginRoute)        // ← must be before protect
app.use('/api', googleSignupRoute(config)) // ← must be before protect
app.get('/health', ...)

// 3. Protected routes (Bearer token required)
app.use(protect)                         // ← auth gate
app.use('/api', extractRoute)
app.use('/api', answerKeyRoute(perplexityService))
app.use('/api', supportRoute(transporter, config))
app.use('/api', slackAlertRoute(config))
app.use('/api/user', userRoutes(db))

// 4. Error handler
app.use((err, req, res, next) => ...)
```

---

## Database Query Pattern — CRITICAL

`backend/awsdb.js` uses `util.promisify(pool.query)`. This means `db.query()` returns the **rows array directly**, NOT `[rows, fields]` like the native mysql2 promise interface.

```js
// CORRECT
const rows = await db.query("SELECT * FROM users WHERE email = ?", [email]);
const user = rows[0];          // first row object
const count = rows.length;     // how many rows

// WRONG — do not destructure
const [rows, fields] = await db.query(...);  // rows = first row object, not array!

// AVOID — inconsistent with rest of app
const [rows] = await db.promise().query(...); // different interface
```

---

## PDF Generation Pipeline

```
generatePDF("question-paper-content", filename)   [src/utils/pdfGenerator.ts]
        ↓
document.getElementById("question-paper-content")  // DOM element in Result.tsx
        ↓
html2canvas(element, { scale: 2, useCORS: true })
        ↓
canvas.toDataURL('image/jpeg', 0.98)
        ↓
jsPDF (letter size, portrait, 0.5in margins)
        ↓
pdf.addImage(...)  +  paginate if overflow
        ↓
pdf.output('blob')  →  returns Blob
```

Optional encryption:
```
Blob  →  FormData { pdf: file, password: string }
        ↓
POST /api/encrypt-pdf
        ↓
Backend writes to temp file → qpdf CLI → encrypted PDF binary → response
```
