"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

const pricingTiers = [
  {
    name: "Starter",
    // price: "Custom",
    period: "/month",
    description:
      "Perfect for small businesses getting started with video analytics",
    features: [
      "Up to 10 camera streams",
      "Core security features",
      "Real-time alerts",
      "7-day video retention",
      "Email support",
      "Basic analytics dashboard",
    ],
    highlighted: false,
  },
  {
    name: "Professional",
    // price: "Custom",
    period: "/month",
    description:
      "Advanced analytics for growing retail and commercial operations",
    features: [
      "Up to 50 camera streams",
      "All security & detection features",
      "Advanced retail analytics",
      "30-day video retention",
      "Priority support (24/7)",
      "Custom integrations",
      "Heat mapping & dwell time",
      "API access",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    // price: "Custom",
    period: "",
    description:
      "Tailored solutions for large-scale deployments and multi-site operations",
    features: [
      "Unlimited camera streams",
      "All features included",
      "Custom AI model training",
      "Unlimited video retention",
      "Dedicated account manager",
      "On-premise deployment option",
      "SLA guarantee",
    ],
    highlighted: false,
  },
];

const Pricing = () => {
  const router = useRouter();

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Flexible pricing to match your security and analytics needs. All
            plans include free setup and training.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <Card
              key={tier.name}
              className={`relative flex flex-col ${
                tier.highlighted
                  ? "border-primary shadow-glow-lg scale-105"
                  : "border-border"
              } bg-card hover:shadow-card transition-all duration-300 animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                <CardDescription className="text-sm mb-4">
                  {tier.description}
                </CardDescription>
                {/* <div className="mt-4">
                  <span className="text-5xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground">{tier.period}</span>
                </div> */}
              </CardHeader>

              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/90">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => router.push("/book-demo")}
                  variant={tier.highlighted ? "default" : "outline"}
                  className={`w-full ${
                    tier.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                      : ""
                  }`}
                >
                  {/* {tier.price === "Custom" ? "Contact Sales" : "Get Started"} */}
                  Contact Sales
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 text-muted-foreground text-sm">
          <p>
            All plans include SSL encryption, GDPR compliance, and regular
            software updates.
          </p>
          <p className="mt-2">
            Need a custom solution?{" "}
            <button
              onClick={() => router.push("/book-demo")}
              className="text-primary hover:underline"
            >
              Contact our team
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
