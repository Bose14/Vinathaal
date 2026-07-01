import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2, X, Brain, Wand2 } from "lucide-react";
import { toast } from "sonner";

interface MCQQuestionConfig {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  marks: number;
  difficulty: string;
  unit: string;
}

interface MCQSection {
  id: string;
  name: string;
  questions: number;
  marksPerQuestion: number;
  difficulty: string;
  units: string[];
  customQuestions: MCQQuestionConfig[];
}

const MCQGenerator = () => {
  const navigate = useNavigate();
  useRequireAuth('/mcq-generator');

  const [quizTitle, setQuizTitle]           = useState("");
  const [subject, setSubject]               = useState("");
  const [description, setDescription]       = useState("");
  const [tags, setTags]                     = useState<string[]>([]);
  const [currentTag, setCurrentTag]         = useState("");
  const [quizTopic, setQuizTopic]           = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState([5]);

  const [university, setUniversity]         = useState("");
  const [examDate, setExamDate]             = useState("");
  const [duration, setDuration]             = useState("");
  const [headerImage, setHeaderImage]       = useState<string | null>(null);
  const [sections, setSections]             = useState<MCQSection[]>([
    { id: "1", name: "Section A", questions: 10, marksPerQuestion: 1, difficulty: "Easy", units: ["UNIT I"], customQuestions: [] },
  ]);

  const handleHeaderImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => { setHeaderImage(e.target?.result as string); toast.success("Header image uploaded!"); };
      reader.readAsDataURL(file);
    }
  };

  const addSection = () => {
    setSections([...sections, { id: Date.now().toString(), name: `Section ${String.fromCharCode(65 + sections.length)}`, questions: 5, marksPerQuestion: 1, difficulty: "Easy", units: [], customQuestions: [] }]);
  };
  const removeSection = (id: string) => { if (sections.length > 1) setSections(sections.filter(s => s.id !== id)); };
  const updateSection = (id: string, field: keyof MCQSection, value: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  const toggleUnit = (sectionId: string, unit: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const units = s.units.includes(unit) ? s.units.filter(u => u !== unit) : [...s.units, unit];
        return { ...s, units };
      }
      return s;
    }));
  };
  const addCustomMCQ = (sectionId: string) => {
    const q: MCQQuestionConfig = { id: Date.now().toString(), text: "", options: ["", "", "", ""], correctAnswer: 0, marks: 1, difficulty: "Medium", unit: "UNIT I" };
    setSections(sections.map(s => s.id === sectionId ? { ...s, customQuestions: [...s.customQuestions, q] } : s));
  };
  const removeCustomMCQ = (sectionId: string, questionId: string) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, customQuestions: s.customQuestions.filter(q => q.id !== questionId) } : s));
  };
  const updateCustomMCQ = (sectionId: string, questionId: string, field: keyof MCQQuestionConfig, value: any) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, customQuestions: s.customQuestions.map(q => q.id === questionId ? { ...q, [field]: value } : q) } : s));
  };
  const updateMCQOption = (sectionId: string, questionId: string, optionIndex: number, value: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, customQuestions: s.customQuestions.map(q => {
          if (q.id === questionId) { const opts = [...q.options]; opts[optionIndex] = value; return { ...q, options: opts }; }
          return q;
        })};
      }
      return s;
    }));
  };
  const addTag = () => { if (currentTag.trim() && !tags.includes(currentTag.trim())) { setTags([...tags, currentTag.trim()]); setCurrentTag(""); } };
  const removeTag = (t: string) => setTags(tags.filter(x => x !== t));
  const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } };

  const totalMarks = sections.reduce((t, s) => t + s.questions * s.marksPerQuestion, 0);

  const handleGenerate = () => {
    if (!quizTitle.trim() || quizTitle.length < 4) { toast.error("Quiz title must be at least 4 characters"); return; }
    if (!subject.trim()) { toast.error("Please select a subject"); return; }
    const config = { subjectName: subject, university, examDate, duration, headerImage, sections: sections.map(s => ({ ...s, questions: numberOfQuestions[0] })), totalMarks: numberOfQuestions[0], type: 'mcq', quizTitle, description, tags, quizTopic, additionalContext };
    sessionStorage.setItem('questionPaperConfig', JSON.stringify(config));
    toast.success("MCQ question paper generated successfully!");
    navigate("/result");
  };

  const subjects = ["General Knowledge", "Mathematics", "Science", "History", "Geography", "English", "Computer Science", "Physics", "Chemistry", "Biology"];
  const units    = ["UNIT I", "UNIT II", "UNIT III", "UNIT IV", "UNIT V"];

  const inputCls  = "h-9 text-xs border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white";
  const labelCls  = "text-xs font-medium text-gray-700 dark:text-gray-300";
  const dividerCls = "border-t border-gray-100 dark:border-gray-700 pt-5";

  return (
    <div className="min-h-full p-6 md:p-8 max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-2.5 mb-0.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">MCQ Generator</h1>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 ml-10.5">Create AI-generated multiple choice question sets</p>
      </div>

      {/* Main form card */}
      <Card className="animate-fade-in-up delay-100 border-gray-100 dark:border-gray-700 dark:bg-gray-800/60 shadow-none">
        <CardHeader className="pb-4 border-b border-gray-50 dark:border-gray-700/60">
          <CardTitle className="text-sm font-semibold text-gray-800 dark:text-white">Quiz Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">

          {/* Quiz Title */}
          <div className="space-y-1.5">
            <Label htmlFor="quiz-title" className={labelCls}>Quiz Title</Label>
            <Input id="quiz-title" placeholder="Enter quiz title (min 4 characters)" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} className={inputCls} />
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className={inputCls}><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className={labelCls}>
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <Textarea id="description" placeholder="Enter quiz description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="text-xs resize-none border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className={labelCls}>Tags <span className="text-gray-400 font-normal">(optional)</span></Label>
            <div className="flex gap-2">
              <Input placeholder="Add a tag and press Enter" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyPress={handleKeyPress} className={`${inputCls} flex-1`} />
              <Button onClick={addTag} variant="outline" size="sm" className="h-9 text-xs border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">Add</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 leading-none">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* AI Generation */}
          <div className={dividerCls}>
            <div className="flex items-center gap-2 mb-4">
              <Wand2 className="w-3.5 h-3.5 text-blue-500" />
              <p className="text-xs font-semibold text-gray-800 dark:text-white">Generate with AI</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="quiz-topic" className={labelCls}>Quiz Topic</Label>
                <Input id="quiz-topic" placeholder="e.g. Solar System, World War II, JavaScript Basics" value={quizTopic} onChange={(e) => setQuizTopic(e.target.value)} className={inputCls} />
                <p className="text-[11px] text-gray-400 dark:text-gray-500">This will be used as the quiz title</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="additional-context" className={labelCls}>
                  Additional Context <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Textarea id="additional-context" placeholder="Add specific details, difficulty level, or target audience" value={additionalContext} onChange={(e) => setAdditionalContext(e.target.value)} rows={3} className="text-xs resize-none border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className={labelCls}>Number of Questions</Label>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">{numberOfQuestions[0]}</span>
                </div>
                <Slider value={numberOfQuestions} onValueChange={setNumberOfQuestions} max={20} min={1} step={1} className="w-full" />
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500">
                  <span>1</span><span>10</span><span>20</span>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-1">
            <Button
              onClick={handleGenerate}
              className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-[#3F3D56] to-[#007AFF] text-white hover:opacity-90"
              disabled={!quizTitle.trim() || quizTitle.length < 4 || !subject.trim()}
            >
              <Brain className="w-4 h-4 mr-2" />
              Generate MCQ Paper
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default MCQGenerator;
