import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MessageCircle, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";

const contactFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Please select a purpose"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const faqs = [
  { question: "How do I generate a question paper using AI?", answer: "Simply upload your syllabus or select from our templates, configure your requirements (number of questions, difficulty level, marks distribution), and our AI will generate a professional question paper within minutes." },
  { question: "What formats can I download my question papers in?", answer: "You can download your question papers in PDF, Word (DOCX), or share them directly via email, WhatsApp, or Google Drive. All formats maintain professional formatting with your institution's branding." },
  { question: "Can I customize the difficulty level and marks distribution?", answer: "Yes! You can set different difficulty levels (Easy, Medium, Hard) for each section, customize marks distribution, set time limits, and even configure unit-wise question allocation to match your syllabus perfectly." },
  { question: "Is there a limit on how many question papers I can generate?", answer: "Our free plan allows up to 5 question papers per month. Premium plans offer unlimited generation, advanced customization options, priority support, and additional features like bulk generation and team collaboration." },
  { question: "How accurate are the AI-generated questions?", answer: "Our AI is trained on extensive educational datasets and continuously improved. Questions are generated based on your specific syllabus and requirements. You can also review and edit any question before finalizing your paper." },
  { question: "Can I save and reuse question paper templates?", answer: "Absolutely! You can save your custom configurations as templates, reuse previous question papers, and even share templates with colleagues. This saves time when creating similar papers in the future." },
  { question: "Do you provide customer support for technical issues?", answer: "Yes, we offer comprehensive support through multiple channels - email, live chat, and our knowledge base. Premium users get priority support with faster response times and dedicated assistance." },
];

const Support = () => {
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      subject: "",
      message: "",
    },
  });

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const target = document.querySelector(location.hash);
        target?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [location]);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await api.support.send(data);
      await api.support.slackAlert(data).catch(() => {});
      toast({ title: "Message Sent Successfully!", description: "We'll get back to you within 24 hours." });
      form.reset();
    } catch {
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 text-slate-900 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <img src="/vinathaal%20logo.png" alt="Vinathaal Logo" className="h-16 w-auto object-contain" />
          </div>
        </div>
      </nav>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            How Can We <span className="bg-gradient-primary bg-clip-text text-transparent">Help You?</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-3">Find answers to common questions or get in touch with our support team</p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">Quick answers to common questions about Vinathaal</p>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-semibold text-foreground">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section id="form" className="py-16 bg-gradient-subtle">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Still Need Help?</h2>
            <p className="text-lg text-muted-foreground">Send us a message and we'll get back to you promptly</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-card border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center text-primary"><MessageCircle className="w-6 h-6 mr-2" />Get in Touch</CardTitle>
                <CardDescription>We're here to help you succeed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-accent" />
                  <div><p className="font-medium text-foreground">Email Support</p><p className="text-muted-foreground">support@vinathaal.com</p></div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-accent" />
                  <div><p className="font-medium text-foreground">Phone Support</p><p className="text-muted-foreground">+1 (555) 123-4567</p></div>
                </div>
                <div className="bg-accent/10 p-4 rounded-lg">
                  <p className="text-sm text-accent font-medium">Response Time</p>
                  <p className="text-sm text-muted-foreground">We typically respond within 24 hours</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-accent/20">
              <CardHeader>
                <CardTitle className="text-primary">Send us a Message</CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter your full name" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="Enter your email" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="subject" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purpose</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select a Purpose" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Technical Issues">Technical Issues</SelectItem>
                            <SelectItem value="Subscription Enquiry">Subscription Enquiry</SelectItem>
                            <SelectItem value="Others">Others</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem><FormLabel>Message</FormLabel><FormControl><Textarea placeholder="Tell us how we can help you..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90" disabled={isSubmitting}>
                      {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending Message...</> : "Send Message"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Support;
