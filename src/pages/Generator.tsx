import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, FileText, Image, Settings, Wand2, Brain, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { S3Upload } from "@/utils/S3Uploads";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useWorkspace } from "@/context/WorkspaceContext";
import { ExamPattern } from "@/lib/apiClient";

interface QuestionConfig {
  id: string;
  text?: string;
  marks: number;
  difficulty: string;
  unit: string;
  subQuestionsCount: number;
  isAIGenerated: boolean;
  subQuestions?: SubQuestion[];
}

interface SubQuestion {
  id: string;
  text: string;
  marks: number;
}

interface AutoGenConfig {
  questionCount: number;
  marksPerQuestion: number;
  difficulty: string;
  units: string[];
  subQuestionsCount: number;
}

interface IndividualConfig {
  aiQuestionCount: number;
  manualQuestionCount: number;
  defaultMarks: number;
  defaultDifficulty: string;
  defaultUnit: string;
  defaultSubQuestionsCount: number;
}

interface Section {
  id: string;
  name: string;
  isAutoGenerate: boolean;
  autoConfig: AutoGenConfig;
  individualConfig: IndividualConfig;
  questions: QuestionConfig[];
}

const Generator = () => {
  const navigate = useNavigate();
  const { user, apiToken } = useAuth();
  useRequireAuth('/generator');
  const { workspaces, activeWorkspace, patterns, setActiveWorkspace } = useWorkspace();
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const location = useLocation();
  const templateId = location.state?.templateID || 0;

  const [subjectName, setSubjectName] = useState("");
  const [university, setUniversity] = useState("");
  const [examDate, setExamDate] = useState("");
  const [duration, setDuration] = useState("");
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [syllabusText, setSyllabusText] = useState("");
  const [isSubjectLocked, setIsSubjectLocked] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const userEmail = user?.email ?? "";

  const [sections, setSections] = useState<Section[]>([
    {
      id: "1",
      name: "Section A",
      isAutoGenerate: true,
      autoConfig: {
        questionCount: 5,
        marksPerQuestion: 2,
        difficulty: "Easy",
        units: ["UNIT I"],
        subQuestionsCount: 0
      },
      individualConfig: {
        aiQuestionCount: 3,
        manualQuestionCount: 2,
        defaultMarks: 2,
        defaultDifficulty: "Medium",
        defaultUnit: "UNIT I",
        defaultSubQuestionsCount: 0
      },
      questions: []
    }
  ]);

  const applyPattern = (pattern: ExamPattern) => {
    const newSections: Section[] = pattern.config.sections.map((s, i) => ({
      id: `pattern-${i}-${Date.now()}`,
      name: s.name,
      isAutoGenerate: true,
      autoConfig: {
        questionCount: s.questionCount,
        marksPerQuestion: s.marksPerQuestion,
        difficulty: s.difficulty,
        units: s.units,
        subQuestionsCount: s.subQuestionsCount ?? 0,
      },
      individualConfig: {
        aiQuestionCount: 3,
        manualQuestionCount: 0,
        defaultMarks: s.marksPerQuestion,
        defaultDifficulty: s.difficulty,
        defaultUnit: s.units[0] ?? 'UNIT I',
        defaultSubQuestionsCount: 0,
      },
      questions: [],
    }));
    setSections(newSections);
    toast.success(`Pattern "${pattern.name}" applied`);
  };

  const applyWorkspace = (ws: typeof activeWorkspace) => {
    if (!ws) return;
    if (ws.institution_name) setUniversity(ws.institution_name);
    if (ws.logo_url) setHeaderImage(ws.logo_url);
    setActiveWorkspace(ws);
  };

  const handleSyllabusUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSyllabusFile(file);
    toast.success("Syllabus file selected!");

    try {
      const data = await api.papers.extractSyllabus(file);
      setSubjectName(data.subjectName || "");
      setSyllabusText(data.syllabusText || "");
      setIsSubjectLocked(true);
      toast.success(`Syllabus extracted: ${data.subjectName}${data.subjectCode ? ` (${data.subjectCode})` : ""}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to extract syllabus.");
    }
  };

  const handleHeaderImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setHeaderImage(e.target?.result as string);
        toast.success("Header image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      name: `Section ${String.fromCharCode(65 + sections.length)}`,
      isAutoGenerate: true,
      autoConfig: { questionCount: 5, marksPerQuestion: 2, difficulty: "Medium", units: ["UNIT I"], subQuestionsCount: 0 },
      individualConfig: { aiQuestionCount: 3, manualQuestionCount: 2, defaultMarks: 2, defaultDifficulty: "Medium", defaultUnit: "UNIT I", defaultSubQuestionsCount: 0 },
      questions: []
    };
    setSections([...sections, newSection]);
  };

  const generateIndividualQuestions = (section: Section): QuestionConfig[] => {
    const questions: QuestionConfig[] = [];
    const { aiQuestionCount, manualQuestionCount, defaultMarks, defaultDifficulty, defaultUnit, defaultSubQuestionsCount } = section.individualConfig;

    for (let i = 0; i < aiQuestionCount; i++) {
      questions.push({ id: `ai-${Date.now()}-${i}`, marks: defaultMarks, difficulty: defaultDifficulty, unit: defaultUnit, subQuestionsCount: defaultSubQuestionsCount, isAIGenerated: true });
    }
    for (let i = 0; i < manualQuestionCount; i++) {
      questions.push({ id: `manual-${Date.now()}-${i}`, text: "", marks: defaultMarks, difficulty: defaultDifficulty, unit: defaultUnit, subQuestionsCount: defaultSubQuestionsCount, isAIGenerated: false, subQuestions: [] });
    }
    return questions;
  };

  const updateIndividualConfig = (sectionId: string, field: keyof IndividualConfig, value: any) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        const newSection = { ...section, individualConfig: { ...section.individualConfig, [field]: value } };
        if (field === 'aiQuestionCount' || field === 'manualQuestionCount') {
          newSection.questions = generateIndividualQuestions(newSection);
        }
        return newSection;
      }
      return section;
    }));
  };

  const removeSection = (id: string) => {
    if (sections.length > 1) setSections(sections.filter(section => section.id !== id));
  };

  const updateSection = (id: string, field: keyof Section, value: any) => {
    setSections(sections.map(section => section.id === id ? { ...section, [field]: value } : section));
  };

  const updateAutoConfig = (sectionId: string, field: keyof AutoGenConfig, value: any) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) return { ...section, autoConfig: { ...section.autoConfig, [field]: value } };
      return section;
    }));
  };

  const toggleAutoUnit = (sectionId: string, unit: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        const units = section.autoConfig.units.includes(unit)
          ? section.autoConfig.units.filter(u => u !== unit)
          : [...section.autoConfig.units, unit];
        return { ...section, autoConfig: { ...section.autoConfig, units } };
      }
      return section;
    }));
  };

  const addManualQuestion = (sectionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        const newQuestion: QuestionConfig = { id: Date.now().toString(), text: "", marks: 2, difficulty: "Medium", unit: "UNIT I", subQuestionsCount: 0, isAIGenerated: false, subQuestions: [] };
        return { ...section, questions: [...section.questions, newQuestion] };
      }
      return section;
    }));
  };

  const removeQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) return { ...section, questions: section.questions.filter(q => q.id !== questionId) };
      return section;
    }));
  };

  const updateQuestion = (sectionId: string, questionId: string, field: keyof QuestionConfig, value: any) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) return { ...section, questions: section.questions.map(q => q.id === questionId ? { ...q, [field]: value } : q) };
      return section;
    }));
  };

  const parseSyllabus = (text: string): { [key: string]: string } => {
    const unitTopics: { [key: string]: string } = {};
    const unitRegex = /(UNIT\s+[IVX\d]+[\s\S]*?)(?=\n\s*UNIT\s+[IVX\d]+|$)/g;
    let match;
    while ((match = unitRegex.exec(text)) !== null) {
      const unitBlock = match[1].trim();
      const titleMatch = unitBlock.match(/^(UNIT\s+[IVX\d]+)/);
      if (titleMatch) {
        const unitName = titleMatch[0].trim();
        unitTopics[unitName] = unitBlock.replace(unitName, '').trim();
      }
    }
    return unitTopics;
  };

  const totalMarks = sections.reduce((total, section) => {
    if (section.isAutoGenerate) {
      return total + section.autoConfig.questionCount * section.autoConfig.marksPerQuestion + section.autoConfig.questionCount * section.autoConfig.subQuestionsCount;
    }
    return total + section.questions.reduce((t, q) => t + q.marks + (q.subQuestionsCount || 0), 0);
  }, 0);

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const creditsResult = await api.credits.get(userEmail);
      if (creditsResult.credits < 1) {
        setPopupMessage("Not enough credits to generate a question paper. Let's upgrade to premium");
        setIsGenerating(false);
        setTimeout(() => navigate("/pricing"), 2000);
        return;
      }

      if (!subjectName.trim() || !syllabusText.trim()) {
        toast.error("Please provide a subject name and syllabus.");
        setIsGenerating(false);
        return;
      }

      const parsedUnitTopics = parseSyllabus(syllabusText);
      if (Object.keys(parsedUnitTopics).length === 0) {
        toast.error("Could not parse units from the syllabus. Please check the format.");
        setIsGenerating(false);
        return;
      }

      const payload = {
        university,
        subjectName,
        examDate,
        duration,
        headerImage,
        totalMarks,
        unitTopics: parsedUnitTopics,
        sections: sections.map(section => ({
          id: section.id,
          name: section.name,
          isAutoGenerate: section.isAutoGenerate,
          autoConfig: section.isAutoGenerate ? section.autoConfig : undefined,
          individualConfig: !section.isAutoGenerate ? section.individualConfig : undefined,
          questions: !section.isAutoGenerate ? section.questions : [],
        })),
      };

      const result = await api.papers.generate(payload);

      const updatedConfig = {
        ...payload,
        sections: payload.sections.map((section, idx) => ({
          ...section,
          questions: result.sections?.[idx]?.questions || [],
        })),
        type: "descriptive",
      };

      sessionStorage.setItem("questionPaperConfig", JSON.stringify(updatedConfig));

      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      const token = array[0].toString(36);
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("shouldUploadOnce", "true");

      toast.success("Question paper generated successfully!");

      try {
        await api.credits.deduct(userEmail);
      } catch (deductErr) {
        console.error("Error calling deduct API:", deductErr);
      }

      navigate(`/result/${templateId}`, { state: { templateID: templateId } });
    } catch (error) {
      console.error("Error generating paper:", error);
      toast.error("An error occurred while communicating with the server.");
    } finally {
      setIsGenerating(false);
    }
  };

  const units = ["UNIT I", "UNIT II", "UNIT III", "UNIT IV", "UNIT V"];

  const inputCls = "h-9 text-xs border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white";
  const labelCls = "text-xs font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="min-h-full p-6 md:p-8 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-2.5 mb-0.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Syllabus Generator</h1>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Upload your syllabus and let AI build your question paper</p>
      </div>

      {/* Quick Setup (workspaces) */}
      {workspaces.length > 0 && (
        <Card className="animate-fade-in-up border-gray-100 dark:border-gray-700 dark:bg-gray-800/60 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span className="text-xs font-semibold text-gray-800 dark:text-white">Quick Setup</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelCls}>Workspace</Label>
                <Select value={activeWorkspace?.id?.toString() ?? ''} onValueChange={(v) => { const ws = workspaces.find((w) => w.id === parseInt(v)); if (ws) applyWorkspace(ws); }}>
                  <SelectTrigger className={inputCls}><SelectValue placeholder="Select workspace..." /></SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                    {workspaces.map((ws) => <SelectItem key={ws.id} value={ws.id.toString()}>{ws.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className={labelCls}>Exam Pattern</Label>
                <Select value="" onValueChange={(v) => { const p = patterns.find((pat) => pat.id === parseInt(v)); if (p) applyPattern(p); }}>
                  <SelectTrigger className={inputCls}><SelectValue placeholder={patterns.length === 0 ? 'No patterns saved' : 'Apply a pattern...'} /></SelectTrigger>
                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                    {patterns.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {activeWorkspace && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
                Using <strong className="text-gray-600 dark:text-gray-300">{activeWorkspace.name}</strong>
                {activeWorkspace.institution_name ? ` · ${activeWorkspace.institution_name}` : ''}
                {patterns.length > 0 ? ` · ${patterns.length} pattern${patterns.length > 1 ? 's' : ''} available` : ''}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload row */}
      <div className="animate-fade-in-up delay-100 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Syllabus upload */}
        <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800/60 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <CardTitle className="text-sm font-semibold text-gray-800 dark:text-white">Upload Syllabus</CardTitle>
            </div>
            <CardDescription className="text-xs dark:text-gray-500">Upload your course materials to be analysed by AI</CardDescription>
          </CardHeader>
          <CardContent>
            <input type="file" accept=".pdf,.doc,.docx,.txt,.jpeg,.jpg" onChange={handleSyllabusUpload} className="hidden" id="syllabus-upload" />
            <label htmlFor="syllabus-upload" className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all duration-200 bg-gray-50/50 dark:bg-gray-900/30">
                {syllabusFile ? (
                  <>
                    <FileText className="w-9 h-9 mx-auto text-blue-500 mb-2" />
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">{syllabusFile.name}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">AI will generate questions from this</p>
                  </>
                ) : (
                  <>
                    <FileText className="w-9 h-9 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Click to upload syllabus</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">PDF, DOC, DOCX, TXT, JPG up to 10MB</p>
                  </>
                )}
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Header upload */}
        <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800/60 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <CardTitle className="text-sm font-semibold text-gray-800 dark:text-white">Upload Header <span className="text-gray-400 font-normal text-xs">(optional)</span></CardTitle>
            </div>
            <CardDescription className="text-xs dark:text-gray-500">Institution logo or custom header image</CardDescription>
          </CardHeader>
          <CardContent>
            <input type="file" accept="image/*" onChange={handleHeaderImageUpload} className="hidden" id="header-upload" />
            <label htmlFor="header-upload" className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all duration-200 bg-gray-50/50 dark:bg-gray-900/30">
                {headerImage ? (
                  <>
                    <img src={headerImage} alt="Header preview" className="max-h-20 mx-auto rounded-lg shadow-sm mb-2 object-contain" />
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Header uploaded — click to change</p>
                  </>
                ) : (
                  <>
                    <Image className="w-9 h-9 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Click to upload header</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </>
                )}
              </div>
            </label>
          </CardContent>
        </Card>
      </div>

      {/* Configure */}
      <Card className="animate-fade-in-up delay-200 border-gray-100 dark:border-gray-700 dark:bg-gray-800/60 shadow-none">
        <CardHeader className="pb-4 border-b border-gray-50 dark:border-gray-700/60">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <CardTitle className="text-sm font-semibold text-gray-800 dark:text-white">Configure Question Paper</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-6">
          {/* Paper meta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="university" className={labelCls}>University / Institution</Label>
              <Input id="university" placeholder="e.g., Anna University" value={university} onChange={(e) => setUniversity(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject" className={labelCls}>Subject Name</Label>
              <Input id="subject" placeholder="e.g., MATRICES AND CALCULUS" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} readOnly={isSubjectLocked} className={`${inputCls} ${isSubjectLocked ? "cursor-not-allowed bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-500" : ""}`} />
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

          {/* Sections */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-gray-800 dark:text-white">Sections</p>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                  Total: {totalMarks} marks
                </span>
                <Button onClick={addSection} size="sm" variant="outline" className="h-8 text-xs border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Section
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                  {/* Section header row */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold text-gray-800 dark:text-white">{section.name} Configuration</p>
                    {sections.length > 1 && (
                      <button onClick={() => removeSection(section.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1.5">
                      <Label className={labelCls}>Section Name</Label>
                      <Input value={section.name} onChange={(e) => updateSection(section.id, 'name', e.target.value)} placeholder="Section A" className={inputCls} />
                    </div>
                    <div className="flex items-center gap-3 pt-5">
                      <Switch checked={section.isAutoGenerate} onCheckedChange={(checked) => updateSection(section.id, 'isAutoGenerate', checked)} />
                      <Label className={`${labelCls} cursor-pointer`}>{section.isAutoGenerate ? 'Bulk AI Generation' : 'Individual Question Config'}</Label>
                    </div>
                  </div>

                  {section.isAutoGenerate ? (
                    <div className="space-y-4 bg-blue-50/40 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                      <div className="flex items-center gap-2">
                        <Wand2 className="w-3.5 h-3.5 text-blue-500" />
                        <p className="text-xs font-semibold text-gray-800 dark:text-white">Bulk AI Generation</p>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">— common settings for all questions</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1.5">
                          <Label className={labelCls}>Questions</Label>
                          <Input type="number" value={section.autoConfig.questionCount} onChange={(e) => updateAutoConfig(section.id, 'questionCount', parseInt(e.target.value) || 1)} min="1" max="20" className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className={labelCls}>Marks / Q</Label>
                          <Input type="number" value={section.autoConfig.marksPerQuestion} onChange={(e) => updateAutoConfig(section.id, 'marksPerQuestion', parseInt(e.target.value) || 1)} min="1" max="20" className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className={labelCls}>Difficulty</Label>
                          <Select value={section.autoConfig.difficulty} onValueChange={(value) => updateAutoConfig(section.id, 'difficulty', value)}>
                            <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                              <SelectItem value="Easy">Easy</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className={labelCls}>Sub-Q / Q</Label>
                          <Input type="number" value={section.autoConfig.subQuestionsCount} onChange={(e) => updateAutoConfig(section.id, 'subQuestionsCount', parseInt(e.target.value) || 0)} min="0" max="5" className={inputCls} />
                        </div>
                      </div>

                      <div>
                        <Label className={`${labelCls} mb-2 block`}>Units to Include</Label>
                        <div className="flex flex-wrap gap-2">
                          {units.map((unit) => (
                            <button key={unit} onClick={() => toggleAutoUnit(section.id, unit)}
                              className={["text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all",
                                section.autoConfig.units.includes(unit)
                                  ? "bg-gradient-to-r from-[#3F3D56] to-[#007AFF] text-white border-transparent"
                                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600",
                              ].join(" ")}>
                              {unit}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 bg-purple-50/40 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30">
                      <div className="flex items-center gap-2">
                        <Brain className="w-3.5 h-3.5 text-purple-500" />
                        <p className="text-xs font-semibold text-gray-800 dark:text-white">Individual Configuration</p>
                      </div>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">Set AI and manual question counts, then configure each individually</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/60 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="space-y-1.5">
                          <Label className={labelCls}>AI Questions</Label>
                          <Input type="number" value={section.individualConfig.aiQuestionCount} onChange={(e) => updateIndividualConfig(section.id, 'aiQuestionCount', parseInt(e.target.value) || 0)} min="0" max="20" className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className={labelCls}>Manual Questions</Label>
                          <Input type="number" value={section.individualConfig.manualQuestionCount} onChange={(e) => updateIndividualConfig(section.id, 'manualQuestionCount', parseInt(e.target.value) || 0)} min="0" max="20" className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className={labelCls}>Default Marks</Label>
                          <Input type="number" value={section.individualConfig.defaultMarks} onChange={(e) => updateIndividualConfig(section.id, 'defaultMarks', parseInt(e.target.value) || 1)} min="1" max="20" className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className={labelCls}>Default Difficulty</Label>
                          <Select value={section.individualConfig.defaultDifficulty} onValueChange={(value) => updateIndividualConfig(section.id, 'defaultDifficulty', value)}>
                            <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                              <SelectItem value="Easy">Easy</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 bg-white/60 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="space-y-1.5">
                          <Label className={labelCls}>Default Unit</Label>
                          <Select value={section.individualConfig.defaultUnit} onValueChange={(value) => updateIndividualConfig(section.id, 'defaultUnit', value)}>
                            <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                            <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                              {units.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className={labelCls}>Default Sub-questions</Label>
                          <Input type="number" value={section.individualConfig.defaultSubQuestionsCount} onChange={(e) => updateIndividualConfig(section.id, 'defaultSubQuestionsCount', parseInt(e.target.value) || 0)} min="0" max="5" className={inputCls} />
                        </div>
                      </div>

                      {section.questions.length === 0 ? (
                        <div className="text-center py-8 rounded-xl bg-white/40 dark:bg-gray-800/30 border border-dashed border-gray-200 dark:border-gray-700">
                          <Brain className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">Set counts above — questions appear here for configuration</p>
                        </div>
                      ) : (
                        <div className="bg-white/60 dark:bg-gray-800/40 rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-700">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            <strong className="text-gray-800 dark:text-white">{section.questions.length} questions</strong>
                            {" "}— {section.questions.filter(q => q.isAIGenerated).length} AI + {section.questions.filter(q => !q.isAIGenerated).length} Manual
                          </p>
                        </div>
                      )}

                      <div className="space-y-3">
                        {section.questions.map((question, questionIndex) => (
                          <div key={question.id} className={["border rounded-xl p-4", question.isAIGenerated ? "bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30" : "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700"].join(" ")}>
                            <div className="flex justify-between items-start mb-3">
                              <p className="text-xs font-semibold text-gray-800 dark:text-white flex items-center gap-1.5">
                                {question.isAIGenerated && <Wand2 className="w-3.5 h-3.5 text-blue-500" />}
                                Q{questionIndex + 1} {question.isAIGenerated ? '(AI)' : '(Manual)'}
                              </p>
                              <button onClick={() => removeQuestion(section.id, question.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            {!question.isAIGenerated && (
                              <div className="mb-3 space-y-1.5">
                                <Label className={labelCls}>Question Text</Label>
                                <Textarea value={question.text || ""} onChange={(e) => updateQuestion(section.id, question.id, 'text', e.target.value)} placeholder="Enter your question here..." className="min-h-[64px] text-xs resize-none border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                              </div>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="space-y-1.5">
                                <Label className={labelCls}>Marks</Label>
                                <Input type="number" value={question.marks} onChange={(e) => updateQuestion(section.id, question.id, 'marks', parseInt(e.target.value) || 1)} min="1" max="20" className={inputCls} />
                              </div>
                              <div className="space-y-1.5">
                                <Label className={labelCls}>Difficulty</Label>
                                <Select value={question.difficulty} onValueChange={(value) => updateQuestion(section.id, question.id, 'difficulty', value)}>
                                  <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1.5">
                                <Label className={labelCls}>Unit</Label>
                                <Select value={question.unit} onValueChange={(value) => updateQuestion(section.id, question.id, 'unit', value)}>
                                  <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                                  <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                                    {units.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1.5">
                                <Label className={labelCls}>Sub-Q</Label>
                                <Input type="number" value={question.subQuestionsCount} onChange={(e) => updateQuestion(section.id, question.id, 'subQuestionsCount', parseInt(e.target.value) || 0)} min="0" max="5" className={inputCls} />
                              </div>
                            </div>

                            {question.isAIGenerated && (
                              <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-3 py-2 border border-blue-100 dark:border-blue-900/30">
                                <p className="text-[11px] text-blue-700 dark:text-blue-400">
                                  AI will generate a <strong>{question.difficulty.toLowerCase()}</strong> question from <strong>{question.unit}</strong> worth <strong>{question.marks} marks</strong>{question.subQuestionsCount > 0 && ` with ${question.subQuestionsCount} sub-questions`}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate button */}
      <div className="animate-fade-in-up delay-300 flex justify-center pb-4">
        <Button onClick={handleGenerate} disabled={isGenerating} className="h-10 px-8 text-sm font-semibold bg-gradient-to-r from-[#3F3D56] to-[#007AFF] text-white hover:opacity-90">
          {isGenerating
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</>
            : <><FileText className="w-4 h-4 mr-2" />Generate Question Paper</>
          }
        </Button>
      </div>

      {/* Credits popup */}
      {popupMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setPopupMessage(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 w-[340px] text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300">{popupMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Generator;
