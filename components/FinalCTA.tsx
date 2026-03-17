"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const FinalCTA = () => {
  const router = useRouter();

  return (
    <section
      id="cta"
      className="py-24 bg-gradient-to-br from-card to-background relative overflow-hidden"
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to See What You&apos;ve Been{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Missing?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Request access today and discover the power of VAP.
          </p>
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-lg hover:shadow-glow transition-all duration-300 font-semibold px-10 py-7 text-lg animate-glow-pulse"
            onClick={() => router.push("/BookDemo")}
          >
            Request Access
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
