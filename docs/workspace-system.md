# Workspace System

## Overview

The workspace system lets one user maintain **separate contexts** for different institutions they work with — e.g., a teacher using Vinathaal for both their college and a coaching centre.

Each workspace carries:
- **Identity** — display name, institution name, logo URL
- **Type** — `university | school | coaching | other`
- **Exam Patterns** — saved section configs that auto-populate the Generator form

---

## Database

Two new tables added via `backend/migrations/001_workspaces.sql`:

```
workspaces
  id, user_id, name, institution_name, type, logo_url, is_default, created_at

exam_patterns
  id, workspace_id, name, config (JSON), created_at
```

`config` structure:
```json
{
  "sections": [
    {
      "name": "Part A",
      "questionCount": 10,
      "marksPerQuestion": 2,
      "difficulty": "Easy",
      "units": ["UNIT I", "UNIT II", "UNIT III", "UNIT IV", "UNIT V"],
      "subQuestionsCount": 0
    }
  ]
}
```

`question_papers` gains a nullable `workspace_id` FK for future history filtering.

**Run the migration:**
```bash
mysql -h <RDS_HOST> -u <USER> -p <DB_NAME> < backend/migrations/001_workspaces.sql
```

---

## Backend API

All routes are protected (Bearer token). Base path: `/api`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/workspaces` | List all workspaces for the auth user |
| POST | `/workspaces` | Create workspace |
| PUT | `/workspaces/:id` | Update workspace |
| DELETE | `/workspaces/:id` | Delete workspace + all its patterns |
| PUT | `/workspaces/:id/set-default` | Set as default workspace |
| GET | `/workspaces/:id/patterns` | List patterns for a workspace |
| POST | `/workspaces/:id/patterns` | Create pattern |
| PUT | `/workspaces/:id/patterns/:patternId` | Update pattern |
| DELETE | `/workspaces/:id/patterns/:patternId` | Delete pattern |

Route file: `backend/routes/workspaces.js` — factory `(db) => router`.

---

## Frontend

### Context

`src/context/WorkspaceContext.tsx` — `WorkspaceProvider` wraps the app inside `AuthProvider`.

```tsx
const { workspaces, activeWorkspace, patterns, setActiveWorkspace, loadWorkspaces, refreshPatterns } = useWorkspace();
```

- `workspaces` — all workspaces for the logged-in user
- `activeWorkspace` — currently selected, persisted in `localStorage.activeWorkspaceId`
- `patterns` — exam patterns for the active workspace (auto-loaded on switch)
- `setActiveWorkspace(ws)` — switch + persist + reload patterns
- `loadWorkspaces()` — force refresh (call after create/update/delete)
- `refreshPatterns()` — reload patterns for the current active workspace

### Preset Library

`src/lib/presetPatterns.ts` — 10 built-in patterns:

| ID | Name | Type | Total Marks |
|----|------|------|-------------|
| `anna-university-theory` | Anna University — Theory | university | 100 |
| `anna-university-with-c` | Anna University — Theory (with Part C) | university | 100 |
| `vtu-theory` | VTU — Theory Paper | university | 100 |
| `mumbai-university-theory` | Mumbai University — Theory | university | 80 |
| `cbse-class-12` | CBSE Class 12 | school | 80 |
| `cbse-class-10` | CBSE Class 10 | school | 80 |
| `jee-mock-test` | JEE Mock Test | coaching | 300 |
| `neet-mock-test` | NEET Mock Test | coaching | 720 |
| `chapter-test` | Chapter Test (Coaching) | coaching | 120 |
| `internal-assessment` | Internal Assessment (IA) | university | 30 |

### Pages

**`/workspaces`** — `src/pages/Workspaces.tsx`

- List of workspace cards (expand to see patterns)
- Create / Edit / Delete workspaces via modal
- Set default workspace (star icon)
- Add patterns from the preset library or (future) custom form
- Delete individual patterns

**Generator (`/generator`)** — Quick Setup panel at top

When the user has at least one workspace:
- **Workspace selector** → switches active workspace, auto-fills university name and logo
- **Pattern selector** → one click populates all sections config

---

## User Flow

### First-time setup (done once)
1. Go to `/workspaces`
2. Click **New Workspace** → fill name, institution, type, optional logo URL
3. Expand the workspace → **Add from Library** → pick a preset pattern (e.g. "Anna University — Theory")

### Every generation
1. Go to Generator
2. **Quick Setup panel** → workspace is pre-selected, pick pattern from dropdown → sections auto-filled
3. Upload syllabus → AI extracts subject name
4. Click **Generate**

Total interaction: ~3 clicks after initial setup.

---

## Adding New Preset Patterns

Edit `src/lib/presetPatterns.ts` and add an entry to `PRESET_PATTERNS`:

```ts
{
  id: 'unique-id',
  name: 'Display Name',
  description: 'One-line description shown in picker',
  institutionType: 'university' | 'school' | 'coaching',
  totalMarks: 100,
  duration: '3 Hours',
  sections: [
    { name: 'Part A', questionCount: 10, marksPerQuestion: 2, difficulty: 'Easy', units: ALL_UNITS, subQuestionsCount: 0 },
  ],
}
```

---

## Future: Institution Accounts

The workspace system is the foundation. The institution tier adds:

- `institution_id` on `workspaces` table (owner institution)
- Teacher invitations (many users → one workspace)
- Admin dashboard: usage per teacher, credit pool allocation
- Workspace-scoped paper history and branding enforcement

For solo mode (current), each workspace belongs to exactly one user.
