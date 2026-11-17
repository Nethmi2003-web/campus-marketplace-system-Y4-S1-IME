import React from "react";
import axios from "axios";
import { cn } from "../lib/utils";
import {
  AlertCircle,
  ArrowUpRight,
  Loader2,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  UserCheck
} from "lucide-react";
import { toast } from "react-toastify";
import { getAdminSessionWithKey } from "../lib/session";
import { PaginationControls } from "./shared/PaginationControls";

function Metric({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-xl flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
        <h3 className="text-2xl font-black text-primary">{value}</h3>
      </div>
    </div>
  );
}

function badgeClass(kind) {
  switch (kind) {
    case "payment_report":
      return "bg-red-50 text-red-600 border-red-100";
    case "seller_request":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "listing_attention":
      return "bg-primary text-primary-foreground border-primary";
    default:
      return "bg-muted text-muted-foreground border";
  }
}

export function AdminModerationTab({
  onOpenPaymentReports = () => {},
  onOpenSellerRequests = () => {},
  onOpenListings = () => {}
}) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [queue, setQueue] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const buildQueue = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { session: userInfo } = getAdminSessionWithKey();
      if (!userInfo.token) {
        setError("Please log in as admin to view moderation tools.");
        setLoading(false);
        return;
      }

      const [reportsRes, sellerReqRes, itemsRes] = await Promise.all([
        axios.get("/api/payment-reports", { headers: { Authorization: `Bearer ${userInfo.token}` } }),
        axios.get("/api/admin/seller-requests?status=pending", { headers: { Authorization: `Bearer ${userInfo.token}` } }),
        axios.get("/api/items")
      ]);

      const reports = reportsRes.data?.success ? reportsRes.data.data || [] : [];
      const sellerReq = sellerReqRes.data?.success ? sellerReqRes.data.data || [] : [];
      const items = itemsRes.data?.success ? itemsRes.data.data || [] : [];

      const openReports = reports.filter((r) => ["submitted", "in_review"].includes(String(r.status || "submitted")));

      const lowStock = items.filter((it) => Number(it.stockQuantity ?? 0) <= 1).slice(0, 10);

      const q = [
        ...openReports.slice(0, 10).map((r) => ({
          id: r._id,
          kind: "payment_report",
          title: `Payment report #${String(r._id).slice(-6).toUpperCase()}`,
          meta: `${r.name || "Student"} • ${r.studentNumber || "N/A"} • ${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}`,
          status: r.status || "submitted",
          actionLabel: "Open Reports",
          onAction: onOpenPaymentReports
        })),
        ...sellerReq.slice(0, 10).map((r) => {
          const u = r.user || {};
          const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unknown User";
          return {
            id: r._id,
            kind: "seller_request",
            title: `Seller request: ${name}`,
            meta: `${u.universityEmail || "No email"} • ${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}`,
            status: r.status || "pending",
            actionLabel: "Open Requests",
            onAction: onOpenSellerRequests
          };
        }),
        ...lowStock.map((it) => ({
          id: it._id,
          kind: "listing_attention",
          title: `Listing attention: ${it.title || "Untitled"}`,
          meta: `Stock: ${Number(it.stockQuantity ?? 0)} • LKR ${Number(it.price || 0).toLocaleString()}`,
          status: "low_stock",
          actionLabel: "Open Listings",
          onAction: onOpenListings
        }))
      ];

      setQueue(q);
    } catch (err) {
      console.error("Moderation queue error:", err);
      setError(err.response?.data?.message || "Failed to load moderation data.");
    } finally {
      setLoading(false);
    }
  }, [onOpenListings, onOpenPaymentReports, onOpenSellerRequests]);

  React.useEffect(() => {
    buildQueue();
  }, [buildQueue]);

  React.useEffect(() => {
    setPage(1);
  }, [queue.length]);

  const totalPages = Math.max(1, Math.ceil(queue.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedQueue = queue.slice(startIndex, endIndex);

  React.useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const openPaymentReportsCount = React.useMemo(
    () => queue.filter((q) => q.kind === "payment_report").length,
    [queue]
  );
  const pendingSellerReqCount = React.useMemo(
    () => queue.filter((q) => q.kind === "seller_request").length,
    [queue]
  );
  const listingAttentionCount = React.useMemo(
    () => queue.filter((q) => q.kind === "listing_attention").length,
    [queue]
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Trust & Safety</h1>
          <p className="text-muted-foreground font-medium">Review high-priority issues across the platform</p>
        </div>
        <button
          type="button"
          onClick={() => {
            buildQueue();
            toast.info("Refreshing moderation queue...", { autoClose: 700 });
          }}
          className="px-4 py-2 rounded-xl bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/10 w-fit"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Metric icon={Receipt} label="Open Payment Reports" value={openPaymentReportsCount} color="bg-red-100 text-red-600" />
        <Metric icon={UserCheck} label="Pending Seller Requests" value={pendingSellerReqCount} color="bg-amber-100 text-amber-700" />
        <Metric icon={ShoppingBag} label="Listings Needing Attention" value={listingAttentionCount} color="bg-primary text-primary-foreground" />
      </div>

      <div className="rounded-3xl border bg-card shadow-2xl overflow-hidden">
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-muted-foreground font-bold">Building moderation queue...</p>
            </div>
          ) : error ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-center">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="text-red-500 font-black">{error}</p>
            </div>
          ) : queue.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground font-bold">
              No moderation items right now.
            </div>
          ) : (
            <div className="space-y-4">
              {pagedQueue.map((q) => (
                <div key={`${q.kind}-${q.id}`} className="rounded-3xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", badgeClass(q.kind))}>
                          {q.kind.replace("_", " ")}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {String(q.status || "").replace("_", " ")}
                        </span>
                      </div>

                      <p className="font-black text-primary text-lg leading-tight truncate">{q.title}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-1">{q.meta}</p>
                    </div>

                    <div className="flex flex-col items-stretch gap-2 md:w-44">
                      <button
                        type="button"
                        onClick={q.onAction}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all font-black text-[10px] uppercase tracking-widest"
                      >
                        {q.actionLabel} <ArrowUpRight size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toast.info("Marked as reviewed (UI-only).")}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all font-black text-[10px] uppercase tracking-widest border border-primary/10"
                      >
                        Mark Reviewed
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && !error && queue.length > 0 && (
          <div className="p-6 border-t bg-muted/10">
            <PaginationControls
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
              from={queue.length === 0 ? 0 : startIndex + 1}
              to={Math.min(endIndex, queue.length)}
              total={queue.length}
            />
          </div>
        )}
      </div>

      <div className="rounded-3xl border bg-gradient-to-br from-[#001f5c] to-primary/90 p-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
              <ShieldCheck size={22} className="text-secondary" />
            </div>
            <div>
              <h3 className="text-xl font-black">Quick Links</h3>
              <p className="text-white/70 text-sm font-medium">Jump directly to the dedicated review screens</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onOpenPaymentReports}
              className="px-5 py-3 rounded-2xl bg-white text-primary font-black text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all"
            >
              Payment Reports
            </button>
            <button
              type="button"
              onClick={onOpenSellerRequests}
              className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/15 transition-all"
            >
              Seller Requests
            </button>
            <button
              type="button"
              onClick={onOpenListings}
              className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/15 transition-all"
            >
              Active Listings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
