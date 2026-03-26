import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CheckCircle2,
  Clock,
  LogOut,
  RefreshCcw,
  Store,
  User,
  XCircle
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/shared/UI";
import { clearSession, getBuyerSessionWithKey, setSessionForRole, STORAGE_KEYS } from "../lib/session";

function StatusPill({ status }) {
  const s = String(status || "").toLowerCase();
  const styles =
    s === "approved"
      ? "bg-green-50 text-green-700 border-green-100"
      : s === "rejected"
      ? "bg-red-50 text-red-600 border-red-100"
      : "bg-amber-50 text-amber-700 border-amber-100";

  const label = s ? s : "pending";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
        styles
      )}
    >
      {label}
    </span>
  );
}

export default function SellerRequestStatusPage() {
  const navigate = useNavigate();
  const { session: userInfo, key: sessionKey } = getBuyerSessionWithKey();
  const token = userInfo?.token;

  const [loading, setLoading] = React.useState(true);
  const [me, setMe] = React.useState(null);
  const [sellerRequest, setSellerRequest] = React.useState(null);
  const [error, setError] = React.useState("");

  const fetchStatus = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/");
        return;
      }

      const [meRes, reqRes] = await Promise.all([
        axios.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("/api/users/seller-request", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const freshMe = meRes.data;
      const latestRequest = reqRes.data?.data || null;

      setMe(freshMe);
      setSellerRequest(latestRequest);

      // Keep session up to date (role can change to "seller" after approval).
      setSessionForRole({
        ...freshMe,
        token,
        sellerRequest: latestRequest
      });
    } catch (err) {
      console.error("Seller request status fetch error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to load seller request status.";
      setError(msg);
      if (String(err.response?.status) === "401" || String(err.response?.status) === "403") {
        toast.error("Session expired. Please login again.");
        clearSession(sessionKey);
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, sessionKey, token]);

  React.useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const status = String(sellerRequest?.status || "pending").toLowerCase();

  const createdAt = sellerRequest?.createdAt ? new Date(sellerRequest.createdAt).toLocaleString() : "N/A";
  const decidedAt = sellerRequest?.decidedAt ? new Date(sellerRequest.decidedAt).toLocaleString() : null;
  const rejectionReason = String(sellerRequest?.rejectionReason || "").trim();

  const Icon =
    status === "approved" ? CheckCircle2 : status === "rejected" ? XCircle : Clock;

  const iconClass =
    status === "approved"
      ? "bg-green-100 text-green-700"
      : status === "rejected"
      ? "bg-red-100 text-red-600"
      : "bg-amber-100 text-amber-700";

  const primaryMessage =
    status === "approved"
      ? "Your seller account is approved. You can access the Seller Dashboard now."
      : status === "rejected"
      ? "Your seller request was rejected by admin."
      : "Your seller request is pending admin approval. Please wait for the decision.";

  const handleLogout = () => {
    // Clear both buyer/seller sessions to avoid leaving a promoted seller session behind.
    clearSession(sessionKey);
    clearSession(STORAGE_KEYS.buyer);
    clearSession(STORAGE_KEYS.seller);
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh]">
      <Card className="w-full max-w-2xl border-none shadow-2xl">
        <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
        <CardHeader className="text-center">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4", iconClass)}>
            <Icon size={30} />
          </div>
          <CardTitle className="text-3xl font-black text-primary">Seller Request Status</CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            Track your seller registration request and next steps
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="py-10 text-center text-muted-foreground font-bold">Loading request status...</div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 font-bold text-center">
              {error}
            </div>
          ) : !sellerRequest ? (
            <div className="p-4 rounded-2xl bg-muted/30 border text-center">
              <p className="font-black text-primary">No seller request found for this account.</p>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                If you want to become a seller, submit a new request from the registration page.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account</p>
                  <p className="font-black text-primary text-lg truncate">
                    {me?.firstName} {me?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium truncate">{me?.universityEmail}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={status} />
                  <button
                    type="button"
                    onClick={fetchStatus}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/10"
                    title="Refresh"
                  >
                    <RefreshCcw size={14} /> Refresh
                  </button>
                </div>
              </div>

              <div className="mt-5 p-4 rounded-2xl bg-muted/20 border">
                <p className="text-sm font-black text-primary mb-1">{primaryMessage}</p>
                <p className="text-xs text-muted-foreground font-bold">Submitted: {createdAt}</p>
                {decidedAt && <p className="text-xs text-muted-foreground font-bold">Decided: {decidedAt}</p>}
                {status === "rejected" && rejectionReason && (
                  <p className="text-xs text-red-600 font-black mt-2">Reason: {rejectionReason}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/user-dashboard")}
            >
              <User size={16} className="mr-2" /> Buyer Dashboard
            </Button>

            <Button
              type="button"
              className="flex-1 bg-secondary"
              disabled={status !== "approved"}
              onClick={() => navigate("/seller-dashboard")}
              title={status !== "approved" ? "Available after approval" : "Open Seller Dashboard"}
            >
              <Store size={16} className="mr-2" /> Seller Dashboard
            </Button>

            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-2" /> Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
