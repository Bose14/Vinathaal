import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Plus, Trash2, FileText, Image, X } from "lucide-react";
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

  // Quiz form state
  const [quizTitle, setQuizTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [quizTopic, setQuizTopic] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState([5]);

  // Existing state for backward compatibility
  const [subjectName, setSubjectName] = useState("");
  const [university, setUniversity] = useState("");
  const [examDate, setExamDate] = useState("");
  const [duration, setDuration] = useState("");
  const [syllabusImage, setSyllabusImage] = useState<string | null>(null);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [sections, setSections] = useState<MCQSection[]>([
    {
      id: "1",
      name: "Section A",
      questions: 10,
      marksPerQuestion: 1,
      difficulty: "Easy",
      units: ["UNIT I"],
      customQuestions: []
    }
  ]);

  const handleSyllabusUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSyllabusImage(e.target?.result as string);
        toast.success("Syllabus uploaded successfully!");
      };
      reader.readAsDataURL(file);
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
    const newSection: MCQSection = {
      id: Date.now().toString(),
      name: `Section ${String.fromCharCode(65 + sections.length)}`,
      questions: 5,
      marksPerQuestion: 1,
      difficulty: "Easy",
      units: [],
      customQuestions: []
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    if (sections.length > 1) {
      setSections(sections.filter(section => section.id !== id));
    }
  };

  const updateSection = (id: string, field: keyof MCQSection, value: any) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const toggleUnit = (sectionId: string, unit: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        const units = section.units.includes(unit)
          ? section.units.filter(u => u !== unit)
          : [...section.units, unit];
        return { ...section, units };
      }
      return section;
    }));
  };

  const addCustomMCQ = (sectionId: string) => {
    const newQuestion: MCQQuestionConfig = {
      id: Date.now().toString(),
      text: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      marks: 1,
      difficulty: "Medium",
      unit: "UNIT I"
    };
    
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          customQuestions: [...section.customQuestions, newQuestion]
        };
      }
      return section;
    }));
  };

  const removeCustomMCQ = (sectionId: string, questionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          customQuestions: section.customQuestions.filter(q => q.id !== questionId)
        };
      }
      return section;
    }));
  };

  const updateCustomMCQ = (sectionId: string, questionId: string, field: keyof MCQQuestionConfig, value: any) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          customQuestions: section.customQuestions.map(q =>
            q.id === questionId ? { ...q, [field]: value } : q
          )
        };
      }
      return section;
    }));
  };

  const updateMCQOption = (sectionId: string, questionId: string, optionIndex: number, value: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          customQuestions: section.customQuestions.map(q => {
            if (q.id === questionId) {
              const newOptions = [...q.options];
              newOptions[optionIndex] = value;
              return { ...q, options: newOptions };
            }
            return q;
          })
        };
      }
      return section;
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const totalMarks = sections.reduce((total, section) => 
    total + (section.questions * section.marksPerQuestion), 0
  );

  const handleGenerate = () => {
    if (!quizTitle.trim() || quizTitle.length < 4) {
      toast.error("Please enter a quiz title with at least 4 characters");
      return;
    }

    if (!subject.trim()) {
      toast.error("Please select a subject");
      return;
    }
    
    const config = {
      subjectName: subject,
      university,
      examDate,
      duration,
      headerImage,
      sections: sections.map(section => ({
        ...section,
        questions: numberOfQuestions[0]
      })),
      totalMarks: numberOfQuestions[0],
      type: 'mcq',
      quizTitle,
      description,
      tags,
      quizTopic,
      additionalContext
    };
    sessionStorage.setItem('questionPaperConfig', JSON.stringify(config));
    
    console.log("Generating MCQ paper with:", config);
    toast.success("MCQ question paper generated successfully!");
    navigate("/result");
  };

  const subjects = [
    "General Knowledge",
    "Mathematics",
    "Science",
    "History",
    "Geography",
    "English",
    "Computer Science",
    "Physics",
    "Chemistry",
    "Biology"
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 text-slate-900 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <img
                src="/vinathaal%20logo.png"
                alt="Vinathaal Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold text-slate-900">
              Create a New Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quiz Title */}
            <div className="space-y-2">
              <Label htmlFor="quiz-title" className="text-sm font-medium text-slate-700">
                Quiz Title
              </Label>
              <Input
                id="quiz-title"
                placeholder="Enter quiz title (min 4 characters)"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subj) => (
                    <SelectItem key={subj} value={subj}>
                      {subj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                Description <span className="text-slate-500">(Optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Enter quiz description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Tags <span className="text-slate-500">(Optional)</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a tag and press Enter"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  onClick={addTag}
                  variant="outline"
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-slate-500 hover:text-slate-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Generate with AI Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-slate-900 mb-4">Generate with AI</h3>
              
              {/* Quiz Topic */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="quiz-topic" className="text-sm font-medium text-slate-700">
                  Quiz Topic
                </Label>
                <Input
                  id="quiz-topic"
                  placeholder="e.g. Solar System, World War II, JavaScript Basics"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">This will be used as the quiz title</p>
              </div>

              {/* Additional Context */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="additional-context" className="text-sm font-medium text-slate-700">
                  Additional Context <span className="text-slate-500">(Optional)</span>
                </Label>
                <Textarea
                  id="additional-context"
                  placeholder="Add specific details, difficulty level, or target audience"
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  rows={3}
                  className="w-full"
                />
              </div>

              {/* Number of Questions */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700">
                  Number of Questions: {numberOfQuestions[0]}
                </Label>
                <Slider
                  value={numberOfQuestions}
                  onValueChange={setNumberOfQuestions}
                  max={20}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-4">
              <Button 
                onClick={handleGenerate}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg"
                disabled={!quizTitle.trim() || quizTitle.length < 4 || !subject.trim()}
              >
                Generate Questions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MCQGenerator;
