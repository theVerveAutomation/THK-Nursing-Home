import vapLogo from "@/assets/vap-logo.jpeg";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Logo and Mission */}
          <div>
            <Image
              src={vapLogo}
              alt="VAP Logo"
              className="h-12 w-auto mb-4 rounded-lg"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Transforming video surveillance into actionable intelligence
              through AI-powered analytics.
            </p>
          </div>

          {/* Column 2: Product */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Solutions
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 VideoAnalyticsPro.com. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Powered by{" "}
            <a
              href="https://verveautomation.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Verve Automation
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
