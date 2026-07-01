import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
import { Mail, MessageCircle, Loader2, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({
  fullName: z.string().min(2, "At least 2 characters"),
  email:    z.string().email("Valid email required"),
  subject:  z.string().min(1, "Please select a topic"),
  message:  z.string().min(10, "At least 10 characters"),
});
type FormData = z.infer<typeof schema>;

const faqs = [
  { q: "How do I generate a question paper?", a: "Upload your syllabus or pick a template, configure sections and marks, and our AI builds the paper in under a minute." },
  { q: "What export formats are supported?", a: "PDF and Word (DOCX). You can also share via email or WhatsApp directly from the result page." },
  { q: "Can I customize difficulty and marks?", a: "Yes — per section you can set Easy/Medium/Hard ratios, marks per question, and unit-wise allocation." },
  { q: "How many papers can I generate for free?", a: "5 papers per month on the Free plan. Pro and Institution plans are unlimited." },
  { q: "How accurate are the AI-generated questions?", a: "Questions are built from your specific syllabus. You can always review and edit before downloading." },
  { q: "Can I reuse templates?", a: "Yes — saved configurations appear in Templates. You can also share them with teammates." },
];

const Support = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: user?.name ?? "", email: user?.email ?? "", subject: "", message: "" },
  });

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => document.querySelector(location.hash)?.scrollIntoView({ behavior: "smooth" }), 300);
    }
  }, [location]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await api.support.send(data);
      await api.support.slackAlert(data).catch(() => {});
      toast.success("Message sent! We'll reply within 24 hours.");
      form.reset();
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full p-6 md:p-8 max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Support</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Find answers or get in touch with our team</p>
      </div>

      {/* FAQ */}
      <div className="animate-fade-in-up delay-100">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Frequently Asked Questions</h2>
        </div>
        <div className="bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}
                className="border-b border-gray-50 dark:border-gray-700/60 last:border-b-0 px-5">
                <AccordionTrigger className="text-left text-xs font-semibold text-gray-800 dark:text-gray-200 hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Contact */}
      <div id="form" className="animate-fade-in-up delay-200 grid md:grid-cols-2 gap-4">
        {/* Contact info */}
        <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800/60 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-gray-800 dark:text-white">Get in Touch</CardTitle>
                <CardDescription className="text-xs dark:text-gray-500">We're here to help you succeed</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Email Support</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">support@vinathaal.com</p>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl p-3">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Response Time</p>
              <p className="text-xs text-blue-600/70 dark:text-blue-500 mt-0.5">We typically reply within 24 hours</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact form */}
        <Card className="border-gray-100 dark:border-gray-700 dark:bg-gray-800/60 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-800 dark:text-white">Send a Message</CardTitle>
            <CardDescription className="text-xs dark:text-gray-500">Fill the form and we'll get back to you</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-gray-700 dark:text-gray-300">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field}
                        className="h-9 text-xs border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-gray-700 dark:text-gray-300">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field}
                        className="h-9 text-xs border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-gray-700 dark:text-gray-300">Topic</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-xs border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        <SelectItem value="Technical Issues">Technical Issues</SelectItem>
                        <SelectItem value="Subscription Enquiry">Subscription Enquiry</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-gray-700 dark:text-gray-300">Message</FormLabel>
                    <FormControl>
                      <Textarea placeholder="How can we help you?" className="min-h-[80px] text-xs resize-none border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />
                <Button type="submit" disabled={isSubmitting}
                  className="w-full h-9 text-xs bg-gradient-to-r from-[#3F3D56] to-[#007AFF] text-white hover:opacity-90">
                  {isSubmitting
                    ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Sending…</>
                    : "Send Message"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Support;
