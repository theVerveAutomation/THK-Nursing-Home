import { Check } from "lucide-react";

interface FeatureCardProps {
  title: string;
  useCase: string;
  index: number;
}

const FeatureCard = ({ title, useCase, index }: FeatureCardProps) => {
  return (
    <div
      className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-glow transition-all duration-300 group animate-fade-in"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
          <Check className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed ml-9">{useCase}</p>
    </div>
  );
};

export default FeatureCard;
