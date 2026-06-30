
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-card border-accent/20 group">
      <CardHeader className="relative">
        <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-elegant">
          <div className="text-white">
            {icon}
          </div>
        </div>
        <CardTitle className="text-xl font-semibold text-primary group-hover:text-accent transition-colors">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-text-secondary leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
