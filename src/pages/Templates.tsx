import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { allTemplates } from "../Templatedata/QuestionPapperTemplate/TemplatesPreview";

const Templates = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Templates</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Choose a template and let AI build your question paper
        </p>
      </div>

      {/* Grid */}
      <div className="animate-fade-in-up delay-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {allTemplates.map((template) => (
          <Card
            key={template.id}
            className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden"
          >
            <CardHeader className="p-0">
              <div className="relative w-full h-40 overflow-hidden">
                <img
                  src={template.preview}
                  alt={template.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {template.title}
              </CardTitle>
              <CardDescription className="text-xs text-gray-400 dark:text-gray-500 mb-3 line-clamp-2">
                {template.description}
              </CardDescription>
              <Button
                size="sm"
                className="w-full h-8 text-xs bg-gradient-to-r from-[#3F3D56] to-[#007AFF] text-white hover:opacity-90 transition-all"
                onClick={() => navigate("/generator", { state: { templateID: template.id } })}
              >
                <FileText className="w-3.5 h-3.5 mr-1.5" /> Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA banner */}
      <div className="animate-fade-in-up delay-200 rounded-2xl bg-gradient-to-r from-[#3F3D56] to-[#007AFF] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-white">
          <p className="font-semibold">Don't see what you need?</p>
          <p className="text-sm text-blue-200 mt-0.5">Our AI can generate from any syllabus you upload.</p>
        </div>
        <Button
          className="bg-white text-[#3F3D56] hover:bg-gray-100 font-semibold shrink-0 text-sm"
          onClick={() => navigate("/generator")}
        >
          Create Custom Paper
        </Button>
      </div>
    </div>
  );
};

export default Templates;
