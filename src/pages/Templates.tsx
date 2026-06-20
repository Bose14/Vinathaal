import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import Footer from "@/components/Footer";
import { allTemplates } from "../Templatedata/QuestionPapperTemplate/TemplatesPreview";
import { useAuth } from "@/context/AuthContext";

const Templates = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGeneratorClick = (path: string, templateId?: number) => {
    if (!isAuthenticated) {
      sessionStorage.setItem("redirectAfterLogin", path);
      navigate("/login");
      return;
    }
    navigate(path, { state: { templateID: templateId || 0 } });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 text-slate-900 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <img src="/vinathaal%20logo.png" alt="Vinathaal Logo" className="h-12 sm:h-16 w-auto object-contain" />
          </div>
        </div>
      </nav>

      <main className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2 sm:mb-4">All Question Paper Templates</h1>
            <p className="text-sm sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose from our comprehensive collection of question paper templates designed for various subjects and academic levels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {allTemplates.map((template) => (
              <Card key={template.id} className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-card border border-border rounded-xl">
                <CardHeader className="p-0">
                  <div className="relative w-full h-40 sm:h-48 rounded-t-lg overflow-hidden">
                    <img src={template.preview} alt={template.title} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{template.title}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-2">{template.description}</CardDescription>
                  <Button size="sm" className="w-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-all" onClick={() => handleGeneratorClick("/generator", template.id)}>
                    <FileText className="w-4 h-4 mr-2" /> Choose Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12 sm:mt-16">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-4">Don't see what you're looking for?</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                Our AI can generate custom question papers based on your specific requirements and syllabus.
              </p>
              <Button size="lg" className="px-6 py-2 sm:px-8 sm:py-3 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 text-sm sm:text-base" onClick={() => handleGeneratorClick("/generator")}>
                Create Custom Paper
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Templates;
