import React from "react";
import axios from "axios";
import { Eye, EyeOff, Loader2, Save } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "../lib/utils";
import { getSellerSessionWithKey, writeSession } from "../lib/session";

function Field({ label, children, hint }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground font-medium">{hint}</p> : null}
    </div>
  );
}

export function SellerSettingsTab({ user: userProp, onUserUpdated = () => {} }) {
  const { session, key } = getSellerSessionWithKey();

  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [savingPw, setSavingPw] = React.useState(false);
  const [showPw, setShowPw] = React.useState(false);

  const [user, setUser] = React.useState(userProp || null);
  const [profile, setProfile] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
    bio: ""
  });

  const [pw, setPw] = React.useState({ next: "", confirm: "" });

  const canAuth = Boolean(session?.token);

  const seedFromUser = React.useCallback((u) => {
    if (!u) return;
    setProfile({
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      phone: u.phone || "",
      bio: u.bio || ""
    });
  }, []);

  React.useEffect(() => {
    if (userProp) {
      setUser(userProp);
      seedFromUser(userProp);
    }
  }, [seedFromUser, userProp]);

  const fetchMe = React.useCallback(async () => {
    try {
      if (!canAuth) return;
      setLoading(true);
      const res = await axios.get("/api/users/me", {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      setUser(res.data);
      seedFromUser(res.data);
      onUserUpdated?.(res.data);
    } catch (err) {
      console.error("Seller settings fetch me error:", err);
      toast.error(err.response?.data?.message || "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, [canAuth, onUserUpdated, seedFromUser, session.token]);

  React.useEffect(() => {
    if (!userProp) fetchMe();
  }, [fetchMe, userProp]);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      if (!canAuth) {
        toast.info("Please log in as a seller to update settings.");
        return;
      }
      if (!profile.firstName.trim() || !profile.lastName.trim()) {
        toast.warn("Please enter your first and last name.");
        return;
      }

      setSaving(true);
      await axios.put(
        "/api/users/me",
        {
          firstName: profile.firstName.trim(),
          lastName: profile.lastName.trim(),
          phone: profile.phone?.trim(),
          bio: profile.bio
        },
        { headers: { Authorization: `Bearer ${session.token}` } }
      );

      const fresh = await axios.get("/api/users/me", {
        headers: { Authorization: `Bearer ${session.token}` }
      });

      setUser(fresh.data);
      seedFromUser(fresh.data);
      onUserUpdated?.(fresh.data);

      writeSession(key, {
        ...session,
        firstName: fresh.data?.firstName ?? session.firstName,
        lastName: fresh.data?.lastName ?? session.lastName,
        universityEmail: fresh.data?.universityEmail ?? session.universityEmail,
        role: fresh.data?.role ?? session.role
      });

      toast.success("Settings updated", { autoClose: 1200 });
    } catch (err) {
      console.error("Seller settings update error:", err);
      toast.error(err.response?.data?.message || "Failed to update settings.");
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
      if (!canAuth) {
        toast.info("Please log in as a seller to update password.");
        return;
      }

      setSavingPw(true);
      await axios.put(
        "/api/users/me",
        { password: pw.next, confirmPassword: pw.confirm },
        { headers: { Authorization: `Bearer ${session.token}` } }
      );

      setPw({ next: "", confirm: "" });
      toast.success("Password updated", { autoClose: 1200 });
    } catch (err) {
      console.error("Seller password update error:", err);
      toast.error(err.response?.data?.message || "Failed to update password.");
    } finally {
      setSavingPw(false);
    }
  };

  const email = user?.universityEmail || session?.universityEmail || "—";
  const faculty = user?.faculty || "—";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-primary tracking-tight">Store Settings</h1>
          <p className="text-muted-foreground font-medium text-lg">Update your seller profile and security</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/50 backdrop-blur-md border border-white shadow-sm text-xs font-black text-primary">
            <span className="max-w-[16rem] truncate">{email}</span>
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/50 backdrop-blur-md border border-white shadow-sm text-xs font-black text-primary">
            Faculty: {faculty}
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/50 backdrop-blur-md border border-white shadow-sm text-xs font-black text-primary">
            Role: Seller
          </span>
        </div>
      </div>

      {loading ? (
        <div className="h-[320px] flex flex-col items-center justify-center space-y-4 rounded-3xl border bg-card shadow-xl">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-bold">Loading settings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Profile */}
          <div className="xl:col-span-2 space-y-8">
            <form onSubmit={saveProfile} className="rounded-3xl border bg-card shadow-xl overflow-hidden">
              <div className="p-6 border-b bg-muted/10 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-primary tracking-tight">Seller Profile</h2>
                  <p className="text-sm text-muted-foreground font-medium mt-1">Public details used on your listings</p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchMe()}
                  className="px-4 py-2 rounded-xl bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/10"
                >
                  Refresh
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="First Name">
                    <input
                      value={profile.firstName}
                      onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                      className="w-full h-12 px-4 rounded-2xl border bg-white font-bold text-primary outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                      placeholder="First name"
                      required
                    />
                  </Field>
                  <Field label="Last Name">
                    <input
                      value={profile.lastName}
                      onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                      className="w-full h-12 px-4 rounded-2xl border bg-white font-bold text-primary outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                      placeholder="Last name"
                      required
                    />
                  </Field>
                  <Field label="Phone (Optional)" hint="Used for buyer contact (if you share it).">
                    <input
                      value={profile.phone}
                      onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full h-12 px-4 rounded-2xl border bg-white font-bold text-primary outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                      placeholder="07X XXX XXXX"
                    />
                  </Field>
                  <Field label="Email" hint="Email is your login ID and cannot be changed here.">
                    <input
                      value={email}
                      disabled
                      className="w-full h-12 px-4 rounded-2xl border bg-muted/20 font-black text-muted-foreground outline-none"
                    />
                  </Field>
                </div>

                <Field label="Store Bio" hint="Short description shown to buyers (max 280 chars).">
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                    rows={5}
                    maxLength={280}
                    className="w-full px-4 py-3 rounded-2xl border bg-white font-medium text-primary outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all resize-none"
                    placeholder="e.g. Selling carefully used textbooks and lab gear..."
                  />
                </Field>

                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className={cn(
                      "px-7 py-3 rounded-2xl bg-secondary text-white font-black text-xs uppercase tracking-widest hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20 inline-flex items-center justify-center gap-2",
                      saving ? "opacity-70" : ""
                    )}
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Security */}
          <div className="space-y-8">
            <form onSubmit={savePassword} className="rounded-3xl border bg-card shadow-xl overflow-hidden">
              <div className="p-6 border-b bg-muted/10">
                <h2 className="text-xl font-black text-primary tracking-tight">Security</h2>
                <p className="text-sm text-muted-foreground font-medium mt-1">Change your password</p>
              </div>

              <div className="p-6 space-y-5">
                <Field label="New Password">
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={pw.next}
                      onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                      className="w-full h-12 px-4 pr-11 rounded-2xl border bg-white font-bold text-primary outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                      placeholder="Minimum 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                      title={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>

                <Field label="Confirm Password">
                  <input
                    type={showPw ? "text" : "password"}
                    value={pw.confirm}
                    onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                    className="w-full h-12 px-4 rounded-2xl border bg-white font-bold text-primary outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                    placeholder="Re-enter password"
                  />
                </Field>

                <button
                  type="submit"
                  disabled={savingPw}
                  className={cn(
                    "w-full px-7 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 inline-flex items-center justify-center gap-2",
                    savingPw ? "opacity-70" : ""
                  )}
                >
                  {savingPw ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Update Password
                </button>

                <p className="text-xs text-muted-foreground font-medium">
                  Tip: Use a strong password you haven&apos;t used before.
                </p>
              </div>
            </form>

            <div className="rounded-3xl border bg-card shadow-xl overflow-hidden">
              <div className="p-6 border-b bg-muted/10">
                <h2 className="text-xl font-black text-primary tracking-tight">Notifications</h2>
                <p className="text-sm text-muted-foreground font-medium mt-1">UI-only preferences</p>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { key: "lowStock", title: "Low stock alerts", desc: "Get notified when stock is running low" },
                  { key: "buyerReports", title: "Buyer report alerts", desc: "Notify when a buyer submits a payment report" },
                  { key: "weekly", title: "Weekly summary", desc: "Summary of sales and listings performance" }
                ].map((it) => (
                  <div key={it.key} className="flex items-start justify-between gap-3 rounded-2xl border bg-white p-4">
                    <div className="min-w-0">
                      <p className="font-black text-primary">{it.title}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-1">{it.desc}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-muted/20 text-muted-foreground">
                      ui
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

