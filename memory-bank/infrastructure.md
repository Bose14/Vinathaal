# Infrastructure & Deployment

## Production URLs

| Service | URL |
|---------|-----|
| Frontend | https://vinathaal.azhizen.com |
| Backend API | https://vinathaal.azhizen.com/api |
| Local Frontend | http://localhost:8080 |
| Local Backend | http://localhost:3001 |

---

## AWS Infrastructure

| Service | Purpose | Notes |
|---------|---------|-------|
| EC2 | Node.js backend | ap-southeast-2 (Australia), PM2 process manager |
| RDS MySQL | Database | Credentials via SSM |
| S3 | PDF file storage | Presigned PUT URLs, 5-min expiry |
| SSM Parameter Store | All secrets | Loaded at startup, fail-fast if missing |

---

## Environment Variables

### Frontend — Vite (baked at build time)

Stored in `.env` (dev) and `.env.production` (production):

| Variable | Dev | Production |
|----------|-----|-----------|
| `VITE_API_URL` | `http://localhost:3001/api` | `https://vinathaal.azhizen.com/api` |
| `VITE_GOOGLE_CLIENT_ID` | `961571231420-2vc0uud6mp86tmg6649htncnenh32tll.apps.googleusercontent.com` | same |

Accessed in code via:
```ts
import { API_BASE } from "@/lib/api";
// src/lib/api.ts:
export const API_BASE = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3001/api';
```

### Backend — AWS SSM Parameter Store

All secrets loaded at startup by `backend/utils/config.js` via `env_extractor.js`. If any fail → server aborts.

| SSM Key | Usage |
|---------|-------|
| `DB_HOST` | RDS MySQL endpoint |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name |
| `PORT` | Server port (default 3001) |
| `EMAIL_USER` | Gmail/SMTP username |
| `EMAIL_PASS` | Gmail App Password |
| `REGION_AWS` | AWS region (`ap-southeast-2`) |
| `ACCESS_KEY_ID_AWS` | S3 access key |
| `SECRET_ACCESS_KEY_AWS` | S3 secret key |
| `S3_BUCKET_NAME` | PDF storage bucket name |
| `FRONTEND_URL` | `https://vinathaal.azhizen.com` (CORS origin) |
| `PERPLEXITY_API_KEY` | Perplexity AI API key |
| `PERPLEXITY_ENDPOINT` | Perplexity API endpoint URL |
| `PERPLEXITY_MODEL` | Model name (e.g. `sonar-pro`) |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook |

> ⚠️ Missing from SSM: `JWT_SECRET` — currently hardcoded in `googleLoginRoute.js`

---

## CI/CD Pipeline

```
git push origin main
        ↓
GitHub Actions triggered
        ↓
SSH into EC2
        ↓
git pull
npm install (if package.json changed)
pm2 restart server.js
```

---

## Process Management (EC2)

```bash
pm2 start backend/server.js   # first time
pm2 restart                   # on deploy
pm2 logs                      # view logs
pm2 status                    # check running processes
```

PM2 auto-restarts on crash. Logs available via `pm2 logs`.

---

## CORS Configuration

```js
cors({
  origin: config.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
```

**Important**: `origin: "*"` + `credentials: true` is invalid per CORS spec — browsers block it. Always use explicit origin.

---

## EC2 System Dependencies

These must be installed on the EC2 instance:

| Dependency | Required by | Notes |
|-----------|-------------|-------|
| `qpdf` CLI | `EncryptPDF.js` | PDF password encryption. If missing, `/api/encrypt-pdf` silently fails |
| Node.js | All backend | npm packages handle Tesseract OCR (no system tesseract needed) |

Install qpdf on Ubuntu/Amazon Linux:
```bash
sudo apt install qpdf       # Ubuntu
sudo yum install qpdf       # Amazon Linux
```

---

## S3 File Storage

PDF filenames: `<subjectName_with_underscores>_<randomToken>.pdf`  
Public URL format: `https://<S3_BUCKET_NAME>.s3.<REGION_AWS>.amazonaws.com/<filename>`

Upload flow:
1. Frontend: GET `/api/get-upload-url?filename=...&filetype=...` → presigned PUT URL (5 min)
2. Frontend: PUT directly to S3 using presigned URL (bypasses backend for file transfer)
3. Frontend: POST `/api/store-upload-metadata` → saves URL + metadata to MySQL

---

## Google OAuth Client

- Client ID: `961571231420-2vc0uud6mp86tmg6649htncnenh32tll.apps.googleusercontent.com`
- Frontend library: `reactjs-social-login` (`LoginSocialGoogle` component)
- Flow: frontend → Google access token → backend `/api/auth/google` → Google userinfo API → app JWT
