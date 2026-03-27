import React from "react";
import axios from "axios";
import { cn } from "../lib/utils";
import { CheckCircle, Loader2, Percent, Save, Settings2, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { getAdminSessionWithKey } from "../lib/session";

function SettingCard({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="rounded-3xl border bg-card shadow-xl p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon size={22} />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-black text-primary tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground font-medium mt-1">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function AdminSettingsTab({ onOpenPricing = () => {} }) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [platformFee, setPlatformFee] = React.useState(5);
  const [feeDraft, setFeeDraft] = React.useState("5");
  const [localSettings, setLocalSettings] = React.useState({
    requireSellerApproval: true,
    strictSessionIsolation: true,
    enableEventModeration: false
  });

  const fetchSettings = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/settings");
      if (res.data?.success && res.data?.data) {
        const fee = Number(res.data.data.platformFee ?? 5);
        setPlatformFee(Number.isFinite(fee) ? fee : 5);
        setFeeDraft(String(Number.isFinite(fee) ? fee : 5));
      }
    } catch (err) {
      console.error("Settings fetch error:", err);
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const savePlatformFee = async () => {
    const nextFee = Number(feeDraft);
    if (!Number.isFinite(nextFee) || nextFee < 0 || nextFee > 100) {
      toast.warn("Platform fee must be between 0 and 100.");
      return;
    }

    try {
      setSaving(true);
      const { session: userInfo } = getAdminSessionWithKey();
      if (!userInfo.token) {
        toast.info("Please log in as admin.");
        return;
      }

      const res = await axios.put(
        "/api/settings",
        { platformFee: nextFee },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      if (res.data?.success) {
        setPlatformFee(nextFee);
        toast.success("Platform fee updated.", {
          icon: <CheckCircle className="text-emerald-500" size={18} />,
          style: { background: "#ecfdf3", color: "#166534", fontWeight: 700 },
          progressStyle: { background: "#22c55e" }
        });
      } else {
        toast.error(res.data?.message || "Failed to update platform fee.");
      }
    } catch (err) {
      console.error("Settings save error:", err);
      toast.error(err.response?.data?.message || "Failed to update platform fee.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[420px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold">Loading platform settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground font-medium">Configure core marketplace behaviour</p>
        </div>
        <button
          type="button"
          onClick={fetchSettings}
          className="px-4 py-2 rounded-xl bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/10 w-fit"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <SettingCard
            icon={Percent}
            title="Payments"
            subtitle="Marketplace fee configuration (applies to all online orders)"
          >
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Platform Fee (%)
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={feeDraft}
                    onChange={(e) => setFeeDraft(e.target.value)}
                    className="w-28 h-12 px-4 rounded-2xl border bg-white font-black text-primary focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all text-lg"
                  />
                  <div className="text-sm text-muted-foreground font-bold">
                    Current: <span className="text-primary font-black">{platformFee}%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={savePlatformFee}
                  className="px-6 h-12 rounded-2xl bg-secondary text-white font-black text-[10px] uppercase tracking-widest hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save
                </button>
                <button
                  type="button"
                  onClick={onOpenPricing}
                  className="px-6 h-12 rounded-2xl border bg-card font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/20 transition-colors"
                  title="Open Pricing Management"
                >
                  Pricing Tab
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border bg-muted/10 p-4">
              <p className="text-xs font-bold text-muted-foreground">
                Note: buyers also see this fee in checkout. Changes apply instantly to new orders.
              </p>
            </div>
          </SettingCard>

          <SettingCard
            icon={ShieldCheck}
            title="Security"
            subtitle="Core enforcement policies (UI mock switches where not wired)"
          >
            <div className="space-y-3">
              {[
                {
                  key: "requireSellerApproval",
                  label: "Require Admin Approval for Sellers",
                  description: "Seller registrations stay pending until an admin approves.",
                  locked: true
                },
                {
                  key: "strictSessionIsolation",
                  label: "Strict Session Isolation (Per Tab)",
                  description: "Prevents cross-tab role/session bleed between seller and buyer.",
                  locked: true
                },
                {
                  key: "enableEventModeration",
                  label: "Enable Event Moderation",
                  description: "Queue new campus events for admin review (mock).",
                  locked: false
                }
              ].map((s) => (
                <label
                  key={s.key}
                  className={cn(
                    "flex items-start justify-between gap-4 p-4 rounded-2xl border bg-white shadow-sm",
                    s.locked && "opacity-80"
                  )}
                >
                  <div className="min-w-0">
                    <p className="font-black text-primary text-sm">{s.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                    {s.locked && (
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary mt-2">Enforced</p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0",
                      localSettings[s.key] ? "bg-secondary" : "bg-muted"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={!!localSettings[s.key]}
                      onChange={(e) => !s.locked && setLocalSettings((p) => ({ ...p, [s.key]: e.target.checked }))}
                      className="sr-only"
                      disabled={s.locked}
                    />
                    <span
                      className={cn(
                        "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                        localSettings[s.key] ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => toast.info("Mock settings saved (only platform fee is persisted).")}
                className="px-6 py-3 rounded-2xl bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/10"
              >
                Save Security (Mock)
              </button>
            </div>
          </SettingCard>
        </div>

        <div className="space-y-8">
          <div className="rounded-3xl border bg-card shadow-xl p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                <Settings2 size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-primary tracking-tight">Quick Actions</h2>
                <p className="text-sm text-muted-foreground font-medium mt-1">Common admin maintenance tools</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: "Export Users (Mock)", action: () => toast.info("Export is UI-only for now.") },
                { label: "Rebuild Analytics (Mock)", action: () => toast.info("Rebuild queued (mock).") },
                { label: "Clear Temp Cache (Mock)", action: () => toast.info("Cache cleared (mock).") }
              ].map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={a.action}
                  className="w-full px-5 py-3 rounded-2xl border bg-white text-left hover:bg-muted/30 transition-colors font-black text-[10px] uppercase tracking-widest text-primary"
                >
                  {a.label}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-muted/10 border p-4">
              <p className="text-xs text-muted-foreground font-bold">
                Only the platform fee setting is persisted to the database right now.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

