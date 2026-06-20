# Project Overview

Vinathaal is a production SaaS platform that lets teachers and institutions generate AI-powered question papers from uploaded syllabi.

**Goal:** Automate the tedious manual process of writing exam papers — targeting Indian universities (Anna University style UNIT I–V structure).

**Production URL:** https://vinathaal.azhizen.com

---

## Core Product Flows

1. **Question Paper Generation** — Upload syllabus image → OCR extracts text → configure sections → Perplexity AI generates questions → render with templates → export PDF
2. **Answer Key Generation** — Select questions → Perplexity generates answer keywords + mark allocation
3. **PDF Export** — html2canvas + jsPDF renders DOM to multi-page PDF; qpdf CLI for password encryption
4. **Cloud Storage** — PDF uploaded to AWS S3 via presigned URL; metadata (email, S3 URL, subject, date) stored in MySQL
5. **Email Share** — PDF attached and sent via Nodemailer/Gmail SMTP
6. **Auth** — Email/password (bcrypt + JWT api_token) + Google OAuth (reactjs-social-login)
7. **Credits System** — Each generated paper costs 1 credit; credit balance stored in users table

---

## Business Details

| Detail | Value |
|--------|-------|
| Production URL | https://vinathaal.azhizen.com |
| Backend region | AWS ap-southeast-2 (Australia) |
| Secrets management | AWS SSM Parameter Store |
| CI/CD | GitHub Actions → SSH → EC2 → PM2 restart |
| Free plan | 5 credits on signup |
| Pro plan | ₹299/month (not yet integrated with payment gateway) |
| Institution plan | ₹999/month (contact sales → /support#form) |

---

## Repository Structure

```
F:\Vinathaal\
├── src/                    # React frontend (Vite + TypeScript)
│   ├── pages/              # All page components
│   ├── components/         # Shared UI components
│   ├── utils/              # pdfGenerator.ts, S3Uploads.ts
│   ├── lib/api.ts          # Central API_BASE export
│   └── Templatedata/       # Question paper templates
│       └── QuestionPapperTemplate/
│           ├── TemplateRegistry.ts
│           ├── DefaultTemplate.tsx
│           ├── TemplateOne.tsx
│           ├── TemplateTwo.tsx
│           └── TemplateThree.tsx
├── backend/                # Node.js + Express backend
│   ├── server.js           # Entry point, route registration
│   ├── routes/             # All route handlers
│   ├── services/           # generateWithPerplexity.js
│   ├── utils/              # config.js, env_extractor.js (SSM)
│   └── awsdb.js            # MySQL pool (util.promisify)
├── .env                    # Local dev env (not committed)
├── .env.production         # Production env (committed, no secrets)
└── memory-bank/            # This documentation
```
