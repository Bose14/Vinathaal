import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, SendHorizonal, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/apiClient";

const ForgotPassword = () => {
  const [email, setEmail]           = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.auth.forgotPassword(email);
      setIsSubmitted(true);
      toast.success("Reset link sent!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Back to home */}
      <Link
        to="/login"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-10">
          <img src="/vinathaal_icon.png" alt="Logo" className="w-10 h-10 object-contain" />
          <span className="font-bold text-xl text-gray-800">Vinathaal</span>
        </Link>

        {isSubmitted ? (
          /* ── Success state ── */
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-2">
              We sent a password reset link to
            </p>
            <p className="text-sm font-semibold text-gray-800 mb-6">{email}</p>
            <p className="text-xs text-gray-400 mb-6">
              Didn't receive it? Check your spam folder or try a different email address.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="w-full h-11 border-gray-200 text-sm"
              >
                Try a different email
              </Button>
              <Link to="/login">
                <Button variant="ghost" className="w-full h-11 text-sm text-gray-500">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* ── Form state ── */
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-fade-in-up">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
              <Mail className="w-7 h-7 text-blue-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot your password?</h1>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              No worries — enter your email and we'll send a secure reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-gray-200 focus-visible:ring-blue-500 transition-colors text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #3F3D56 0%, #007AFF 100%)" }}
              >
                {isLoading ? (
                  "Sending…"
                ) : (
                  <span className="flex items-center gap-2">
                    Send Reset Link
                    <SendHorizonal className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
