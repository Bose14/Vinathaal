const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const sharp = require('sharp');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const upload = multer({ dest: 'uploads/' });

const GEMINI_PROMPT = `You are an academic syllabus parser. Extract the following from the text below and return ONLY valid JSON with no markdown or explanation:

{
  "subjectName": "full subject name (e.g. Data Structures and Algorithms)",
  "subjectCode": "subject code if present (e.g. CS301), else empty string",
  "syllabusText": "all unit content formatted as:\\nUNIT I\\n<topics>\\n\\nUNIT II\\n<topics>\\n..."
}

Rules:
- subjectName: look for a title near subject code pattern like CS301, MA201, etc. If no code, use the first prominent heading that isn't a university name.
- syllabusText: include everything from UNIT I to the end of units. Exclude textbooks, references, outcomes sections.
- Preserve all topic names and subtopics under each unit.
- If no clear units found, put all content under "UNIT I".

Syllabus text:
`;

module.exports = (config) => {
  const router = express.Router();

  const gemini = config.GEMINI_API_KEY
    ? new GoogleGenerativeAI(config.GEMINI_API_KEY)
    : null;

  async function structureWithGemini(rawText) {
    if (!gemini) throw new Error('Gemini API key not configured');

    const model = gemini.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(GEMINI_PROMPT + rawText.slice(0, 8000));
    const json = JSON.parse(result.response.text());

    if (!json.subjectName || !json.syllabusText) {
      throw new Error('Gemini returned incomplete data');
    }
    return json;
  }

  function regexFallback(text) {
    const lines = text.split('\n').filter(Boolean).slice(0, 6);
    let subjectName = 'Unknown';
    for (const line of lines) {
      const match = line.match(/\b[A-Z]{1,3}\d{4}\b\s+(.*)/);
      if (match) {
        subjectName = match[1].replace(/\s{2,}/g, ' ').replace(/\bL\s*T\s*P\s*C\b.*$/i, '').trim();
        break;
      }
    }

    const unitStart = text.search(/UNIT\s+I/i);
    const slice = unitStart !== -1 ? text.slice(unitStart) : text;
    const endMatch = slice.match(/(OUTCOMES|TEXT\s*BOOKS|REFERENCES|TOTAL\s*:\s*\d+)/i);
    const syllabusText = (endMatch ? slice.slice(0, endMatch.index) : slice)
      .replace(/(UNIT\s+[IVX]+)/g, '\n\n$1')
      .trim();

    return { subjectName, subjectCode: '', syllabusText };
  }

  async function runOCR(imagePath) {
    const preprocessedPath = imagePath + '-processed.png';
    try {
      await sharp(imagePath)
        .resize({ width: 2480 })
        .grayscale()
        .normalize()
        .sharpen()
        .toFile(preprocessedPath);

      const { data: { text } } = await Tesseract.recognize(preprocessedPath, 'eng', {
        tessedit_pageseg_mode: '1',
        preserve_interword_spaces: '1',
      });

      return text || '';
    } finally {
      if (fs.existsSync(preprocessedPath)) fs.unlinkSync(preprocessedPath);
    }
  }

  router.post('/extract-syllabus', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path;
    const isPDF = req.file.mimetype === 'application/pdf' ||
                  req.file.originalname?.toLowerCase().endsWith('.pdf');

    try {
      let rawText = '';

      if (isPDF) {
        const buffer = fs.readFileSync(filePath);
        const { text } = await pdfParse(buffer);
        rawText = text.trim();

        if (rawText.length < 100) {
          return res.status(422).json({
            error: 'This PDF appears to be scanned and has no readable text. Please upload a photo or screenshot of the syllabus instead.',
          });
        }
      } else {
        rawText = await runOCR(filePath);

        if (!rawText || rawText.trim().length < 50) {
          return res.status(422).json({
            error: 'Could not extract text from the image. Please ensure the image is clear and well-lit.',
          });
        }
      }

      try {
        const structured = await structureWithGemini(rawText);
        return res.json(structured);
      } catch (geminiErr) {
        console.warn('Gemini structuring failed, using regex fallback:', geminiErr.message);
        return res.json(regexFallback(rawText));
      }

    } catch (err) {
      console.error('Extraction error:', err);
      res.status(500).json({ error: 'Failed to extract syllabus. Please try again.' });
    } finally {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  });

  return router;
};
