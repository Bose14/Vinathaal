import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Trash2, FileText, Image, Settings, Wand2, Brain, Loader2, Building2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { S3Upload } from "@/utils/S3Uploads";
import Footer from "@/components/Footer";
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

  return (
    <div className="min-h-screen bg-gradient-hero">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 text-slate-900 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <img src="/vinathaal%20logo.png" alt="Vinathaal Logo" className="h-12 sm:h-16 w-auto object-contain" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">

        {/* ── Quick Setup ── */}
        {workspaces.length > 0 && (
          <Card className="mb-6 border-primary/20 bg-gradient-subtle">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm text-primary">Quick Setup</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Workspace</Label>
                  <Select
                    value={activeWorkspace?.id?.toString() ?? ''}
                    onValueChange={(v) => {
                      const ws = workspaces.find((w) => w.id === parseInt(v));
                      if (ws) applyWorkspace(ws);
                    }}
                  >
                    <SelectTrigger className="text-sm h-9">
                      <SelectValue placeholder="Select workspace..." />
                    </SelectTrigger>
                    <SelectContent>
                      {workspaces.map((ws) => (
                        <SelectItem key={ws.id} value={ws.id.toString()}>
                          {ws.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Exam Pattern</Label>
                  <Select
                    value=""
                    onValueChange={(v) => {
                      const p = patterns.find((pat) => pat.id === parseInt(v));
                      if (p) applyPattern(p);
                    }}
                  >
                    <SelectTrigger className="text-sm h-9">
                      <SelectValue placeholder={patterns.length === 0 ? 'No patterns saved' : 'Apply a pattern...'} />
                    </SelectTrigger>
                    <SelectContent>
                      {patterns.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {activeWorkspace && (
                <p className="text-xs text-muted-foreground mt-2">
                  Using <strong>{activeWorkspace.name}</strong>
                  {activeWorkspace.institution_name ? ` · ${activeWorkspace.institution_name}` : ''}
                  {patterns.length > 0 ? ` · ${patterns.length} pattern${patterns.length > 1 ? 's' : ''} available` : ''}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-card border-accent/20">
            <CardHeader className="text-center p-4 sm:p-6">
              <CardTitle className="flex items-center justify-center space-x-2 text-primary text-lg sm:text-xl">
                <FileText className="w-5 h-5" />
                <span>Upload Syllabus</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-text-secondary">Upload your course materials to be analyzed by AI.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 sm:p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-gradient-subtle">
                <input type="file" accept=".pdf,.doc,.docx,.txt,.jpeg,.jpg" onChange={handleSyllabusUpload} className="hidden" id="syllabus-upload" />
                <label htmlFor="syllabus-upload" className="cursor-pointer block">
                  {syllabusFile ? (
                    <div className="space-y-4">
                      <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-accent" />
                      <p className="text-success font-medium text-sm sm:text-base">Syllabus uploaded: {syllabusFile.name}</p>
                      <p className="text-xs sm:text-sm text-text-secondary">AI will generate questions based on your syllabus</p>
                    </div>
                  ) : (
                    <>
                      <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-accent mb-4" />
                      <p className="text-text-primary font-medium text-sm sm:text-base">Click to upload your syllabus</p>
                      <p className="text-xs sm:text-sm text-text-secondary mt-2">PDF, DOC, DOCX, TXT, JPG, JPEG up to 10MB</p>
                    </>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-accent/20">
            <CardHeader className="text-center p-4 sm:p-6">
              <CardTitle className="flex items-center justify-center space-x-2 text-primary text-lg sm:text-xl">
                <Image className="w-5 h-5" />
                <span>Upload Header (Optional)</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-text-secondary">Upload your institution logo or custom header.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 sm:p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-gradient-subtle">
                <input type="file" accept="image/*" onChange={handleHeaderImageUpload} className="hidden" id="header-upload" />
                <label htmlFor="header-upload" className="cursor-pointer block">
                  {headerImage ? (
                    <div className="space-y-4">
                      <img src={headerImage} alt="Header preview" className="max-h-24 sm:max-h-32 mx-auto rounded-lg shadow-md" />
                      <p className="text-success font-medium text-sm sm:text-base">Header image uploaded successfully!</p>
                    </div>
                  ) : (
                    <>
                      <Image className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-accent mb-4" />
                      <p className="text-text-primary font-medium text-sm sm:text-base">Click to upload your university/institution header</p>
                      <p className="text-xs sm:text-sm text-text-secondary mt-2">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Settings className="w-5 h-5" />
              <span>Configure Question Paper</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="university" className="text-sm">University/Institution</Label>
                <Input id="university" placeholder="e.g., Anna University" value={university} onChange={(e) => setUniversity(e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm">Subject Name</Label>
                <Input id="subject" placeholder="e.g., MATRICES AND CALCULUS" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} readOnly={isSubjectLocked} className={`text-sm ${isSubjectLocked ? "cursor-not-allowed bg-muted text-muted-foreground" : ""}`} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm">Exam Date</Label>
                <Input id="date" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm">Duration</Label>
                <Input id="duration" placeholder="e.g., 3 Hours" value={duration} onChange={(e) => setDuration(e.target.value)} className="text-sm" />
              </div>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <h3 className="text-base sm:text-lg font-semibold">Sections Configuration</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-success font-medium">Total Marks: {totalMarks}</span>
                  <Button onClick={addSection} size="sm" variant="outline" className="text-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {sections.map((section) => (
                  <div key={section.id} className="border border-border rounded-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-base">{section.name} Configuration</h4>
                      {sections.length > 1 && (
                        <Button onClick={() => removeSection(section.id)} size="sm" variant="outline" className="text-red-600 hover:text-red-700 p-2 h-auto">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <Label className="text-sm">Section Name</Label>
                        <Input value={section.name} onChange={(e) => updateSection(section.id, 'name', e.target.value)} placeholder="Section A" className="text-sm" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={section.isAutoGenerate} onCheckedChange={(checked) => updateSection(section.id, 'isAutoGenerate', checked)} />
                        <Label className="text-sm">{section.isAutoGenerate ? 'Bulk AI Generation' : 'Individual Question Config'}</Label>
                      </div>
                    </div>

                    {section.isAutoGenerate ? (
                      <div className="space-y-4 bg-gradient-hero p-4 rounded-lg border border-accent/20">
                        <h5 className="font-medium text-foreground flex items-center text-sm sm:text-base">
                          <Wand2 className="w-4 h-4 mr-2 text-accent" />
                          Bulk AI Generation Settings
                        </h5>
                        <p className="text-xs text-muted-foreground">Configure common settings for all questions in this section</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-xs">Questions</Label>
                            <Input type="number" value={section.autoConfig.questionCount} onChange={(e) => updateAutoConfig(section.id, 'questionCount', parseInt(e.target.value) || 1)} min="1" max="20" className="text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs">Marks/Q</Label>
                            <Input type="number" value={section.autoConfig.marksPerQuestion} onChange={(e) => updateAutoConfig(section.id, 'marksPerQuestion', parseInt(e.target.value) || 1)} min="1" max="20" className="text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs">Difficulty</Label>
                            <Select value={section.autoConfig.difficulty} onValueChange={(value) => updateAutoConfig(section.id, 'difficulty', value)}>
                              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Easy">Easy</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Sub-Q/Q</Label>
                            <Input type="number" value={section.autoConfig.subQuestionsCount} onChange={(e) => updateAutoConfig(section.id, 'subQuestionsCount', parseInt(e.target.value) || 0)} min="0" max="5" className="text-sm" />
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm">Units to Include</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {units.map((unit) => (
                              <Button key={unit} onClick={() => toggleAutoUnit(section.id, unit)} variant={section.autoConfig.units.includes(unit) ? "default" : "outline"} size="sm" className={`text-xs h-8 ${section.autoConfig.units.includes(unit) ? "bg-primary" : ""}`}>
                                {unit}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 bg-gradient-hero p-4 rounded-lg border border-accent/20">
                        <h5 className="font-medium text-foreground flex items-center text-sm sm:text-base">
                          <Brain className="w-4 h-4 mr-2 text-accent" />
                          Individual Question Configuration
                        </h5>
                        <p className="text-xs text-muted-foreground">Specify how many AI and manual questions you need, then configure each one individually</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-card/50 p-4 rounded-lg">
                          <div>
                            <Label className="text-xs">AI Questions</Label>
                            <Input type="number" value={section.individualConfig.aiQuestionCount} onChange={(e) => updateIndividualConfig(section.id, 'aiQuestionCount', parseInt(e.target.value) || 0)} min="0" max="20" placeholder="0" className="text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs">Manual Questions</Label>
                            <Input type="number" value={section.individualConfig.manualQuestionCount} onChange={(e) => updateIndividualConfig(section.id, 'manualQuestionCount', parseInt(e.target.value) || 0)} min="0" max="20" placeholder="0" className="text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs">Default Marks</Label>
                            <Input type="number" value={section.individualConfig.defaultMarks} onChange={(e) => updateIndividualConfig(section.id, 'defaultMarks', parseInt(e.target.value) || 1)} min="1" max="20" className="text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs">Default Difficulty</Label>
                            <Select value={section.individualConfig.defaultDifficulty} onValueChange={(value) => updateIndividualConfig(section.id, 'defaultDifficulty', value)}>
                              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Easy">Easy</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-card/50 p-4 rounded-lg">
                          <div>
                            <Label className="text-xs">Default Unit</Label>
                            <Select value={section.individualConfig.defaultUnit} onValueChange={(value) => updateIndividualConfig(section.id, 'defaultUnit', value)}>
                              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {units.map((unit) => (<SelectItem key={unit} value={unit}>{unit}</SelectItem>))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Default Sub-questions</Label>
                            <Input type="number" value={section.individualConfig.defaultSubQuestionsCount} onChange={(e) => updateIndividualConfig(section.id, 'defaultSubQuestionsCount', parseInt(e.target.value) || 0)} min="0" max="5" className="text-sm" />
                          </div>
                        </div>

                        {section.questions.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground bg-card/30 rounded-lg">
                            <Brain className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="mb-2 text-sm">Set AI and Manual question counts above</p>
                            <p className="text-xs">Questions will appear automatically for individual configuration</p>
                          </div>
                        ) : (
                          <div className="bg-card/30 p-3 rounded-lg">
                            <p className="text-sm text-accent">
                              <strong>Total Questions:</strong> {section.questions.length} ({section.questions.filter(q => q.isAIGenerated).length} AI + {section.questions.filter(q => !q.isAIGenerated).length} Manual)
                            </p>
                          </div>
                        )}

                        <div className="space-y-4">
                          {section.questions.map((question, questionIndex) => (
                            <div key={question.id} className={`border rounded p-4 ${question.isAIGenerated ? 'bg-gradient-hero border-accent/30' : 'bg-muted border-border'}`}>
                              <div className="flex justify-between items-start mb-3">
                                <h6 className="text-sm font-medium text-foreground flex items-center">
                                  {question.isAIGenerated && <Wand2 className="w-4 h-4 mr-1 text-accent" />}
                                  Question {questionIndex + 1} {question.isAIGenerated ? '(AI Generated)' : '(Manual)'}
                                </h6>
                                <Button onClick={() => removeQuestion(section.id, question.id)} size="sm" variant="ghost" className="text-red-600 hover:text-red-700 p-2 h-auto">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="space-y-4">
                                {!question.isAIGenerated && (
                                  <div>
                                    <Label className="text-xs">Question Text</Label>
                                    <Textarea value={question.text || ""} onChange={(e) => updateQuestion(section.id, question.id, 'text', e.target.value)} placeholder="Enter your question here..." className="min-h-[60px] sm:min-h-[80px] text-sm" />
                                  </div>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div>
                                    <Label className="text-xs">Marks</Label>
                                    <Input type="number" value={question.marks} onChange={(e) => updateQuestion(section.id, question.id, 'marks', parseInt(e.target.value) || 1)} min="1" max="20" className="text-sm" />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Difficulty</Label>
                                    <Select value={question.difficulty} onValueChange={(value) => updateQuestion(section.id, question.id, 'difficulty', value)}>
                                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Easy">Easy</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Hard">Hard</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-xs">Unit</Label>
                                    <Select value={question.unit} onValueChange={(value) => updateQuestion(section.id, question.id, 'unit', value)}>
                                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        {units.map((unit) => (<SelectItem key={unit} value={unit}>{unit}</SelectItem>))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-xs">Sub-questions</Label>
                                    <Input type="number" value={question.subQuestionsCount} onChange={(e) => updateQuestion(section.id, question.id, 'subQuestionsCount', parseInt(e.target.value) || 0)} min="0" max="5" className="text-sm" />
                                  </div>
                                </div>

                                {question.isAIGenerated && (
                                  <div className="bg-card p-3 rounded border border-accent/30 mt-3">
                                    <p className="text-xs text-accent">
                                      🎯 <strong>AI will generate:</strong> A {question.difficulty.toLowerCase()} level question from {question.unit} worth {question.marks} marks{question.subQuestionsCount > 0 && ` with ${question.subQuestionsCount} sub-questions`}
                                    </p>
                                  </div>
                                )}
                              </div>
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

        <div className="text-center mt-6">
          <Button onClick={handleGenerate} size="lg" className="px-8 py-3 bg-gradient-primary hover:opacity-90 text-white" disabled={isGenerating}>
            {isGenerating ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating...</>
            ) : (
              <><FileText className="w-5 h-5 mr-2" />Generate Question Paper</>
            )}
          </Button>
        </div>

        {popupMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setPopupMessage(null)} />
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-[340px] text-center animate-fade-in">
              <p className="text-gray-700 mb-2">{popupMessage}</p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Generator;
