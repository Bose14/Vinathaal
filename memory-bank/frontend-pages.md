# Frontend Pages

## Route Table (`src/App.tsx`)

| Route | Component | Auth Guard |
|-------|-----------|-----------|
| `/` | `Index` | No (UI changes when logged in) |
| `/login` | `Login` | No |
| `/signup` | `Signup` | No |
| `/forgot-password` | `ForgotPassword` | No |
| `/reset-password` | `ResetPassword` | No |
| `/generator` | `Generator` | Yes → redirects to `/login` |
| `/mcq-generator` | `MCQGenerator` | Yes → redirects to `/login` |
| `/result/:templateId` | `Result` | No (but crashes without sessionStorage data) |
| `/answer-key` | `AnswerKey` | No |
| `/pricing` | `Pricing` | No |
| `/support` | `Support` | No (pre-fills form if logged in) |
| `/templates` | `Templates` | No |
| `/profile` | `Profile` | No |
| `/question-bank` | `QuestionBankGenerator` | No |
| `/create-community` | `CreateCommunity` | No |

Auth guard pattern (Generator, MCQGenerator):
```ts
useEffect(() => {
  const authToken = localStorage.getItem('authToken');
  const userData = localStorage.getItem('user');
  if (!authToken || !userData) {
    sessionStorage.setItem('redirectAfterLogin', '/generator');
    navigate('/login');
  }
}, [navigate]);
```

---

## Page Details

### `Index.tsx` — Dashboard / Landing Page

Two modes based on auth state:
- **Logged out**: Marketing landing page with feature cards, how-it-works, stats
- **Logged in**: Shows credits balance, recent 3 papers, template gallery

Key implementation details:
- Credits: POST `/api/get-credits` — **⚠️ Bug: `setUserCredits(100)` on line 882 overwrites the real API result** — always shows 100
- Recent papers: POST `/api/get-questions-paper-history` → last 3 S3 links
- Template gallery: `allTemplates` from `src/Templatedata/QuestionPapperTemplate/TemplatesPreview.ts` — 12 university entries
- Clicking template → `navigate('/generator', { state: { templateID: id } })`
- Profile picture loaded from `localStorage` key `profilePicture_<email>`
- Logout: clears `authToken` and `user` from localStorage

---

### `Login.tsx`

- Email/password → POST `/api/auth/login` → stores `user`, `authToken`, `apiToken` in localStorage
- Google OAuth via `LoginSocialGoogle` → POST `/api/auth/google`
- After success: reads `sessionStorage.redirectAfterLogin` → navigates there (or to `/`)
- Google Client ID from `import.meta.env.VITE_GOOGLE_CLIENT_ID`

---

### `Signup.tsx`

- Email/password → POST `/api/auth/signup`
- Google → POST `/api/auth/google-signup`
- New users start with 5 credits (set in DB on insert)

---

### `Generator.tsx` — Main Descriptive Paper Generator

**Two generation modes per section** (toggled by Switch):
- **Bulk AI** (`isAutoGenerate: true`): Single config applies to all questions — set count, marks, difficulty, units
- **Individual** (`isAutoGenerate: false`): Set AI count + Manual count separately; each question has its own config

**Flow**:
1. Upload syllabus → POST `/api/extract-syllabus` (multipart, Bearer `btoa(api_token)`) → populates `subjectName` + `syllabusText`, locks subject field
2. Optional header image upload → FileReader → base64 in `headerImage` state
3. Click Generate:
   - POST `/api/get-credits` (raw `api_token`, not base64) — if < 1 credit, redirect to pricing
   - POST `/api/generate-questions` (base64 Bearer) — sends `{ subjectName, sections, unitTopics }`
   - Stores result in sessionStorage
   - `crypto.getRandomValues()` for S3 token (not Math.random)
   - POST `/api/deduct-credits` (non-blocking try/catch)
   - `navigate('/result/:templateId', { state: { templateID: templateId } })`

**Units hardcoded**: `["UNIT I", "UNIT II", "UNIT III", "UNIT IV", "UNIT V"]`

**`parseSyllabus(text)`**: Regex-based unit extraction from OCR text. Returns `{ "UNIT I": "topics...", ... }`. If 0 units parsed → error toast, generation blocked.

---

### `MCQGenerator.tsx` — MCQ Paper Generator

- Full UI exists (quiz title, topic, tags, question count slider, sections)
- **No backend route for MCQ generation** — feature is unfinished; submit does nothing
- Auth guard present

---

### `Result.tsx` — Paper Display & Export

- Active code starts at line 590 (lines 1–589 are dead commented-out code)
- Reads config from `sessionStorage.getItem("questionPaperConfig")` on mount
- Template: `TemplateRegistry[location.state?.templateID || 0]` → renders as `<TemplateComponent editedConfig={config} />`
- DOM element with `id="question-paper-content"` is what gets captured for PDF

**Auto S3 upload**: On mount, if `sessionStorage.getItem("shouldUploadOnce") === "true"`, calls `S3Upload(config, token, templateId)` and clears the flag.

**Export options**:

| Type | How |
|------|-----|
| PDF | `generatePDF("question-paper-content")` → blob → download |
| Encrypted PDF | blob → POST `/api/encrypt-pdf` (multipart) → encrypted blob → download |
| Word (.docx) | `docx` library builds document → `Packer.toBlob()` → `file-saver` saveAs |
| Email share | `ShareDialog` → POST `/api/send-email` with PDF blob |

**Answer key**: POST `/api/generate-answer-key` (Bearer token) — shows inline accordion.

---

### `ForgotPassword.tsx`
POST `/api/auth/forgot-password` → `{ email }` → triggers reset email

### `ResetPassword.tsx`
Reads `?token=` from URL → POST `/api/auth/reset-password` → `{ token, newPassword }`

---

### `Support.tsx`

- 7 hardcoded FAQ items in Accordion
- Contact form: react-hook-form + zod schema (`fullName`, `email`, `subject` select, `message`)
- On submit: POST `/api/support` first, then POST `/api/slack-alert` (both fire, slack is best-effort)
- Pre-fills `fullName` and `email` from localStorage if logged in
- `id="form"` on form section → `/support#form` anchor scroll works
- Purposes: "Technical Issues", "Subscription Enquiry", "Others"

---

### `Pricing.tsx`

Static page, no API calls.

| Plan | Price | Notes |
|------|-------|-------|
| Free | ₹0 | 5 papers/month |
| Pro | ₹299/mo | "Start Pro Trial" → `console.log` (not implemented) |
| Institution | ₹999/mo | "Contact Sales" → `/Support#form` |

---

### Other Pages

| Page | Notes |
|------|-------|
| `Templates.tsx` | Gallery using `allTemplates` — clicking navigates to generator with templateID |
| `Profile.tsx` | Profile picture stored in localStorage only (not DB/S3) |
| `AnswerKey.tsx` | Descriptive answer key display |
| `MCQAnswerKey.tsx` | MCQ answer key (depends on unfinished MCQ backend) |
| `CreateCommunity.tsx` | Planned community feature — no backend routes |
| `NotFound.tsx` | 404 catch-all |

---

## Key Components

### `ShareDialog.tsx`
Modal: email recipient field → generates PDF blob → POST `/api/send-email` (multipart with PDF attachment)

### `DashboardStats.tsx`
Fetches GET `/api/stats` → shows `totalPapers`, `activeUsers`, `avgTime` (hardcoded 3), `satisfaction` (hardcoded 98)

### `EditableQuestionPaper.tsx`
**Entirely dead code** — all ~400 lines are commented out. Imported in Result.tsx but renders nothing.

### `Footer.tsx`, `FeatureCard.tsx`, `HowItWorks.tsx`
Pure UI/marketing components, no API calls.
