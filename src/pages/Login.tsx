import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, FileText, Brain, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { LoginSocialGoogle } from "reactjs-social-login";
import { FcGoogle } from "react-icons/fc";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";

const features = [
  { icon: FileText, text: "AI-generated question papers in minutes", delay: "delay-200" },
  { icon: Brain,    text: "Smart MCQ & descriptive formats",          delay: "delay-300" },
  { icon: Download, text: "Export to PDF or Word instantly",          delay: "delay-400" },
];

const Login = () => {
  const navigate   = useNavigate();
  const { login }  = useAuth();
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [isLoading, setIsLoading]         = useState(false);

  const redirectAfterLogin = () => {
    const path = sessionStorage.getItem("redirectAfterLogin");
    if (path) { sessionStorage.removeItem("redirectAfterLogin"); navigate(path); }
    else navigate("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    setIsLoading(true);
    try {
      const data = await api.auth.login(email, password);
      login(
        { name: data.user?.name ?? email.split("@")[0], email, api_token: data.user?.api_token, role: data.user?.role },
        btoa(data.user?.api_token ?? ""),
        data.user?.api_token ?? ""
      );
      toast.success("Welcome back!");
      redirectAfterLogin();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (accessToken: string) => {
    setIsLoading(true);
    try {
      const data = await api.auth.googleLogin(accessToken);
      if (!data.success) throw new Error("Google login failed");
      login(
        { name: data.user.name, email: data.user.email, picture: data.user.picture, googleId: data.user.googleId },
        data.token, data.token
      );
      toast.success("Google Sign-In successful!");
      redirectAfterLogin();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Google Sign-In failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left branded panel (lg+) ── */}
      <div
        className="hidden lg:flex lg:w-[42%] relative flex-col items-center justify-center p-12 overflow-hidden select-none"
        style={{ background: "linear-gradient(145deg, #1a1a3e 0%, #3F3D56 45%, #007AFF 100%)" }}
      >
        {/* Animated blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-80 h-80 rounded-full bg-blue-400/20 -top-20 -right-20 animate-blob" />
          <div className="absolute w-72 h-72 rounded-full bg-purple-400/15 bottom-10 -left-16 animate-blob delay-2000" />
          <div className="absolute w-56 h-56 rounded-full bg-cyan-300/10 top-1/2 right-10 animate-blob delay-4000" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.2) 1px,transparent 1px)", backgroundSize: "40px 40px" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-xs animate-fade-in-up">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <img src="/vinathaal_icon.png" alt="Logo" className="w-12 h-12 object-contain animate-float" />
            <img src="/vinathaal-heading-white.png" alt="Vinathaal" className="h-9 object-contain" />
          </div>

          <div className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20">
            <Sparkles className="w-3 h-3 text-yellow-300" />
            <span className="text-xs text-white/80 font-medium">AI-Powered Education</span>
          </div>

          <h2 className="text-2xl font-bold text-white mt-4 mb-3 leading-tight">
            Create exam papers<br />at the speed of thought
          </h2>
          <p className="text-blue-200 text-sm mb-10 leading-relaxed">
            Upload your syllabus and let AI handle the rest — structured, professional papers in minutes.
          </p>

          <div className="space-y-3 text-left">
            {features.map(({ icon: Icon, text, delay }) => (
              <div
                key={text}
                className={`flex items-center gap-3 bg-white/8 border border-white/10 rounded-xl px-4 py-3 animate-fade-in-left ${delay}`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-blue-200" />
                </div>
                <span className="text-sm text-blue-100">{text}</span>
              </div>
            ))}
          </div>

          {/* Floating badge */}
          <div className="mt-10 bg-white/10 border border-white/20 rounded-2xl px-5 py-4 animate-fade-in-up delay-600">
            <p className="text-white text-sm font-semibold">Trusted by 1,000+ educators</p>
            <p className="text-blue-300 text-xs mt-0.5">across Indian universities & schools</p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white relative">
        {/* Back link (desktop) */}
        <Link
          to="/"
          className="hidden lg:flex absolute top-6 left-8 items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Mobile logo + back */}
        <div className="lg:hidden w-full max-w-sm mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <img src="/vinathaal_icon.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-gray-800">Vinathaal</span>
          </Link>
          <div className="w-14" />
        </div>

        {/* Form */}
        <div className="w-full max-w-sm animate-fade-in-up">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-400 mb-8">Sign in to continue to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-11 border-gray-200 focus-visible:ring-blue-500 transition-colors text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 border-gray-200 focus-visible:ring-blue-500 transition-colors text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-semibold mt-1 transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #3F3D56 0%, #007AFF 100%)" }}
            >
              {isLoading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">or continue with</span>
            </div>
          </div>

          {/* Google */}
          <div className="flex justify-center">
            <LoginSocialGoogle
              client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              onResolve={({ data }) => {
                const token = data?.access_token;
                if (!token) { toast.error("No Google token received"); return; }
                handleGoogleLogin(token);
              }}
              onReject={() => toast.error("Google Sign-In failed")}
            >
              <button
                type="button"
                className="flex items-center justify-center gap-3 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all h-11"
              >
                <FcGoogle size={20} />
                Sign in with Google
              </button>
            </LoginSocialGoogle>
          </div>

          {/* Sign-up link */}
          <p className="text-center text-sm text-gray-400 mt-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
