import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { LoginSocialGoogle } from "reactjs-social-login";
import { FcGoogle } from "react-icons/fc";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";

const perks = [
  { text: "5 free credits on signup",      delay: "delay-200" },
  { text: "AI question paper generation",  delay: "delay-300" },
  { text: "PDF & Word export",             delay: "delay-400" },
  { text: "Answer key generation",         delay: "delay-500" },
];

const Signup = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPwd, setShowPwd]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));

  const redirectAfterSignup = () => {
    const path = sessionStorage.getItem("redirectAfterLogin") ?? sessionStorage.getItem("redirectAfterSignup");
    if (path) {
      sessionStorage.removeItem("redirectAfterLogin");
      sessionStorage.removeItem("redirectAfterSignup");
      navigate(path);
    } else {
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { toast.error("Passwords don't match"); return; }
    if (formData.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setIsLoading(true);
    try {
      await api.auth.signup(formData.name, formData.email, formData.password);
      toast.success("Account created! Sign in to get started.");
      navigate("/login");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async (idToken: string) => {
    setIsLoading(true);
    try {
      const data = await api.auth.googleSignup(idToken);
      if (!data.success) throw new Error("Google signup failed");
      login(
        { name: data.user.name, email: data.user.email, picture: data.user.picture, googleId: data.user.googleId },
        data.token, data.token
      );
      toast.success("Google Sign-Up successful!");
      redirectAfterSignup();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Google Sign-Up failed");
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = "h-11 border-gray-200 focus-visible:ring-blue-500 transition-colors text-sm";

  return (
    <div className="min-h-screen flex">
      {/* ── Left branded panel ── */}
      <div
        className="hidden lg:flex lg:w-[42%] relative flex-col items-center justify-center p-12 overflow-hidden select-none"
        style={{ background: "linear-gradient(145deg, #10B981 0%, #3F3D56 50%, #1a1a3e 100%)" }}
      >
        {/* Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-80 h-80 rounded-full bg-emerald-400/20 -top-20 -left-20 animate-blob" />
          <div className="absolute w-64 h-64 rounded-full bg-blue-400/15 bottom-10 -right-10 animate-blob delay-2000" />
          <div className="absolute w-48 h-48 rounded-full bg-teal-300/10 top-1/3 right-1/4 animate-blob delay-4000" />
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.2) 1px,transparent 1px)", backgroundSize: "40px 40px" }}
          />
        </div>

        <div className="relative z-10 text-center max-w-xs animate-fade-in-up">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <img src="/vinathaal_icon.png" alt="Logo" className="w-12 h-12 object-contain animate-float" />
            <img src="/vinathaal-heading-white.png" alt="Vinathaal" className="h-9 object-contain" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-4">
            <Sparkles className="w-3 h-3 text-yellow-300" />
            <span className="text-xs text-white/80 font-medium">Free to get started</span>
          </div>

          <h2 className="text-2xl font-bold text-white mt-2 mb-3 leading-tight">
            Join 1,000+ educators<br />saving hours every week
          </h2>
          <p className="text-emerald-100 text-sm mb-10 leading-relaxed">
            Vinathaal turns your syllabus into a complete question paper with one click.
          </p>

          {/* Perks */}
          <div className="space-y-2.5 text-left">
            {perks.map(({ text, delay }) => (
              <div
                key={text}
                className={`flex items-center gap-3 animate-fade-in-left ${delay}`}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-400/30 border border-emerald-300/40 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-200" />
                </div>
                <span className="text-sm text-emerald-100">{text}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-white/10 border border-white/20 rounded-2xl px-5 py-4 animate-fade-in-up delay-700">
            <p className="text-white text-sm font-semibold">No credit card required</p>
            <p className="text-emerald-300 text-xs mt-0.5">Start free, upgrade anytime</p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-white relative overflow-y-auto">
        {/* Back link (desktop) */}
        <Link to="/" className="hidden lg:flex absolute top-6 left-8 items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Mobile header */}
        <div className="lg:hidden w-full max-w-sm mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <img src="/vinathaal_icon.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-gray-800">Vinathaal</span>
          </Link>
          <div className="w-14" />
        </div>

        <div className="w-full max-w-sm animate-fade-in-up">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-400 mb-7">Start with 5 free credits — no card needed</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
              <Input id="name" type="text" placeholder="Your full name" value={formData.name} onChange={handleChange} required className={inputCls} />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required className={inputCls} />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`${inputCls} pr-10`}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`${inputCls} pr-10`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-semibold mt-1 transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #10B981 0%, #3F3D56 100%)" }}
            >
              {isLoading ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or sign up with</span></div>
          </div>

          {/* Google */}
          <div className="flex justify-center">
            <LoginSocialGoogle
              client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              onResolve={({ data }) => {
                const token = data?.id_token;
                if (!token) { toast.error("No Google token received"); return; }
                handleGoogleSignup(token);
              }}
              onReject={() => toast.error("Google Sign-Up failed")}
            >
              <button
                type="button"
                className="flex items-center justify-center gap-3 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all h-11"
                style={{ minWidth: "320px" }}
              >
                <FcGoogle size={20} />
                Sign up with Google
              </button>
            </LoginSocialGoogle>
          </div>

          <p className="text-center text-sm text-gray-400 mt-7">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
