"use client";
import { Button } from "@/components/ui/button";
import { Eye, Play } from "lucide-react";
import { useEffect, useRef } from "react";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const scrollToFeatures = () => {
    const element = document.getElementById("features");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToCTA = () => {
    const element = document.getElementById("cta");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    videoRef.current?.load();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="/hero-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source
            src="/AI_Video_Analytics_Platform_Landing_Page.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-card/70 to-background/80" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-8">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              AI-Powered Fall & Tussle Detection
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Instant Safety{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Detection
            </span>
          </h1>

          <p className="text-xl md:text-2xl font-light mb-4 text-foreground/90">
            AI-Powered Fall & Tussle Detection for Immediate Response
          </p>

          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Transform your existing camera streams into a safety monitoring
            system. Detect falls and tussles instantly, enabling rapid response
            and ensuring the safety of your premises in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={scrollToCTA}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow hover:shadow-glow-lg transition-all duration-300 font-semibold px-8 py-6 text-lg"
            >
              Request Access
            </Button>
            <Button
              onClick={scrollToFeatures}
              size="lg"
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-300 font-semibold px-8 py-6 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              See Features
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
