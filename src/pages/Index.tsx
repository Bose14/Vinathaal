import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { FileText, Upload, Download, Zap, User, LogOut, Brain, Settings, Image, FileKey, Share, Clock, BookOpen, ChevronDown, ArrowRight, Coins, HelpCircle, Wallet, Menu, Calendar } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";
import DashboardStats from "@/components/DashboardStats";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Link as ScrollLink } from "react-scroll";
import { allTemplates } from "../Templatedata/QuestionPapperTemplate/TemplatesPreview";
import { useAuth } from "@/context/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { api } from "@/lib/apiClient";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { credits: userCredits } = useCredits();

  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [recentPapers, setRecentPapers] = useState<any[]>([]);

  const heroAnim  = useScrollAnimation(0.1);
  const templAnim = useScrollAnimation(0.1);

  const userInitial = user?.name?.trim() ? user.name.trim()[0].toUpperCase() : "U";

  useEffect(() => {
    if (isAuthenticated) { navigate("/dashboard", { replace: true }); }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user?.email) {
      const savedPic = localStorage.getItem(`profilePicture_${user.email}`);
      setProfilePicture(savedPic || null);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;
    api.papers.getHistory(user.email)
      .then((res) => {
        const mapped = (res.data ?? []).map((item: any, idx: number) => ({
          id: idx,
          subject: item.subjectName || "N/A",
          date: item.created_at,
          objectUrl: item.objectUrl,
        }));
        setRecentPapers(mapped);
      })
      .catch(() => {});
  }, [user?.email]);

  /* Suppress render while redirect is in flight */
  if (isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleGeneratorClick = (path: string, templateId?: number) => {
    if (!isAuthenticated) {
      sessionStorage.setItem("redirectAfterLogin", path);
      navigate("/login");
      return;
    }
    navigate(path, templateId ? { state: { templateID: templateId } } : undefined);
  };

  const features = [
    { icon: <Upload className="w-6 h-6" />, title: "Upload Syllabus", description: "Simply upload your syllabus image and let AI understand the content" },
    { icon: <Zap className="w-6 h-6" />, title: "AI Generation", description: "Our advanced AI generates relevant questions based on your requirements" },
    { icon: <Download className="w-6 h-6" />, title: "Export Options", description: "Download your question papers in PDF or Word format instantly" },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950">
      {/* Navigation */}
      <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="md:hidden">
                <Button variant="ghost" className="p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  <Menu className="w-6 h-6 text-foreground" />
                </Button>
              </div>
              <ScrollLink to="hero" smooth={true} duration={800} offset={-70}>
                <div className="flex items-center space-x-2 cursor-pointer">
                  <img src="/vinathaal_icon.png" alt="Vinathaal Icon" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                  <img src="/vinathaal-heading-black.png" alt="Vinathaal Heading" className="h-12 w-24 sm:h-16 sm:w-32 object-contain dark:invert" />
                </div>
              </ScrollLink>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              {!user ? (
                <>
                  <Link to="/pricing" className="relative font-medium text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-[4px] after:bg-gradient-primary after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:origin-center after:transition-transform">
                    Pricing
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="relative font-medium flex items-center space-x-1 text-muted-foreground text-sm hover:text-foreground transition-colors after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-[4px] after:bg-gradient-primary after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:origin-center after:transition-transform">
                      <span>Generator</span>
                      <ChevronDown className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-lg border border-border bg-popover dark:bg-gray-900">
                      <DropdownMenuItem asChild>
                        <Link to="/mcq-generator" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gradient-primary text-sm transition-all text-foreground"><Brain className="w-4 h-4" /> MCQ Generator</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/generator?mode=syllabus" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gradient-primary text-sm transition-all text-foreground"><Upload className="w-4 h-4" /> Generator using Syllabus</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/generator?mode=questionbank" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gradient-primary text-sm transition-all text-foreground"><FileText className="w-4 h-4" /> Generator using Question Bank</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Link to="/support" className="relative font-medium text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-[4px] after:bg-gradient-primary after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:origin-center after:transition-transform">
                    Support
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/mcq-generator" className="relative font-medium text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-[4px] after:bg-gradient-primary after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:origin-center after:transition-transform">
                    MCQ Generator
                  </Link>
                  <Link to="/generator?mode=syllabus" className="relative font-medium text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-[4px] after:bg-gradient-primary after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:origin-center after:transition-transform">
                    Syllabus Generator
                  </Link>
                  <Link to="/generator?mode=questionbank" className="relative font-medium text-muted-foreground text-sm transition-colors duration-200 hover:text-foreground after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-[4px] after:bg-gradient-primary after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:origin-center after:transition-transform">
                    Question Bank Generator
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <div className="absolute top-16 left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 md:hidden animate-fade-in">
                <div className="flex flex-col items-start px-4 py-4 space-y-4">
                  {!user ? (
                    <>
                      <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
                      <Link to="/mcq-generator" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}><Brain className="w-4 h-4" /> MCQ Generator</Link>
                      <Link to="/generator?mode=syllabus" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}><Upload className="w-4 h-4" /> Syllabus Generator</Link>
                      <Link to="/generator?mode=questionbank" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}><FileText className="w-4 h-4" /> Question Bank Generator</Link>
                      <Link to="/support" className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}>Support</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/mcq-generator" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}><Brain className="w-4 h-4" /> MCQ Generator</Link>
                      <Link to="/generator?mode=syllabus" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}><Upload className="w-4 h-4" /> Syllabus Generator</Link>
                      <Link to="/generator?mode=questionbank" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsMenuOpen(false)}><FileText className="w-4 h-4" /> Question Bank Generator</Link>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Profile Section */}
            <div className="flex items-center space-x-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden md:block leading-tight">
                    <p className="text-xs text-muted-foreground">Hi,</p>
                    <p className="text-sm font-semibold text-foreground">{user.name || user.email}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full p-[2px] bg-gradient-to-br from-gray-200 to-gray-500 hover:brightness-110 transition-all shadow-md cursor-pointer">
                        {profilePicture ? (
                          <img src={profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-primary text-white font-bold text-base sm:text-lg">
                            <span className="leading-none">{userInitial}</span>
                          </div>
                        )}
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 sm:w-[312px] mt-2 rounded-xl border border-border bg-popover dark:bg-gray-900 backdrop-blur-lg shadow-xl ring-1 ring-border right-0">
                      <div className="px-3 py-2 border-b border-border">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-full bg-yellow-500/10">
                            <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-foreground">Credits Remaining</p>
                            <p className="text-base sm:text-lg font-bold text-yellow-600">{userCredits}</p>
                          </div>
                        </div>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="group flex items-center gap-2 px-3 py-2 rounded-md w-full transition-all hover:bg-gradient-primary">
                          <div className="p-2 rounded-full bg-primary/10 group-hover:bg-white/20 transition"><User className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:text-white" /></div>
                          <span className="text-xs sm:text-sm font-medium text-foreground group-hover:text-white transition">My Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/pricing" className="group flex items-center gap-2 px-3 py-2 rounded-md w-full transition-all hover:bg-gradient-primary">
                          <div className="p-2 rounded-full bg-primary/10 group-hover:bg-white/20 transition"><Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:text-white" /></div>
                          <span className="text-xs sm:text-sm font-medium text-foreground group-hover:text-white transition">Get More Credits</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/support" className="group flex items-center gap-2 px-3 py-2 rounded-md w-full transition-all hover:bg-gradient-primary">
                          <div className="p-2 rounded-full bg-blue-500/10 group-hover:bg-white/20 transition"><HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 group-hover:text-white" /></div>
                          <span className="text-xs sm:text-sm font-medium text-foreground group-hover:text-white transition">Support</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="group flex items-center gap-2 px-3 py-2 rounded-md w-full cursor-pointer transition-all hover:bg-gradient-primary">
                        <div className="p-2 rounded-full bg-red-500/10 group-hover:bg-white/20 transition"><LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 group-hover:text-white" /></div>
                        <span className="text-xs sm:text-sm font-medium text-red-500 group-hover:text-white transition">Log Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <Link to="/login"><Button variant="outline" className="px-4 py-2 sm:px-6 sm:py-3 hover:bg-gradient-primary hover:text-white transition-all text-sm dark:border-gray-600 dark:text-gray-200">Login</Button></Link>
                  <Link to="/signup"><Button className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-primary hover:brightness-110 transition-all text-sm">Sign Up</Button></Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroAnim.ref as React.RefObject<HTMLElement>}
        id="hero"
        className="relative min-h-[70vh] py-12 sm:py-20 flex items-center overflow-hidden bg-background dark:bg-gray-950"
      >
        {/* Subtle decorative background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-100/60 dark:bg-blue-900/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-100/50 dark:bg-indigo-900/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 transition-all duration-700 ${heroAnim.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            Generate Question Papers with{" "}
            <span className="inline-block overflow-hidden whitespace-nowrap shimmer-text">AI Precision</span>
          </h1>
          <p className={`text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto transition-all duration-700 delay-200 ${heroAnim.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            Create professional question papers instantly with customizable sections, difficulty levels, and automated answer keys. Perfect for educators and institutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button size="lg" className="w-full sm:w-auto px-6 py-2 sm:px-8 sm:py-3 bg-gradient-primary hover:opacity-90 text-sm sm:text-base" onClick={() => handleGeneratorClick("/generator")}>
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Start Generating
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 py-2 sm:px-8 sm:py-3 border-primary text-primary hover:bg-gradient-primary hover:text-primary-foreground text-sm sm:text-base dark:border-gray-600 dark:text-gray-200" onClick={() => handleGeneratorClick("/mcq-generator")}>
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              MCQ Generator
            </Button>
          </div>
        </div>
      </section>

      {user && (
        <section className="py-12 sm:py-20 bg-background dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {recentPapers.length > 0 && (
              <>
                <div className="text-center mb-8 sm:mb-12">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Your Recently Created Papers</h2>
                  <p className="text-sm sm:text-lg text-muted-foreground">Continue editing or reviewing your previously generated question papers.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {recentPapers.map((paper) => (
                    <Card key={paper.id} className="relative group p-4 sm:p-6 border border-border rounded-2xl shadow-sm hover:shadow-xl transition-shadow bg-card dark:bg-gray-800/60 cursor-pointer">
                      <div className="mb-4">
                        <CardTitle className="text-lg sm:text-xl font-semibold text-primary group-hover:underline">{paper.subject}</CardTitle>
                      </div>
                      <div className="space-y-3 p-0 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground/80">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          Created: {new Date(paper.date).toLocaleDateString()}
                        </div>
                        <Button variant="outline" className="px-6 py-2 sm:px-8 sm:py-3 w-full hover:bg-gradient-primary transition-all text-xs sm:text-sm" onClick={() => window.open(paper.objectUrl, "_blank")}>
                          View Paper
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {!user && <DashboardStats />}
      {!user && <HowItWorks />}

      {/* Templates Section */}
      <section ref={templAnim.ref as React.RefObject<HTMLElement>} className="py-20 bg-secondary/30 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`text-center mb-12 transition-all duration-700 ${templAnim.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-3xl font-bold text-foreground mb-4">Popular Question Paper Templates</h2>
            <p className="text-xl text-muted-foreground">Select a template to begin creating your question paper</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
            {allTemplates.slice(0, 6).map((template) => (
              <div key={template.id} className="flex flex-col items-center">
                <div className="w-full max-w-[300px] group transition-transform duration-300 hover:scale-105">
                  <div className="relative w-full h-[340px] rounded-xl overflow-hidden border border-border transition-all duration-300 bg-card dark:bg-gray-800/60 backdrop-blur-md">
                    <img src={template.preview} alt={template.title} className="w-full h-full object-cover object-top rounded-xl" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-center font-medium text-foreground">{template.title}</p>
                <Button size="sm" className="mt-3 px-6 py-2 bg-gradient-primary hover:opacity-90" onClick={() => handleGeneratorClick("/generator", template.id)}>
                  Choose Template
                </Button>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 sm:mt-12">
            <Link to="/templates">
              <Button size="lg" variant="outline" className="px-8 py-3 border-primary text-primary hover:bg-gradient-primary hover:text-primary-foreground dark:border-gray-600 dark:text-gray-200">
                View All Templates
                <ArrowRight className="w-4 h-4 ml-2 inline" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {!user && (
        <section className="py-12 sm:py-20 bg-background dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">Everything You Need for Question Paper Creation</h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground">Powerful features designed for modern education</p>
            </div>
            {/* Mobile: Horizontal Scroll */}
            <div className="md:hidden flex overflow-x-auto gap-6 px-4 pb-4 snap-x snap-mandatory">
              {[
                { icon: <Zap />, title: "AI-Powered Generation", description: "Leverage AI to create relevant, structured questions tailored to your syllabus." },
                { icon: <Settings />, title: "Customizable Sections", description: "Configure sections with different difficulty levels, marks, and question counts." },
                { icon: <Download />, title: "Multiple Export Formats", description: "Download your question papers in PDF or Word format instantly." },
                { icon: <Image />, title: "Custom Headers", description: "Upload your institution's logo for branded question papers." },
                { icon: <FileKey />, title: "Answer Key Generation", description: "Auto-generate comprehensive answer keys with explanations." },
                { icon: <Brain />, title: "MCQ Generator", description: "Tool for creating multiple choice question papers with options." },
                { icon: <Share />, title: "Easy Sharing", description: "Share question papers via email, WhatsApp, or Google Drive." },
                { icon: <Clock />, title: "Time Configuration", description: "Set exam duration and dates with automatic formatting." },
                { icon: <BookOpen />, title: "Unit-wise Questions", description: "Organize questions by syllabus units for full coverage." },
              ].map((f) => (
                <div key={f.title} className="flex-shrink-0 w-80 snap-center">
                  <FeatureCard icon={f.icon} title={f.title} description={f.description} />
                </div>
              ))}
            </div>
            {/* Desktop: Grid View */}
            <div className="hidden md:grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard icon={<Zap />} title="AI-Powered Generation" description="Leverage AI to create relevant, structured questions tailored to your syllabus." />
              <FeatureCard icon={<Settings />} title="Customizable Sections" description="Configure sections with different difficulty levels, marks, and question counts." />
              <FeatureCard icon={<Download />} title="Multiple Export Formats" description="Download your question papers in PDF or Word format instantly." />
              <FeatureCard icon={<Image />} title="Custom Headers" description="Upload your institution's logo for branded question papers." />
              <FeatureCard icon={<FileKey />} title="Answer Key Generation" description="Auto-generate comprehensive answer keys with explanations." />
              <FeatureCard icon={<Brain />} title="MCQ Generator" description="Tool for creating multiple choice question papers with options." />
              <FeatureCard icon={<Share />} title="Easy Sharing" description="Share question papers via email, WhatsApp, or Google Drive." />
              <FeatureCard icon={<Clock />} title="Time Configuration" description="Set exam duration and dates with automatic formatting." />
              <FeatureCard icon={<BookOpen />} title="Unit-wise Questions" description="Organize questions by syllabus units for full coverage." />
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 md:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">Ready to Transform Your Question Paper Creation?</h2>
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-6 sm:mb-8 max-w-3xl mx-auto">
            Join thousands of educators who have already made the switch to AI-powered question generation.
          </p>
          <Button size="lg" className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary font-semibold rounded-full hover:bg-white/90 transition-all duration-300" onClick={() => handleGeneratorClick("/generator")}>
            Get Started for Free
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
