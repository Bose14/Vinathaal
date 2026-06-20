# Tech Stack

## Frontend (`src/`)

| Category | Technology |
|----------|-----------|
| Framework | React 18.3.1 + TypeScript |
| Build tool | Vite |
| Routing | React Router v6 |
| UI library | ShadCN UI + Tailwind CSS 3.4 |
| Icons | Lucide React |
| Toasts | Sonner |
| HTTP | Axios + native fetch |
| Forms | react-hook-form + zod |
| Google OAuth | reactjs-social-login (`LoginSocialGoogle`) |
| PDF generation | html2canvas + jsPDF (DOM → canvas → PDF blob) |
| Word generation | docx + file-saver |
| Scroll | react-scroll (smooth anchor links on landing page) |

### Key Frontend Patterns

- **API base URL**: All API calls use `API_BASE` from `src/lib/api.ts` — reads `VITE_API_URL` env var, falls back to `http://localhost:3001/api`
- **Auth storage**: `localStorage` stores `user` (JSON), `authToken`, `apiToken`
- **Page-to-page state**: `sessionStorage` passes `questionPaperConfig` from Generator → Result
- **Profile picture**: Stored in `localStorage` under key `profilePicture_<email>` (not in DB)

---

## Backend (`backend/`)

| Category | Technology |
|----------|-----------|
| Runtime | Node.js |
| Framework | Express 5.1 |
| Database driver | mysql2 (pool.query promisified via util.promisify) |
| Auth | bcryptjs (password hashing) + JWT |
| OCR | Tesseract.js + Sharp (image preprocessing) |
| Email | Nodemailer (Gmail SMTP) |
| File uploads | Multer |
| AWS | aws-sdk v2 (S3 presigned URLs) + @aws-sdk/client-ssm |
| PDF encryption | qpdf CLI (via child_process.exec) |
| HTTP client | Axios (for calling Perplexity API + Google userinfo) |

### Key Backend Patterns

- **Factory pattern**: Every route file exports a function receiving dependencies `(db, config, perplexityService, transporter)` and returns an Express router — enables dependency injection
- **DB queries**: `db.query()` via `util.promisify` returns rows array directly (NOT `[rows, fields]`)
- **Auth header**: `Authorization: Bearer <base64(api_token)>` — protect middleware decodes base64 then DB-lookups the token
- **Config**: All secrets from AWS SSM at startup — if any fail, server aborts

---

## AI

| Detail | Value |
|--------|-------|
| Provider | Perplexity API |
| Use cases | Question generation, answer key generation |
| Model | Configured in SSM as `PERPLEXITY_MODEL` |
| Temperature | 0.7 |
| Max tokens | 1024 (may truncate large papers — known issue) |
| System prompt | "You are an expert academic question generator." |

---

## Infrastructure

| Service | Purpose |
|---------|---------|
| AWS EC2 (ap-southeast-2) | Node.js backend server |
| AWS RDS MySQL | Production database |
| AWS S3 | PDF file storage |
| AWS SSM Parameter Store | All secrets and config |
| GitHub Actions | CI/CD (push to main → deploy) |
| PM2 | Process management on EC2 |
| Nginx (assumed) | Reverse proxy / frontend serving |

---

## Environment Variables

### Frontend (`.env` / `.env.production`)
```
VITE_API_URL=http://localhost:3001/api          # dev
VITE_API_URL=https://vinathaal.azhizen.com/api  # production
VITE_GOOGLE_CLIENT_ID=961571231420-...
```

### Backend (AWS SSM Parameter Store)
`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`, `EMAIL_USER`, `EMAIL_PASS`,
`REGION_AWS`, `ACCESS_KEY_ID_AWS`, `SECRET_ACCESS_KEY_AWS`, `S3_BUCKET_NAME`,
`FRONTEND_URL`, `PERPLEXITY_API_KEY`, `PERPLEXITY_ENDPOINT`, `PERPLEXITY_MODEL`, `SLACK_WEBHOOK_URL`
