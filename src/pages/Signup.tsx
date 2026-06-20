import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { LoginSocialGoogle } from "reactjs-social-login";
import { FcGoogle } from "react-icons/fc";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const redirectAfterSignup = () => {
    const path = sessionStorage.getItem("redirectAfterLogin") ?? sessionStorage.getItem("redirectAfterSignup");
    if (path) {
      sessionStorage.removeItem("redirectAfterLogin");
      sessionStorage.removeItem("redirectAfterSignup");
      navigate(path);
    } else {
      navigate("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.auth.signup(formData.name, formData.email, formData.password);
      login(
        { name: formData.name, email: formData.email, api_token: data.user?.api_token },
        data.user?.api_token ?? "",
        data.user?.api_token ?? ""
      );
      toast.success("Account created! Welcome to Vinathaal.");
      redirectAfterSignup();
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
        data.token,
        data.token
      );
      toast.success("Google Sign-Up successful!");
      redirectAfterSignup();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Google Sign-Up failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-primary hover:text-accent">
            <img src="/vinathaal_icon.png" alt="Vinathaal Icon" className="w-14 h-14 object-contain" />
            <span className="text-2xl font-semibold">Vinathaal</span>
          </Link>
          <Link to="/" className="absolute top-6 left-14 inline-flex items-center space-x-2 text-primary hover:text-accent">
            <ArrowLeft className="w-6 h-6" />
            <span className="text-sm">Back to Home</span>
          </Link>
        </div>

        <Card className="bg-gradient-card border-accent/20 shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">Create Account</CardTitle>
            <CardDescription>Join thousands of educators using AI to create better question papers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { id: "name", label: "Full Name", type: "text", placeholder: "Enter your full name" },
                { id: "email", label: "Email", type: "email", placeholder: "Enter your email" },
                { id: "password", label: "Password", type: "password", placeholder: "Create a password" },
                { id: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Confirm your password" },
              ].map(({ id, label, type, placeholder }) => (
                <div key={id} className="space-y-2">
                  <Label htmlFor={id}>{label}</Label>
                  <Input id={id} type={type} placeholder={placeholder} value={formData[id as keyof typeof formData]} onChange={handleChange} required />
                </div>
              ))}
              <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-text-secondary">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:text-accent font-medium">Sign in</Link>
              </p>
            </div>

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
                <button className="flex items-center gap-3 bg-white border px-6 py-2 rounded-lg shadow hover:shadow-lg transition-shadow">
                  <FcGoogle size={24} />
                  <span className="text-gray-700">Sign up with Google</span>
                </button>
              </LoginSocialGoogle>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
