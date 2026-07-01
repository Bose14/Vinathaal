import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    step: 1,
    title: "Upload or Choose",
    description: "Upload your syllabus or pick from 100+ ready-made templates",
    icon: "upload.png",
    color: "bg-blue-500",
    details: ["PDF / image supported", "100+ templates", "Multiple formats"],
  },
  {
    step: 2,
    title: "Configure Settings",
    description: "Set difficulty, marks, section types and question count",
    icon: "settings.png",
    color: "bg-emerald-500",
    details: ["Difficulty levels", "Mark distribution", "Question types"],
  },
  {
    step: 3,
    title: "AI Generation",
    description: "AI analyzes your input and builds a structured question paper",
    icon: "brainstorm.png",
    color: "bg-orange-500",
    details: ["Syllabus analysis", "Quality questions", "Answer keys"],
  },
  {
    step: 4,
    title: "Download & Share",
    description: "Export as PDF or Word, or share directly via email or WhatsApp",
    icon: "download.png",
    color: "bg-purple-500",
    details: ["PDF / Word export", "Email & WhatsApp", "Print-ready"],
  },
];

const HowItWorks = () => {
  return (
    <section className="py-14 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            How It <span className="bg-gradient-primary bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Create a professional question paper in four simple steps.
          </p>
        </div>

        <div className="relative flex flex-col lg:flex-row items-start justify-center gap-6 lg:gap-0">
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center flex-1 px-3">
              {/* connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-[calc(50%+28px)] right-0 border-t-2 border-dashed border-gray-300 dark:border-gray-600" />
              )}

              {/* icon circle */}
              <div className={`relative z-10 w-10 h-10 rounded-xl ${step.color} flex items-center justify-center mb-3 shadow-sm`}>
                <img src={step.icon} alt={step.title} className="w-6 h-6 object-contain" />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Step {step.step}</span>
              <h4 className="text-sm font-semibold text-foreground mb-1">{step.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">{step.description}</p>

              <ul className="space-y-0.5">
                {step.details.map((d) => (
                  <li key={d} className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-primary inline-block" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/generator">
            <Button size="sm" className="px-6 bg-gradient-primary hover:opacity-90">
              <Zap className="w-4 h-4 mr-2" />
              Start Creating Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
