export interface PresetSection {
  name: string;
  questionCount: number;
  marksPerQuestion: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  units: string[];
  subQuestionsCount: number;
}

export interface PresetPattern {
  id: string;
  name: string;
  description: string;
  institutionType: 'university' | 'school' | 'coaching';
  totalMarks: number;
  duration: string;
  sections: PresetSection[];
}

const ALL_UNITS = ['UNIT I', 'UNIT II', 'UNIT III', 'UNIT IV', 'UNIT V'];

export const PRESET_PATTERNS: PresetPattern[] = [
  {
    id: 'anna-university-theory',
    name: 'Anna University — Theory',
    description: 'Part A (10×2) + Part B (5×16). Standard for all AU affiliated colleges.',
    institutionType: 'university',
    totalMarks: 100,
    duration: '3 Hours',
    sections: [
      { name: 'Part A', questionCount: 10, marksPerQuestion: 2, difficulty: 'Easy', units: ALL_UNITS, subQuestionsCount: 0 },
      { name: 'Part B', questionCount: 5, marksPerQuestion: 16, difficulty: 'Medium', units: ALL_UNITS, subQuestionsCount: 0 },
    ],
  },
  {
    id: 'anna-university-with-c',
    name: 'Anna University — Theory (with Part C)',
    description: 'Part A (10×2) + Part B (5×13) + Part C (2×15). Post-2019 regulation.',
    institutionType: 'university',
    totalMarks: 100,
    duration: '3 Hours',
    sections: [
      { name: 'Part A', questionCount: 10, marksPerQuestion: 2, difficulty: 'Easy', units: ALL_UNITS, subQuestionsCount: 0 },
      { name: 'Part B', questionCount: 5, marksPerQuestion: 13, difficulty: 'Medium', units: ALL_UNITS, subQuestionsCount: 0 },
      { name: 'Part C', questionCount: 2, marksPerQuestion: 15, difficulty: 'Hard', units: ALL_UNITS, subQuestionsCount: 0 },
    ],
  },
  {
    id: 'vtu-theory',
    name: 'VTU — Theory Paper',
    description: '5 modules × 2 questions (answer 1), 20 marks each. Visvesvaraya Technological University.',
    institutionType: 'university',
    totalMarks: 100,
    duration: '3 Hours',
    sections: [
      { name: 'Module 1', questionCount: 2, marksPerQuestion: 10, difficulty: 'Medium', units: ['UNIT I'], subQuestionsCount: 0 },
      { name: 'Module 2', questionCount: 2, marksPerQuestion: 10, difficulty: 'Medium', units: ['UNIT II'], subQuestionsCount: 0 },
      { name: 'Module 3', questionCount: 2, marksPerQuestion: 10, difficulty: 'Medium', units: ['UNIT III'], subQuestionsCount: 0 },
      { name: 'Module 4', questionCount: 2, marksPerQuestion: 10, difficulty: 'Medium', units: ['UNIT IV'], subQuestionsCount: 0 },
      { name: 'Module 5', questionCount: 2, marksPerQuestion: 10, difficulty: 'Hard', units: ['UNIT V'], subQuestionsCount: 0 },
    ],
  },
  {
    id: 'mumbai-university-theory',
    name: 'Mumbai University — Theory',
    description: 'Q1 compulsory (20M) + Q2–Q6 choice-based (16M each). Standard MU pattern.',
    institutionType: 'university',
    totalMarks: 80,
    duration: '3 Hours',
    sections: [
      { name: 'Q1 (Compulsory)', questionCount: 5, marksPerQuestion: 4, difficulty: 'Easy', units: ALL_UNITS, subQuestionsCount: 0 },
      { name: 'Q2–Q3 (Any 1)', questionCount: 2, marksPerQuestion: 16, difficulty: 'Medium', units: ['UNIT I', 'UNIT II'], subQuestionsCount: 0 },
      { name: 'Q4–Q5 (Any 1)', questionCount: 2, marksPerQuestion: 16, difficulty: 'Medium', units: ['UNIT III', 'UNIT IV'], subQuestionsCount: 0 },
      { name: 'Q6–Q7 (Any 1)', questionCount: 2, marksPerQuestion: 16, difficulty: 'Hard', units: ['UNIT V'], subQuestionsCount: 0 },
    ],
  },
  {
    id: 'cbse-class-12',
    name: 'CBSE Class 12',
    description: 'Section A (MCQ) + B + C + D + E. Standard CBSE board exam pattern.',
    institutionType: 'school',
    totalMarks: 80,
    duration: '3 Hours',
    sections: [
      { name: 'Section A (MCQ)', questionCount: 18, marksPerQuestion: 1, difficulty: 'Easy', units: ALL_UNITS, subQuestionsCount: 0 },
      { name: 'Section B', questionCount: 6, marksPerQuestion: 2, difficulty: 'Easy', units: ALL_UNITS, subQuestionsCount: 0 },
      { name: 'Section C', questionCount: 6, marksPerQuestion: 3, difficulty: 'Medium', units: ALL_UNITS, subQuestionsCount: 0 },
      { name: 'Section D', questionCount: 4, marksPerQuestion: 5, difficulty: 'Hard', units: ALL_UNITS, subQuestionsCount: 0 },
    ],
  },
  {
    id: 'cbse-class-10',
    name: 'CBSE Class 10',
    description: 'Standard CBSE Class 10 board exam with MCQ + SA + LA sections.',
    institutionType: 'school',
    totalMarks: 80,
    duration: '3 Hours',
    sections: [
      { name: 'Section A (MCQ)', questionCount: 20, marksPerQuestion: 1, difficulty: 'Easy', units: ALL_UNITS, subQuestionsCount: 0 },
      { name: 'Section B', questionCount: 6, marksPerQuestion: 2, difficulty: 'Medium', units: ALL_UNITS, subQuestionsCount: 0 },
      { name: 'Section C', questionCount: 6, marksPerQuestion: 3, difficulty: 'Medium', units: ALL_UNITS, subQuestionsCount: 0 },
      { name: 'Section D', questionCount: 3, marksPerQuestion: 6, difficulty: 'Hard', units: ALL_UNITS, subQuestionsCount: 0 },
    ],
  },
  {
    id: 'jee-mock-test',
    name: 'JEE Mock Test',
    description: '90 questions across Physics, Chemistry, Maths. JEE Main pattern.',
    institutionType: 'coaching',
    totalMarks: 300,
    duration: '3 Hours',
    sections: [
      { name: 'Physics', questionCount: 30, marksPerQuestion: 4, difficulty: 'Hard', units: ALL_UNITS, subQuestionsCount: 0 },
      { name: 'Chemistry', questionCount: 30, marksPerQuestion: 4, difficulty: 'Hard', units: ALL_UNITS, subQuestionsCount: 0 },
      { name: 'Mathematics', questionCount: 30, marksPerQuestion: 4, difficulty: 'Hard', units: ALL_UNITS, subQuestionsCount: 0 },
    ],
  },
  {
    id: 'neet-mock-test',
    name: 'NEET Mock Test',
    description: '180 questions across Biology, Physics, Chemistry. NEET UG pattern.',
    institutionType: 'coaching',
    totalMarks: 720,
    duration: '3 Hours 20 Min',
    sections: [
      { name: 'Biology', questionCount: 90, marksPerQuestion: 4, difficulty: 'Hard', units: ALL_UNITS, subQuestionsCount: 0 },
      { name: 'Physics', questionCount: 45, marksPerQuestion: 4, difficulty: 'Hard', units: ALL_UNITS, subQuestionsCount: 0 },
      { name: 'Chemistry', questionCount: 45, marksPerQuestion: 4, difficulty: 'Hard', units: ALL_UNITS, subQuestionsCount: 0 },
    ],
  },
  {
    id: 'chapter-test',
    name: 'Chapter Test (Coaching)',
    description: 'Short 30-question test covering one chapter. Good for weekly assessments.',
    institutionType: 'coaching',
    totalMarks: 120,
    duration: '1 Hour',
    sections: [
      { name: 'Part I (MCQ)', questionCount: 20, marksPerQuestion: 4, difficulty: 'Medium', units: ['UNIT I'], subQuestionsCount: 0 },
      { name: 'Part II (Subjective)', questionCount: 5, marksPerQuestion: 8, difficulty: 'Hard', units: ['UNIT I'], subQuestionsCount: 0 },
    ],
  },
  {
    id: 'internal-assessment',
    name: 'Internal Assessment (IA)',
    description: 'Short 30-mark internal test used in most colleges for continuous assessment.',
    institutionType: 'university',
    totalMarks: 30,
    duration: '1 Hour',
    sections: [
      { name: 'Part A', questionCount: 5, marksPerQuestion: 2, difficulty: 'Easy', units: ['UNIT I', 'UNIT II'], subQuestionsCount: 0 },
      { name: 'Part B', questionCount: 2, marksPerQuestion: 10, difficulty: 'Medium', units: ['UNIT I', 'UNIT II'], subQuestionsCount: 0 },
    ],
  },
];
