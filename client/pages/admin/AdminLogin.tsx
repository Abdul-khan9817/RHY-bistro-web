import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { Lock, User, AlertCircle, ArrowLeft, KeyRound, CheckCircle2, ShieldCheck, Mail, RefreshCw, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoImg from "@assets/bacchus-logo.png";

type AuthMode = "login" | "forgot_request" | "forgot_verify";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useAdminAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  
  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password state
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [destination, setDestination] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in, redirect straight to dashboard
  if (isAuthenticated) {
    setLocation("/admin");
    return null;
  }

  // Handle standard login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Login failed. Please check your credentials.");
        return;
      }

      login(data.token, data.admin);
      setLocation("/admin");
    } catch {
      setError("Unable to connect to the authentication server. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Handle requesting OTP code
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!identifier.trim()) {
      setError("Please enter your username, email, or mobile phone.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to send verification code. Please try again.");
        return;
      }

      setDestination(data.destination || identifier);
      setSuccessMsg(data.message || `Verification code sent to ${data.destination || identifier}`);
      
      // Auto-fill OTP in dev environment if returned
      if (data.devOtp) {
        setOtp(data.devOtp);
      }

      setMode("forgot_verify");
    } catch {
      setError("Network error while requesting verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Handle verifying OTP and resetting password
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please ensure both fields are identical.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/verify-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Verification failed. Please check the code and try again.");
        return;
      }

      // Automatically log the user in on successful reset
      if (data.token && data.admin) {
        login(data.token, data.admin);
        setLocation("/admin");
      } else {
        setSuccessMsg("Password successfully reset! You can now log in.");
        setMode("login");
        setPassword("");
      }
    } catch {
      setError("Network error while verifying code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1811] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c9a84c_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Back to public website button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-white/70 hover:text-[#c9a84c] text-sm transition-colors py-2 px-3 rounded bg-white/5 border border-white/10"
        >
          <ArrowLeft size={16} />
          <span>Back to Restaurant Website</span>
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#0f2419]/90 border border-[#c9a84c]/30 rounded-xl shadow-2xl backdrop-blur-md p-8 md:p-10">
          
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-2 rounded-xl border border-[#c9a84c]/40 mb-4 bg-black/20 shadow-md">
              <img
                src={logoImg}
                alt="BACCHUS"
                className="h-20 w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-wide">
              BACCHUS
            </h1>
            <div className="h-0.5 w-12 bg-[#c9a84c] mx-auto my-2" />
            <p className="text-[#c9a84c] text-xs uppercase tracking-[0.25em] font-semibold">
              Portal
            </p>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-950/60 border border-emerald-500/50 flex items-start gap-3 text-emerald-200 text-sm animate-in fade-in duration-200">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-300">Success</p>
                <p className="text-xs text-emerald-200/90 mt-0.5">{successMsg}</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/60 border border-red-500/50 flex items-start gap-3 text-red-200 text-sm animate-in fade-in duration-200">
              <AlertCircle size={18} className="shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Access Notice</p>
                <p className="text-xs text-red-200/90 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* VIEW 1: Standard Login */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Admin Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c9a84c] z-10">
                    <User size={18} />
                  </div>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin or admin@rhybistro.ch"
                    required
                    autoFocus
                    className="pl-11 pr-4 bg-[#08140e] border-[#c9a84c]/30 text-white placeholder:text-white/30 focus-visible:ring-[#c9a84c] focus-visible:border-[#c9a84c] h-12 [color-scheme:dark] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSuccessMsg(null);
                      setIdentifier(username || "");
                      setMode("forgot_request");
                    }}
                    className="text-xs text-[#c9a84c] hover:underline hover:text-[#dfc268] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c9a84c] z-10">
                    <Lock size={18} />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="pl-11 pr-11 bg-[#08140e] border-[#c9a84c]/30 text-white placeholder:text-white/30 focus-visible:ring-[#c9a84c] focus-visible:border-[#c9a84c] h-12 [color-scheme:dark] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#c9a84c] hover:text-[#dfc268] transition-colors focus:outline-none z-10"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#c9a84c] hover:bg-[#b5953e] text-black font-semibold h-12 tracking-wider uppercase text-xs mt-2 transition-all shadow-lg shadow-[#c9a84c]/20"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  "Sign In to Dashboard"
                )}
              </Button>
            </form>
          )}

          {/* VIEW 2: Request Password Reset OTP */}
          {mode === "forgot_request" && (
            <form onSubmit={handleRequestOtp} className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center mb-2">
                <h2 className="text-lg font-serif font-semibold text-white">Reset Password</h2>
                <p className="text-xs text-white/60 mt-1">
                  Enter your registered username, email address, or mobile number to receive a 6-digit verification code.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Email, Mobile, or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c9a84c] z-10">
                    <Mail size={18} />
                  </div>
                  <Input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin@rhybistro.ch or +41 79 123 45 67"
                    required
                    autoFocus
                    className="pl-11 pr-4 bg-[#08140e] border-[#c9a84c]/30 text-white placeholder:text-white/30 focus-visible:ring-[#c9a84c] focus-visible:border-[#c9a84c] h-12 [color-scheme:dark] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#c9a84c] hover:bg-[#b5953e] text-black font-semibold h-12 tracking-wider uppercase text-xs transition-all shadow-lg shadow-[#c9a84c]/20"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Sending Code...</span>
                  </div>
                ) : (
                  "Send Verification Code"
                )}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMsg(null);
                    setMode("login");
                  }}
                  className="text-xs text-white/60 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW 3: Enter OTP & New Password */}
          {mode === "forgot_verify" && (
            <form onSubmit={handleVerifyAndReset} className="space-y-4 animate-in fade-in duration-200">
              <div className="text-center mb-2">
                <h2 className="text-lg font-serif font-semibold text-white">Verification & New Password</h2>
                <p className="text-xs text-white/60 mt-1">
                  Code sent to <span className="text-[#c9a84c] font-medium">{destination || "your account"}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                    6-Digit Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={loading}
                    className="text-[11px] text-[#c9a84c] hover:underline flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw size={11} />
                    <span>Resend Code</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c9a84c] z-10">
                    <KeyRound size={18} />
                  </div>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="123456"
                    required
                    autoFocus
                    className="pl-11 pr-4 text-center tracking-[0.4em] font-mono font-bold text-lg bg-[#08140e] border-[#c9a84c]/30 text-white placeholder:text-white/20 focus-visible:ring-[#c9a84c] focus-visible:border-[#c9a84c] h-12 [color-scheme:dark] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                  New Password (min 8 characters)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c9a84c] z-10">
                    <Lock size={18} />
                  </div>
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="pl-11 pr-11 bg-[#08140e] border-[#c9a84c]/30 text-white placeholder:text-white/30 focus-visible:ring-[#c9a84c] focus-visible:border-[#c9a84c] h-12 [color-scheme:dark] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#c9a84c] hover:text-[#dfc268] transition-colors focus:outline-none z-10"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c9a84c] z-10">
                    <ShieldCheck size={18} />
                  </div>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="pl-11 pr-11 bg-[#08140e] border-[#c9a84c]/30 text-white placeholder:text-white/30 focus-visible:ring-[#c9a84c] focus-visible:border-[#c9a84c] h-12 [color-scheme:dark] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#c9a84c] hover:text-[#dfc268] transition-colors focus:outline-none z-10"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#c9a84c] hover:bg-[#b5953e] text-black font-semibold h-12 tracking-wider uppercase text-xs mt-3 transition-all shadow-lg shadow-[#c9a84c]/20"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Verifying & Updating...</span>
                  </div>
                ) : (
                  "Verify & Reset Password"
                )}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMsg(null);
                    setMode("login");
                  }}
                  className="text-xs text-white/60 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Cancel and Return to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* Security footnote */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-[11px] text-white/40 leading-relaxed">
              Protected administrative portal. Equipped with anti-brute force rate limiting and encrypted one-time verification.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
