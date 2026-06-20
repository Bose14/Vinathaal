# Template System

## Template Registry

File: `src/Templatedata/QuestionPapperTemplate/TemplateRegistry.ts`

```ts
export const TemplateRegistry = {
  0: DefaultTemplate,
  1: TemplateOne,
  2: TemplateTwo,
  3: TemplateThree,
}
```

Templates are indexed numerically. There are currently 4 templates (0–3).

---

## Selection Flow

```
Index.tsx / Templates.tsx
    ↓  user clicks a template
navigate('/generator', { state: { templateID: id } })
    ↓
Generator.tsx
    const templateId = location.state?.templateID || 0
    ↓  on generate success
navigate('/result/:templateId', { state: { templateID: templateId } })
    ↓
Result.tsx
    const templateId = location.state?.templateID || 0
    const TemplateComponent = TemplateRegistry[templateId]
    <TemplateComponent editedConfig={config} />
```

If no template is selected (direct URL nav), defaults to `0` (DefaultTemplate).

---

## Template Props Contract

Every template receives a single prop: `editedConfig`

```ts
interface QuestionPaperConfig {
  university: string;
  subjectName: string;
  examDate: string;           // e.g. "2025-11-15"
  duration: string;           // e.g. "3 Hours"
  headerImage: string | null; // base64 data URL from FileReader
  totalMarks: number;
  sections: Section[];
  type?: 'mcq' | 'descriptive';
}

interface Section {
  name: string;               // e.g. "Section A"
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  marks: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  unit?: string;              // e.g. "UNIT I"
  isAIGenerated?: boolean;
  subQuestionsCount?: number;
  subQuestions?: SubQuestion[];
}

interface SubQuestion {
  id: string;
  text: string;
  marks: number;
}
```

---

## DefaultTemplate (id: 0)

File: `src/Templatedata/QuestionPapperTemplate/DefaultTemplate.tsx`

Renders:
- **Header**: University name (bold h2), subject name (h3), date/time/marks row with border-bottom
- **Sections**: Section name as h4, numbered questions with `[marks]` in brackets
- **Sub-questions**: Lettered a, b, c... indented below parent question with `[marks]`
- **Footer**: "Generated using AI Question Paper Generator • {university} Format"

Note: The file has a commented-out earlier version (lines 1–42) that didn't support sub-questions — can be deleted.

---

## Template Gallery

File: `src/Templatedata/QuestionPapperTemplate/TemplatesPreview.ts`

12 university entries displayed in the gallery:

| id | University | Location |
|----|-----------|---------|
| 1 | Indian Institute of Science | Bangalore |
| 2 | University of Mumbai | Mumbai |
| 3 | University of Calcutta | Kolkata |
| 4 | University of Madras | Chennai |
| 5 | University of Delhi | Delhi |
| 6 | Anna University | Chennai |
| 7 | IIT Madras | Chennai |
| 8 | IIT Bombay | Mumbai |
| 9 | IIT Delhi | Delhi |
| 10 | Aligarh Muslim University | Aligarh |
| 11 | Amrita Vishwa Vidyapeetham | Coimbatore |
| 12 | Jamia Millia Islamia | Delhi |

> Note: Gallery alternates only 2 actual preview images (`question-paper.jpg` / `question-paper1.jpg`). All 12 entries share these 2 images — differentiation is by title/description only.

---

## Adding a New Template

1. Create `src/Templatedata/QuestionPapperTemplate/Template{N}.tsx`:
   ```tsx
   const TemplateN = ({ editedConfig }) => {
     return (
       <div>
         {/* render using editedConfig */}
       </div>
     );
   };
   export default TemplateN;
   ```

2. Register in `TemplateRegistry.ts`:
   ```ts
   import TemplateN from "./TemplateN";
   export const TemplateRegistry = {
     0: DefaultTemplate,
     1: TemplateOne,
     2: TemplateTwo,
     3: TemplateThree,
     4: TemplateN,     // ← add here
   }
   ```

3. Optionally add an entry to `TemplatesPreview.ts` for the gallery.

---

## PDF and Template ID

`S3Upload(config, token, templateId)` passes `templateId` to `POST /api/store-upload-metadata`. However, the backend INSERT query doesn't include it and the `question_papers` table has no `template_id` column — so it's not persisted to the DB.

To fix: Add `template_id INT` column to `question_papers` and update the INSERT query in `backend/routes/s3Upload.js`.
