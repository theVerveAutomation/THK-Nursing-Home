"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import vapLogo from "@/assets/vap-logo.jpeg";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const handleDemoClick = () => {
    router.push("/BookDemo");
  };

  const handleLoginClick = () => {
    router.push("/Login");
  };

  if (!mounted) return null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src={vapLogo}
              alt="VAP Logo"
              className="h-16 w-auto rounded-md cursor-pointer"
              onClick={() => router.push("/")}
            />
          </div>

          {/* Center Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              Solutions
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              Industries
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              Pricing
            </button>
            <button
              onClick={() => router.push("/shop")}
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              Shop
            </button>
          </div>

          {/* Theme Toggle & CTA */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              onClick={handleLoginClick}
              variant="outline"
              className="hidden md:flex border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-semibold px-6"
            >
              Login
            </Button>
            <Button
              onClick={handleDemoClick}
              className="hidden md:flex bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-glow hover:shadow-glow-lg transition-all duration-300 font-semibold px-8"
            >
              Request Access
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 animate-fade-in bg-background/95 backdrop-blur-md rounded-lg">
            <div className="flex flex-col space-y-4 px-4">
              <button
                onClick={() => scrollToSection("features")}
                className="text-foreground/80 hover:text-primary transition-colors font-medium text-left"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-foreground/80 hover:text-primary transition-colors font-medium text-left"
              >
                Solutions
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-foreground/80 hover:text-primary transition-colors font-medium text-left"
              >
                Industries
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-foreground/80 hover:text-primary transition-colors font-medium text-left"
              >
                Pricing
              </button>
              <button
                onClick={() => router.push("/shop")}
                className="text-foreground/80 hover:text-primary transition-colors font-medium text-left"
              >
                Shop
              </button>
              <div className="pt-4 space-y-3 border-t border-border">
                <Button
                  onClick={handleLoginClick}
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-semibold"
                >
                  Login
                </Button>
                <Button
                  onClick={handleDemoClick}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-glow hover:shadow-glow-lg transition-all duration-300 font-semibold"
                >
                  Request Access
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
