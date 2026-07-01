import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Plus, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface QuestionBankSection {
  id: string;
  name: string;
  chapters: string[];
  questionTypes: string[];
  difficulty: string;
  questions: number;
  marksPerQuestion: number;
}

const QuestionBankGenerator = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userData  = localStorage.getItem('user');
    if (!authToken || !userData) {
      sessionStorage.setItem('redirectAfterLogin', '/question-bank');
      navigate('/login');
    }
  }, [navigate]);

  const [subjectName, setSubjectName] = useState("");
  const [university, setUniversity]   = useState("");
  const [examDate, setExamDate]       = useState("");
  const [duration, setDuration]       = useState("");
  const [sections, setSections]       = useState<QuestionBankSection[]>([
    { id: "1", name: "Section A", chapters: [], questionTypes: [], difficulty: "Medium", questions: 5, marksPerQuestion: 2 },
  ]);

  const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "History", "Geography", "Economics", "Political Science"];
  const chapters = ["Chapter 1: Introduction", "Chapter 2: Fundamentals", "Chapter 3: Advanced Topics", "Chapter 4: Applications", "Chapter 5: Case Studies"];
  const questionTypes = ["Short Answer", "Long Answer", "Essay Type", "Problem Solving", "Analytical", "Descriptive"];

  const addSection = () => {
    setSections([...sections, { id: Date.now().toString(), name: `Section ${String.fromCharCode(65 + sections.length)}`, chapters: [], questionTypes: [], difficulty: "Medium", questions: 5, marksPerQuestion: 2 }]);
  };
  const removeSection = (id: string) => { if (sections.length > 1) setSections(sections.filter(s => s.id !== id)); };
  const updateSection = (id: string, field: keyof QuestionBankSection, value: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  const toggleChapter = (sectionId: string, chapter: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const chs = s.chapters.includes(chapter) ? s.chapters.filter(c => c !== chapter) : [...s.chapters, chapter];
        return { ...s, chapters: chs };
      }
      return s;
    }));
  };
  const toggleQuestionType = (sectionId: string, type: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const types = s.questionTypes.includes(type) ? s.questionTypes.filter(t => t !== type) : [...s.questionTypes, type];
        return { ...s, questionTypes: types };
      }
      return s;
    }));
  };

  const totalMarks = sections.reduce((t, s) => t + s.questions * s.marksPerQuestion, 0);

  const handleGenerate = () => {
    if (!subjectName.trim()) { toast.error("Please select a subject"); return; }
    if (sections.some(s => s.chapters.length === 0 || s.questionTypes.length === 0)) {
      toast.error("Please select chapters and question types for all sections");
      return;
    }
    const config = { subjectName, university, examDate, duration, sections, totalMarks, type: 'question-bank' };
    sessionStorage.setItem('questionPaperConfig', JSON.stringify(config));
    toast.success("Question bank paper generated successfully!");
    navigate("/result");
  };

  const inputCls = "h-9 text-xs border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white";
  const labelCls = "text-xs font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="min-h-full p-6 md:p-8 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-2.5 mb-0.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Question Bank Generator</h1>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-10.5">Build a comprehensive question repository by chapter and type</p>
      </div>

      {/* Paper details */}
      <Card className="animate-fade-in-up delay-100 border-gray-100 dark:border-gray-700 dark:bg-gray-800/60 shadow-none">
        <CardHeader className="pb-4 border-b border-gray-50 dark:border-gray-700/60">
          <CardTitle className="text-sm font-semibold text-gray-800 dark:text-white">Paper Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className={labelCls}>Subject</Label>
              <Select value={subjectName} onValueChange={setSubjectName}>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="university" className={labelCls}>University / Institution</Label>
              <Input id="university" placeholder="e.g., Anna University" value={university} onChange={(e) => setUniversity(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date" className={labelCls}>Exam Date</Label>
              <Input id="date" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration" className={labelCls}>Duration</Label>
              <Input id="duration" placeholder="e.g., 3 Hours" value={duration} onChange={(e) => setDuration(e.target.value)} className={inputCls} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="animate-fade-in-up delay-200 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800 dark:text-white">Sections</p>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
              Total: {totalMarks} marks
            </span>
            <Button onClick={addSection} size="sm" variant="outline" className="h-8 text-xs border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Section
            </Button>
          </div>
        </div>

        {sections.map((section, idx) => (
          <Card key={section.id} className="border-gray-100 dark:border-gray-700 dark:bg-gray-800/60 shadow-none">
            <CardContent className="p-4">
              {/* Section header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{String.fromCharCode(65 + idx)}</span>
                  </div>
                  <Input
                    value={section.name}
                    onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                    className="h-8 text-xs font-semibold w-36 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                {sections.length > 1 && (
                  <button onClick={() => removeSection(section.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Chapters */}
                <div className="space-y-2">
                  <Label className={labelCls}>Select Chapters</Label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-xl p-3 bg-gray-50/50 dark:bg-gray-900/30">
                    {chapters.map(chapter => (
                      <div key={chapter} className="flex items-center gap-2">
                        <Checkbox id={`${section.id}-${chapter}`} checked={section.chapters.includes(chapter)} onCheckedChange={() => toggleChapter(section.id, chapter)} className="w-3.5 h-3.5" />
                        <label htmlFor={`${section.id}-${chapter}`} className="text-[11px] text-gray-600 dark:text-gray-400 cursor-pointer leading-tight">{chapter}</label>
                      </div>
                    ))}
                  </div>
                  {section.chapters.length > 0 && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">{section.chapters.length} chapter{section.chapters.length > 1 ? 's' : ''} selected</p>
                  )}
                </div>

                {/* Question Types */}
                <div className="space-y-2">
                  <Label className={labelCls}>Question Types</Label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-xl p-3 bg-gray-50/50 dark:bg-gray-900/30">
                    {questionTypes.map(type => (
                      <div key={type} className="flex items-center gap-2">
                        <Checkbox id={`${section.id}-${type}`} checked={section.questionTypes.includes(type)} onCheckedChange={() => toggleQuestionType(section.id, type)} className="w-3.5 h-3.5" />
                        <label htmlFor={`${section.id}-${type}`} className="text-[11px] text-gray-600 dark:text-gray-400 cursor-pointer">{type}</label>
                      </div>
                    ))}
                  </div>
                  {section.questionTypes.length > 0 && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">{section.questionTypes.length} type{section.questionTypes.length > 1 ? 's' : ''} selected</p>
                  )}
                </div>

                {/* Config */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className={labelCls}>Difficulty</Label>
                    <Select value={section.difficulty} onValueChange={(v) => updateSection(section.id, 'difficulty', v)}>
                      <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className={labelCls}>Questions</Label>
                      <Input type="number" value={section.questions} onChange={(e) => updateSection(section.id, 'questions', parseInt(e.target.value) || 1)} min="1" className={`${inputCls} text-center`} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={labelCls}>Marks Each</Label>
                      <Input type="number" value={section.marksPerQuestion} onChange={(e) => updateSection(section.id, 'marksPerQuestion', parseInt(e.target.value) || 1)} min="1" className={`${inputCls} text-center`} />
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Section marks</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{section.questions * section.marksPerQuestion}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generate */}
      <div className="animate-fade-in-up delay-300 flex justify-center pb-4">
        <Button onClick={handleGenerate} className="h-10 px-8 text-sm font-semibold bg-gradient-to-r from-[#3F3D56] to-[#007AFF] text-white hover:opacity-90">
          <FileText className="w-4 h-4 mr-2" />
          Generate Question Paper
        </Button>
      </div>
    </div>
  );
};

export default QuestionBankGenerator;
