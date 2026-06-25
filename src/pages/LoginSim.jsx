import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, Chrome } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";

export default function LoginSim() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleAuth = () => {
    const mockUser = {
      id: 'local-user-1',
      email: email,
      name: email.split('@')[0],
      role: 'student',
      display_name: email.split('@')[0],
      phone: '',
      status: 'student',
      profile_complete: false
    };
    
    localStorage.setItem('base44_access_token', 'mock-token');
    localStorage.setItem('base44_user', JSON.stringify(mockUser));
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px]"
      >
        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[32px] overflow-hidden">
          <CardContent className="p-8 sm:p-12 space-y-8">
            {/* Logo */}
            <div className="flex justify-center">
              <img src="/logo.png" alt="SkillSwap" className="w-20 h-20 object-contain" />
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-[32px] font-extrabold text-[#0F172A] tracking-tight">
                {isSignUp ? "Join SkillSwap Hub" : "Welcome to SkillSwap Hub"}
              </h1>
              <p className="text-[#64748B] font-medium text-lg">
                {isSignUp ? "Create your account" : "Sign in to continue"}
              </p>
            </div>

            <div className="space-y-6">
              <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl border-[#E2E8F0] hover:bg-slate-50 transition-all duration-300 flex items-center justify-center gap-3 text-[#0F172A] font-bold text-base"
                onClick={handleAuth}
              >
                <Chrome className="w-5 h-5 text-blue-500" />
                Continue with Google
              </Button>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E2E8F0]"></div>
                </div>
                <span className="relative px-4 bg-white text-[#94A3B8] text-xs font-bold uppercase tracking-widest">OR</span>
              </div>

              <div className="space-y-5">
                <div className="space-y-2.5">
                  <Label htmlFor="email" className="text-[#475569] font-bold text-sm ml-1">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-14 pl-12 rounded-2xl border-[#E2E8F0] focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-[#94A3B8] font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="password" className="text-[#475569] font-bold text-sm ml-1">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-14 pl-12 rounded-2xl border-[#E2E8F0] focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-[#94A3B8] font-medium"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleAuth} 
                className="w-full h-14 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-lg transition-all duration-300 shadow-xl shadow-slate-200"
              >
                {isSignUp ? "Sign Up" : "Sign in"}
              </Button>

              <div className="flex items-center justify-between px-1">
                <button className="text-sm font-bold text-[#64748B] hover:text-blue-600 transition-colors">
                  Forgot password?
                </button>
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm font-bold text-[#64748B] transition-colors"
                >
                  {isSignUp ? (
                    <>Already have an account? <span className="text-[#0F172A] hover:text-blue-600">Sign in</span></>
                  ) : (
                    <>Need an account? <span className="text-[#0F172A] hover:text-blue-600">Sign up</span></>
                  )}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}