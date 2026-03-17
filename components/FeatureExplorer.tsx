"use client";
import { useState } from "react";
import { HeartPulse, Swords } from "lucide-react";
import FeatureCard from "./FeatureCard";
import { featureCategories } from "@/data/features";

const categoryIcons = {
  safety: HeartPulse,
  violence: Swords,
};

const FeatureExplorer = () => {
  const [activeCategory, setActiveCategory] = useState("safety");

  const activeCategoryData = featureCategories.find(
    (cat) => cat.id === activeCategory
  );

  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Advanced{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Safety Detection
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI-powered system detects falls and tussles in real-time,
            ensuring immediate response to safety incidents.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Left Sidebar - Category Navigation */}
          <div className="lg:w-1/4">
            <div className="lg:sticky lg:top-24 space-y-2">
              {featureCategories.map((category) => {
                const Icon =
                  categoryIcons[category.id as keyof typeof categoryIcons];
                const isActive = activeCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left px-6 py-4 rounded-lg transition-all duration-300 flex items-center gap-3 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "bg-card border border-border hover:border-primary/50 text-foreground hover:bg-card/80"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-semibold text-sm">
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="lg:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeCategoryData?.features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  title={feature.title}
                  useCase={feature.useCase}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureExplorer;
