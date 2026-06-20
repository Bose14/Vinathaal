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

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const redirectAfterLogin = () => {
    const path = sessionStorage.getItem("redirectAfterLogin");
    if (path) {
      sessionStorage.removeItem("redirectAfterLogin");
      navigate(path);
    } else {
      navigate("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.auth.login(email, password);
      const user = data.user;
      login(
        { name: user.name ?? email.split("@")[0], email, api_token: user.api_token },
        data.token ?? data.user.api_token ?? "",
        user.api_token ?? ""
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
        data.token,
        data.token
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
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-primary hover:text-accent">
            <img src="/vinathaal_icon.png" alt="Vinathaal Icon" className="w-14 h-14 object-contain" />
            <span className="text-2xl font-semibold">Vinathaal</span>
          </Link>
          <Link to="/" className="absolute top-6 left-14 flex items-center text-primary hover:text-accent">
            <ArrowLeft className="w-6 h-6" />
            <span className="text-sm">Back to Home</span>
          </Link>
        </div>

        <Card className="bg-gradient-card border-accent/20 shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-sm text-text-secondary">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:text-accent font-medium">Sign up</Link>
              </p>
              <Link to="/forgot-password" className="text-sm text-primary hover:text-accent font-medium">
                Forgot your password?
              </Link>
            </div>

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
                <button className="flex items-center gap-3 bg-white border px-6 py-2 rounded-lg shadow hover:shadow-lg transition-shadow">
                  <FcGoogle size={24} />
                  <span className="text-gray-700">Sign in with Google</span>
                </button>
              </LoginSocialGoogle>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
