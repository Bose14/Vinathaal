import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="flex gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow group">
      <div className="w-9 h-9 shrink-0 rounded-lg bg-gradient-primary flex items-center justify-center text-white">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground mb-0.5 group-hover:text-primary transition-colors">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
