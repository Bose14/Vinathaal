import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, FileKey } from "lucide-react";
import { toast } from "sonner";
import html2pdf from 'html2pdf.js';
// import { generateDocx } from "@/utils/pdfGenerator";
import { S3Upload } from "@/utils/S3Uploads";
import ShareDialog from "@/components/ShareDialog";
import EditableQuestionPaper from "@/components/EditableQuestionPaper";

interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionConfig {
  id: string;
  text?: string;
  marks: number;
  difficulty: string;
  unit: string;
  optionCount: number;
  isAIGenerated: boolean;
  options?: (string | MCQOption)[];
  correctOption?: string;
}

interface AutoGenConfig {
  questionCount: number;
  marksPerQuestion: number;
  difficulty: string;
  units: string[];
  optionCount: number;
}

interface IndividualConfig {
  aiQuestionCount: number;
  manualQuestionCount: number;
  defaultMarks: number;
  defaultDifficulty: string;
  defaultUnit: string;
  defaultOptionCount: number;
}

interface Section {
  id: string;
  name: string;
  isAutoGenerate: boolean;
  autoConfig?: AutoGenConfig;
  individualConfig?: IndividualConfig;
  questions: QuestionConfig[];
}

interface QuestionPaperConfig {
  quizTitle: string;
  subjectName: string;
  description: string;
  university: string;
  examDate: string;
  duration: string;
  headerImage: string | null;
  totalMarks: number;
  unitTopics: { [key: string]: string };
  sections: Section[];
  type: string;
}

interface AnswerItem {
  id: string;
  question: string;
  answer: string;
  marks: number;
  explanation?: string;
}

const MCQResultPage = () => {
  const navigate = useNavigate();
  const paperRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<QuestionPaperConfig | null>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [answerKey, setAnswerKey] = useState<AnswerItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isGeneratingAnswerKey, setIsGeneratingAnswerKey] = useState(false);
  const token = sessionStorage.getItem("token");
  const api_token = localStorage.getItem("apiToken");

  useEffect(() => {
    const savedConfig = sessionStorage.getItem("questionPaperConfig");
    const shouldUpload = sessionStorage.getItem("shouldUploadOnce");

    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        console.log("Parsed config:", parsed); // Debug
        const cleanedSections = parsed.sections?.map((section: Section) => ({
          ...section,
          questions: section.questions?.map(q => ({
            ...q,
            options: q.options?.slice(0, q.optionCount) || [], // Respect optionCount
          })) || [],
        })) || [];

        setConfig({
          ...parsed,
          sections: cleanedSections,
        });

        if (shouldUpload === "true") {
          const delay = setTimeout(() => {
            setUploading(true);
            S3Upload(savedConfig, token)
              .then(() => {
                toast.success("Uploaded to S3 successfully");
              })
              .catch((err) => {
                console.error("Error uploading to S3:", err);
                toast.error("Failed to upload to S3.");
              })
              .finally(() => {
                setUploading(false);
                sessionStorage.removeItem("shouldUploadOnce");
              });
          }, 1500);
          return () => clearTimeout(delay);
        }
      } catch (err) {
        console.error("Failed to parse config:", err);
        toast.error("Failed to load quiz configuration.");
        navigate("/mcqgenerator");
      }
    } else {
      toast.error("No quiz configuration found.");
      navigate("/mcqgenerator");
    }
  }, [navigate, token]);

  const handleDownloadPDF = () => {
    const element = paperRef.current;
    if (element) {
      toast.info("Preparing to download PDF...");
      html2pdf()
        .from(element)
        .set({
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: `${config?.subjectName.replace(/\s+/g, '_')}_Quiz.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        })
        .save()
        .then(() => {
          toast.success("PDF downloaded successfully!");
        })
        .catch((err) => {
          console.error("Error generating PDF:", err);
          toast.error("Failed to download PDF.");
        });
    }
  };

  const handleWordGenerate = () => {
    if (!config) {
      toast.error("Quiz configuration not found.");
      return;
    }
    const filename = `${config.subjectName.replace(/\s+/g, '_')}_Quiz.docx`;
    try {
      // generateDocx('quiz-content', filename);
      toast.success("Word document downloaded successfully!");
    } catch (err) {
      console.error("Error generating Word document:", err);
      toast.error("Failed to generate Word document.");
    }
  };

  const handleAnswerKeyGenerate = async () => {
    if (!config) {
      toast.error("Quiz configuration not found.");
      return;
    }

    setIsGeneratingAnswerKey(true);

    try {
      toast.info("Generating MCQ answer key with AI...");

      const questions = config.sections.flatMap((section) =>
        section.questions
          .filter((q) => q.text && q.options && q.options.length > 0)
          .map((q) => {
            let correctOption: string;
            let correctAnswer: string;
            const processedOptions = q.options.slice(0, q.optionCount).map((opt, index) => {
              let optText: string;
              if (typeof opt === 'string') {
                optText = opt;
              } else if (typeof opt === 'object' && opt.text) {
                optText = `${String.fromCharCode(65 + index)}: ${opt.text}`;
              } else {
                optText = `${String.fromCharCode(65 + index)}: Unknown option`;
              }
              return optText;
            });

            if (q.isAIGenerated && q.correctOption) {
              correctOption = q.correctOption;
              const correctOpt = processedOptions.find((opt) => opt.startsWith(correctOption));
              correctAnswer = correctOpt ? correctOpt.split(": ")[1].trim() : "Unknown";
            } else {
              const correctIndex = q.options?.findIndex((opt) => 
                typeof opt === 'object' && opt.isCorrect
              ) || 0;
              correctOption = String.fromCharCode(65 + correctIndex);
              const correctOpt = processedOptions[correctIndex];
              correctAnswer = correctOpt ? correctOpt.split(": ")[1].trim() : "No correct answer";
            }

            return {
              id: q.id,
              text: q.text,
              options: processedOptions,
              correctOption,
              correctAnswer,
              marks: q.marks,
              difficulty: q.difficulty,
              unit: q.unit || "N/A",
            };
          })
      );

      if (questions.length === 0) {
        toast.error("No valid MCQ questions found to generate answer key.");
        setIsGeneratingAnswerKey(false);
        return;
      }

      console.log("Sending questions for answer key:", questions);

      const response = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'}/generate-mcq-answer-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api_token}`,
        },
        body: JSON.stringify({
          questions,
          subjectName: config.subjectName,
          quizTitle: config.quizTitle,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      let answerKeyData;
      if (!data.answerKey || !Array.isArray(data.answerKey)) {
        answerKeyData = questions.map((q) => ({
          id: q.id,
          question: q.text,
          answer: `${q.correctOption}: ${q.correctAnswer}`,
          marks: q.marks,
          explanation: "Explanation is a premium feature or temporarily unavailable.",
        }));
        toast.warning("Using fallback answer key (AI service unavailable).");
      } else {
        answerKeyData = data.answerKey;
      }

      const formattedAnswerKey: AnswerItem[] = answerKeyData.map((item: any) => ({
        id: item.id || `${Date.now()}-${Math.random()}`,
        question: item.question,
        answer: item.answer,
        marks: item.marks,
        explanation: item.explanation || "No explanation available.",
      }));

      setAnswerKey(formattedAnswerKey);
      sessionStorage.setItem('generatedAnswerKey', JSON.stringify(formattedAnswerKey));
      toast.success("MCQ answer key generated successfully!");
      navigate('/mcq-answerkey');
    } catch (error) {
      console.error('Error generating MCQ answer key:', error);
      toast.error("Failed to generate answer key. Using fallback.");

      const questions = config.sections.flatMap((section) =>
        section.questions
          .filter((q) => q.text && q.options && q.options.length > 0)
          .map((q) => {
            let correctAnswer: string;
            let correctOption: string;
            const processedOptions = q.options.slice(0, q.optionCount).map((opt, index) => 
              typeof opt === 'string' ? opt : `${String.fromCharCode(65 + index)}: ${opt.text}`
            );
            if (q.isAIGenerated && q.correctOption) {
              const correctOpt = processedOptions.find((opt) => opt.startsWith(q.correctOption));
              correctOption = q.correctOption;
              correctAnswer = correctOpt ? correctOpt.split(": ")[1].trim() : "No correct answer";
            } else {
              const correctOpt = q.options?.find((opt) => 
                typeof opt === 'object' && opt.isCorrect
              );
              const correctIndex = q.options?.findIndex((opt) => 
                typeof opt === 'object' && opt.isCorrect
              ) || 0;
              correctOption = String.fromCharCode(65 + correctIndex);
              correctAnswer = (correctOpt as MCQOption)?.text || "No correct answer";
            }
            return { text: q.text, correctAnswer, marks: q.marks, correctOption };
          })
      );

      const fallbackAnswerKey: AnswerItem[] = questions.map((q, index) => ({
        id: `fallback-${index}-${Date.now()}`,
        question: q.text,
        answer: `${q.correctOption}: ${q.correctAnswer}`,
        marks: q.marks,
        explanation: "Explanation is a premium feature.",
      }));

      setAnswerKey(fallbackAnswerKey);
      sessionStorage.setItem('generatedAnswerKey', JSON.stringify(fallbackAnswerKey));
      navigate('/mcq-answerkey');
    } finally {
      setIsGeneratingAnswerKey(false);
    }
  };

  const handleQuestionsSave = (updatedConfig: QuestionPaperConfig | null | any) => {
    console.log("handleQuestionsSave called with updatedConfig:", updatedConfig);

    if (!updatedConfig) {
      console.error("handleQuestionsSave: Received null or undefined updatedConfig");
      toast.error("Failed to save question paper: Invalid configuration.");
      return;
    }

    if (!config) {
      console.error("handleQuestionsSave: Current config is null");
      toast.error("Failed to save question paper: No current configuration.");
      return;
    }

    let normalizedConfig: QuestionPaperConfig;
    try {
      normalizedConfig = {
        ...config,
        ...updatedConfig,
        sections: updatedConfig.sections?.map((section: any) => ({
          ...section,
          questions: section.questions?.map((q: any) => ({
            ...q,
            options: q.options?.slice(0, q.optionCount).map((opt: any) => ({
              id: opt.id || crypto.randomUUID(),
              text: opt.text || "",
              isCorrect: opt.isCorrect || false,
            })) || [],
          })) || [],
        })) || config.sections,
      };

      if (!normalizedConfig.quizTitle || !normalizedConfig.subjectName || !normalizedConfig.sections) {
        throw new Error("Invalid configuration: Missing required fields (quizTitle, subjectName, or sections).");
      }

      JSON.stringify(normalizedConfig);
      sessionStorage.setItem('questionPaperConfig', JSON.stringify(normalizedConfig));
      setConfig(normalizedConfig);
      toast.success("Question paper saved successfully!");
    } catch (err) {
      console.error("Error saving question paper:", err);
      toast.error("Failed to save question paper: " + (err instanceof Error ? err.message : "Unknown error."));
    }
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading quiz...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
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

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Generated {config.subjectName} MCQ
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleAnswerKeyGenerate}
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm"
              disabled={uploading || isGeneratingAnswerKey}
            >
              <FileKey className="w-4 h-4 mr-1 sm:mr-2" />
              {isGeneratingAnswerKey ? (
                <>
                  <span className="hidden sm:inline">Generating Answer Key...</span>
                  <span className="sm:hidden">Generating...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Generate Answer Key</span>
                  <span className="sm:hidden">Answer Key</span>
                </>
              )}
            </Button>
            <ShareDialog
              title={config.quizTitle}
              content="Check out this AI-generated MCQ quiz!"
            />
            <Button
              onClick={handleWordGenerate}
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm"
              disabled={uploading}
            >
              <Download className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Word</span>
              <span className="sm:hidden">DOC</span>
            </Button>
            <Button
              onClick={handleDownloadPDF}
              className="bg-slate-900 hover:bg-slate-800"
              size="sm"
              disabled={uploading}
            >
              <Download className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </div>

        <Card className="bg-white shadow-lg">
          <CardContent ref={paperRef} id="quiz-content" className="p-4 sm:p-8">
            <EditableQuestionPaper
              config={config}
              token={token}
              onSave={handleQuestionsSave}
            />
          </CardContent>
        </Card>

        {showAnswerKey && answerKey.length > 0 && (
          <Card className="bg-white shadow-lg mt-6">
            <CardContent className="p-4 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Answer Key</h2>
              <div className="space-y-4">
                {answerKey.map((item) => (
                  <div key={item.id} className="border p-4 rounded-md shadow-sm bg-gray-50">
                    <p className="font-semibold text-gray-800">{item.question}</p>
                    <p className="text-sm text-gray-600 mt-1">Answer: {item.answer}</p>
                    <p className="text-sm text-gray-600">Marks: {item.marks}</p>
                    {item.explanation && (
                      <p className="text-sm text-gray-500 mt-1">Explanation: {item.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MCQResultPage;