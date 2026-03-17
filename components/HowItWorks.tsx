import { Cable, Brain, Bell } from "lucide-react";

const steps = [
  {
    icon: Cable,
    title: "Connect",
    description:
      "Securely link any existing IP camera or VMS to our platform in minutes.",
  },
  {
    icon: Brain,
    title: "Analyze",
    description:
      "Our AI models process streams 24/7 to detect events, objects, and patterns.",
  },
  {
    icon: Bell,
    title: "Alert",
    description:
      "Receive instant, relevant alerts and access data-rich reports on any device.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-card/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Go from Video to Value in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              3 Simple Steps
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-glow animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-xl shadow-glow">
                {index + 1}
              </div>

              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-4 text-center">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-center leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
