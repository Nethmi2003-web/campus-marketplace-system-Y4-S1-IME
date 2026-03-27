import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  Shield,
  UserRound,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "react-toastify";
import { getBuyerSessionWithKey, writeSession } from "../lib/session";

function InfoPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border bg-card/60 backdrop-blur-xl shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="font-black text-primary leading-tight line-clamp-1">{value || "—"}</p>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, value, onChange }) {
  return (
    <label className="flex items-start justify-between gap-4 p-4 rounded-2xl border bg-card/40 hover:bg-card/60 transition-colors cursor-pointer">
      <div className="min-w-0">
        <p className="font-black text-primary text-sm">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <span
        className={cn(
          "relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0",
          value ? "bg-secondary" : "bg-muted"
        )}
      >
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
            value ? "translate-x-6" : "translate-x-1"
          )}
        />
      </span>
    </label>
  );
}

export function UserProfileTab({ user, onUserUpdated }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", faculty: "", bio: "" });
  const [saving, setSaving] = useState(false);

  const [prefs, setPrefs] = useState({
    orderUpdates: true,
    wishlistDrops: true,
    eventReminders: false
  });

  const [pw, setPw] = useState({ next: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const joinedText = useMemo(() => {
    if (!user?.createdAt) return "—";
    try {
      return new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return "—";
    }
  }, [user?.createdAt]);

  const roleLabel = String(user?.role || "user").toUpperCase();

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      faculty: user.faculty || "",
      bio: user.bio || ""
    });
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { session, key } = getBuyerSessionWithKey();
      if (!session.token) {
        toast.error("Please login to update your profile.");
        return;
      }

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: String(form.phone || "").trim() || undefined,
        bio: String(form.bio || "").trim() || undefined
      };

      await axios.put("/api/users/me", payload, {
        headers: { Authorization: `Bearer ${session.token}` }
      });

      const fresh = await axios.get("/api/users/me", {
        headers: { Authorization: `Bearer ${session.token}` }
      });

      onUserUpdated?.(fresh.data);

      // Keep the current tab's session in sync (token stays the same).
      writeSession(key, {
        ...session,
        firstName: fresh.data?.firstName ?? session.firstName,
        lastName: fresh.data?.lastName ?? session.lastName,
        universityEmail: fresh.data?.universityEmail ?? session.universityEmail,
        role: fresh.data?.role ?? session.role
      });

      toast.success("Profile updated", { autoClose: 1300 });
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!pw.next || pw.next.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (pw.next !== pw.confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setSavingPw(true);
      const { session } = getBuyerSessionWithKey();
      if (!session.token) {
        toast.error("Please login to update your password.");
        return;
      }

      await axios.put(
        "/api/users/me",
        { password: pw.next, confirmPassword: pw.confirm },
        { headers: { Authorization: `Bearer ${session.token}` } }
      );
      setPw({ next: "", confirm: "" });
      toast.success("Password updated", { autoClose: 1300 });
    } catch (err) {
      console.error("Password update error:", err);
      toast.error(err.response?.data?.message || "Failed to update password.");
    } finally {
      setSavingPw(false);
    }
  };

  if (!user) {
    return (
      <div className="h-[380px] flex flex-col items-center justify-center space-y-4 bg-muted/10 rounded-[3rem] border">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold">Loading profile...</p>
      </div>
    );
  }

  const initial = String(user?.firstName || "U").charAt(0).toUpperCase();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header (match other dashboard tab headers; no outer border) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black text-primary tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground font-medium text-lg">Manage your details and security preferences</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/50 backdrop-blur-md border border-white shadow-sm text-xs font-black text-primary">
            <span className="max-w-[16rem] truncate">{user.universityEmail || "—"}</span>
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/50 backdrop-blur-md border border-white shadow-sm text-xs font-black text-primary">
            {roleLabel}
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/50 backdrop-blur-md border border-white shadow-sm text-xs font-black text-primary">
            Joined {joinedText}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Edit */}
        <div className="xl:col-span-2 rounded-[2.5rem] border bg-card shadow-xl p-8">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <UserRound className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-primary tracking-tight">Profile Details</h2>
                <p className="text-sm text-muted-foreground font-medium">Update your contact info and account details</p>
              </div>
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">First Name</label>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border bg-white font-bold text-primary focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                  placeholder="Your first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last Name</label>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border bg-white font-bold text-primary focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                  placeholder="Your last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border bg-white font-bold text-primary focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                  placeholder="+94..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Faculty</label>
                <input
                  value={form.faculty}
                  disabled
                  className="w-full px-4 py-3 rounded-2xl border bg-muted/30 font-bold text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 rounded-2xl border bg-white font-medium text-primary focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all resize-none"
                placeholder="Write a short intro about you (mock data UI - optional)."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-7 py-3 rounded-2xl bg-secondary text-white font-black text-xs uppercase tracking-widest hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20 disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Side cards */}
        <div className="space-y-8">
          <div className="rounded-[2.5rem] border bg-card shadow-xl p-8">
            <h3 className="text-lg font-black text-primary tracking-tight mb-4">Quick Info</h3>
            <div className="space-y-3">
              <InfoPill icon={Mail} label="Email" value={user.universityEmail} />
              <InfoPill icon={Phone} label="Phone" value={user.phone} />
              <InfoPill icon={GraduationCap} label="Faculty" value={user.faculty} />
            </div>
          </div>

          <div className="rounded-[2.5rem] border bg-card shadow-xl p-8">
            <h3 className="text-lg font-black text-primary tracking-tight mb-4">Preferences (Mock)</h3>
            <div className="space-y-3">
              <ToggleRow
                label="Order Updates"
                description="Get status updates for orders and receipts."
                value={prefs.orderUpdates}
                onChange={(v) => setPrefs((p) => ({ ...p, orderUpdates: v }))}
              />
              <ToggleRow
                label="Wishlist Price Drops"
                description="Notify me when saved items drop in price."
                value={prefs.wishlistDrops}
                onChange={(v) => setPrefs((p) => ({ ...p, wishlistDrops: v }))}
              />
              <ToggleRow
                label="Event Reminders"
                description="Remind me before campus events start."
                value={prefs.eventReminders}
                onChange={(v) => setPrefs((p) => ({ ...p, eventReminders: v }))}
              />
            </div>
          </div>

          <div className="rounded-[2.5rem] border bg-card shadow-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-black text-primary tracking-tight">Security</h3>
                <p className="text-xs text-muted-foreground font-medium">Change your password</p>
              </div>
            </div>

            <form onSubmit={savePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={pw.next}
                    onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                    className="w-full pr-12 px-4 py-3 rounded-2xl border bg-white font-bold text-primary focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                    placeholder="******"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
                    title={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Confirm Password</label>
                <input
                  type={showPw ? "text" : "password"}
                  value={pw.confirm}
                  onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border bg-white font-bold text-primary focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                  placeholder="******"
                />
              </div>

              <button
                type="submit"
                disabled={savingPw}
                className="w-full px-7 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {savingPw ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                {savingPw ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
