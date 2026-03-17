"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const demoFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must be less than 20 characters"),
  company: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(100, "Company name must be less than 100 characters"),
  industry: z.string().min(1, "Please select an industry"),
  cameraCount: z.string().min(1, "Please select camera count"),
  message: z
    .string()
    .trim()
    .max(1000, "Message must be less than 1000 characters")
    .optional(),
});

type DemoFormValues = z.infer<typeof demoFormSchema>;

const BookDemo = () => {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<DemoFormValues>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      industry: "",
      cameraCount: "",
      message: "",
    },
  });

  const onSubmit = async (data: DemoFormValues) => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Access Request Received!",
          description: "Our team will contact you within 24 hours.",
        });
        form.reset({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          company: "",
          industry: "",
          cameraCount: "",
          message: "",
        });
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-24 flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md w-full text-center border-primary shadow-glow">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-primary" />
              </div>
              <CardTitle className="text-3xl">Thank You!</CardTitle>
              <CardDescription className="text-base mt-4">
                Your access request has been received. Our team will reach out
                to you shortly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/")} className="w-full">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-6 py-24">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-8 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Request Access
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get started with VAP. Fill out the form below and our team will
              reach out to you shortly.
            </p>
          </div>

          <Card className="border-border shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle>Request Access</CardTitle>
              <CardDescription>
                Fill out the form below and we&apos;ll get back to you within 24
                hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Email *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@company.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+1 (555) 123-4567"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Company Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="manufacturing">
                                Manufacturing
                              </SelectItem>
                              <SelectItem value="healthcare">
                                Healthcare
                              </SelectItem>
                              <SelectItem value="education">
                                Education
                              </SelectItem>
                              <SelectItem value="hospitality">
                                Hospitality
                              </SelectItem>
                              <SelectItem value="transportation">
                                Transportation
                              </SelectItem>
                              <SelectItem value="government">
                                Government
                              </SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cameraCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Cameras *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1-10">1-10 cameras</SelectItem>
                              <SelectItem value="11-50">
                                11-50 cameras
                              </SelectItem>
                              <SelectItem value="51-100">
                                51-100 cameras
                              </SelectItem>
                              <SelectItem value="100+">100+ cameras</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Information (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your specific needs or use cases..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow hover:shadow-glow-lg transition-all duration-300"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting
                      ? "Submitting..."
                      : "Request Access"}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    By submitting this form, you agree to our privacy policy and
                    terms of service.
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <h3 className="font-semibold mb-2">Quick Response</h3>
              <p className="text-sm text-muted-foreground">
                We&apos;ll contact you within 24 hours
              </p>
            </div>
            <div className="p-6">
              <h3 className="font-semibold mb-2">Personalized Support</h3>
              <p className="text-sm text-muted-foreground">
                Tailored to your specific needs
              </p>
            </div>
            <div className="p-6">
              <h3 className="font-semibold mb-2">No Commitment</h3>
              <p className="text-sm text-muted-foreground">
                Get started with no obligations
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookDemo;
