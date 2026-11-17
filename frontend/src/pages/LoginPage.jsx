import { cn } from "../lib/utils";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, AlertCircle } from "lucide-react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/shared/UI";
import { setSessionForRole } from "../lib/session";
import { toast } from "react-toastify";
import { API_BASE } from "../services/api";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Enforce university-only email access (@my.sliit.lk or @uni.edu)
  const isValidUniversityEmail = (email) => {
    const normalized = String(email || "").trim().toLowerCase();
    return (
      normalized.endsWith("@my.sliit.lk") ||
      normalized.endsWith("@uni.edu") ||
      normalized.endsWith("@sliit.lk")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidUniversityEmail(formData.email)) {
      setError(
        "Access restricted to verified university members (@my.sliit.lk or @uni.edu)."
      );
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Save token & user into role-specific keys to allow concurrent multi-role sessions
      setSessionForRole(data);

      // Handle Seller verification status
      if (data?.sellerRequest?.status === "pending") {
        toast.info("Your seller request is pending admin approval.", {
          autoClose: 2500,
        });
        navigate("/seller-request-status");
        return;
      }

      if (data?.sellerRequest?.status === "rejected") {
        const reason = String(
          data?.sellerRequest?.rejectionReason || ""
        ).trim();
        toast.error(
          reason
            ? `Seller request rejected: ${reason}`
            : "Your seller request was rejected by admin.",
          { autoClose: 4000 }
        );
        navigate("/seller-request-status");
        return;
      }

      if (
        data?.sellerRequest?.status === "approved" &&
        String(data.role).toLowerCase() === "seller"
      ) {
        toast.success("Seller request approved. Welcome to SellerHub!", {
          autoClose: 2000,
        });
      } else {
        toast.success(`Welcome back, ${data.name || "Student"}!`, {
          autoClose: 2000,
        });
      }

      // Role-based routing
      const userRole = String(data.role || "").toLowerCase();
      if (userRole === "admin" || userRole === "sportadmin") {
        navigate("/admin-dashboard");
      } else if (userRole === "seller") {
        navigate("/seller-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10">
      {/* Top Back to Home Navigation */}
      <div className="w-full max-w-md mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#0B1F3A] hover:text-[#F97316] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to UniSwap Home
        </Link>
      </div>

      <Card className="w-full max-w-md rounded-[2rem] shadow-2xl border border-slate-100 bg-white p-4">
        <CardHeader className="text-center">
          <div className="w-14 h-14 bg-[#0B1F3A] text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <ShieldCheck size={32} className="text-[#F97316]" />
          </div>
          <CardTitle className="text-3xl font-black text-[#0B1F3A]">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Sign in with your verified university email
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 font-medium">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">
                University Email Address
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="it23312708@my.sliit.lk"
                className="rounded-xl h-12 border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0B1F3A] transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-[#F97316] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                placeholder="••••••••"
                className="rounded-xl h-12 border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0B1F3A] transition-all"
              />
            </div>

            <Button
              disabled={loading}
              type="submit"
              className={cn(
                "w-full h-12 rounded-xl text-md font-bold bg-[#0B1F3A] hover:bg-[#F97316] text-white shadow-lg transition-all mt-2"
              )}
            >
              {loading ? "Authenticating..." : "Login to UniSwap"}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <p className="text-sm text-center text-slate-500 font-medium">
            Don't have a student account?{" "}
            <Link
              to="/register"
              className="text-[#F97316] font-bold hover:underline"
            >
              Sign Up
            </Link>
          </p>
          <p className="text-[11px] text-center text-slate-400">
            Student-only verified marketplace · `@my.sliit.lk` & `@uni.edu`
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default LoginPage;