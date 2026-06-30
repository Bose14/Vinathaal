
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Settings, Zap, Download, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  const steps = [
    {
  step: 1,
  title: "Upload or Choose",
  description: "Upload your syllabus image or select from our pre-built templates",
  icon: (
    <img
      src="upload.png"
      alt="Upload Icon"
      className="w-15 h-15 object-contain"
    />
  ),
  details: [
    "Upload syllabus PDF/image",
    "Or choose from 100+ templates",
    "Supports multiple formats"
  ],
  color: "from-blue-500 to-cyan-500"
},
    {
      step: 2,
      title: "Configure Settings",
      description: "Set your preferences for difficulty, marks, sections, and question types",
      icon: (
    <img
      src="settings.png"
      alt="Settings Icon"
      className="w-15 h-15 object-contain"
    />
  ),
      details: ["Set difficulty levels", "Configure mark distribution", "Choose question types"],
      color: "from-emerald-500 to-green-500"
    },
    {
      step: 3,
      title: "AI Generation",
      description: "Our advanced AI analyzes your input and generates relevant questions",
      icon: (
    <img
      src="brainstorm.png"
      alt="Brainstorm Icon"
      className="w-15 h-15 object-contain"
    />
  ),
      details: ["AI analyzes syllabus", "Generates quality questions", "Creates answer keys"],
      color: "from-orange-500 to-red-500"
    },
    {
      step: 4,
      title: "Download & Share",
      description: "Get your professional question paper in PDF, Word or share directly",
      icon: (
    <img
      src="download.png"
      alt="Download Icon"
      className="w-15 h-15 object-contain"
    />
  ),
      details: ["Download as PDF/Word", "Share via email/WhatsApp", "Print-ready format"],
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            How It <span className="bg-gradient-primary bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Create professional question papers in just 4 simple steps. Our AI-powered platform makes it easy and fast.
          </p>
        </div>

<div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-0 py-10">
  {steps.map((step, index) => (
    <div key={index} className="relative flex flex-col items-center text-center px-4 max-w-xs">
      
      {/* Icon with background blob */}
      <div className="relative w-16 h-16 mb-4">
        <div className={`absolute inset-0 rounded-md z-0 ${step.color}`} />
        <div className="relative z-10 flex items-center justify-center w-full h-full text-black text-2xl">
          {step.icon}
        </div>
      </div>

      {/* Title */}
      <p className="text-base font-semibold text-black mb-1">
        {`Step ${step.step}`}
      </p>

      {/* Subtitle */}
      <h4 className="text-sm mb-6 font-medium text-foreground ">
        {step.title}
      </h4>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-2">
        {step.description}
      </p>

      {/* Dashed Line */}
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute top-8 left-full mr-0 ml-0 w-28 border-t-2 border-dashed border-gray-400" />
      )}
    </div>
  ))}
</div>




        <div className="text-center mt-12">
          <Link to="/generator">
            <Button size="lg" className="px-8 py-3 bg-gradient-primary hover:opacity-90 shadow-elegant">
              <Zap className="w-5 h-5 mr-2" />
              Start Creating Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
