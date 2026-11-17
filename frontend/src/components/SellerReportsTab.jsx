import React from "react";
import axios from "axios";
import { cn } from "../lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  FileText,
  Loader2,
  Package,
  Send,
  X
} from "lucide-react";
import { toast } from "react-toastify";
import { getSellerSessionWithKey } from "../lib/session";
import { PaginationControls } from "./shared/PaginationControls";

function StatCard({ icon: Icon, label, value, color }) {
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

function money(n) {
  const v = Number(n || 0);
  if (!Number.isFinite(v)) return "0";
  return v.toLocaleString();
}

export function SellerReportsTab({ reportModalOpen, setReportModalOpen, onGoToListings = () => {} }) {
  const { session: userInfo } = getSellerSessionWithKey();

  const [items, setItems] = React.useState([]);
  const [loadingItems, setLoadingItems] = React.useState(false);
  const [itemsError, setItemsError] = React.useState(null);

  const [paymentReports, setPaymentReports] = React.useState([]);
  const [loadingReports, setLoadingReports] = React.useState(false);
  const [reportsError, setReportsError] = React.useState(null);
  const [reportsPage, setReportsPage] = React.useState(1);
  const reportsPageSize = 10;

  const [form, setForm] = React.useState({
    category: "platform",
    subject: "",
    reference: "",
    description: "",
    attachment: null
  });

  const fetchMyItems = React.useCallback(async () => {
    try {
      setLoadingItems(true);
      setItemsError(null);

      if (!userInfo.token) {
        setItemsError("Please log in as a seller to view reports.");
        setItems([]);
        return;
      }

      const res = await axios.get("/api/items/mine?status=all", {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      if (res.data?.success) setItems(res.data.data || []);
      else setItemsError(res.data?.message || "Failed to load your listings.");
    } catch (err) {
      console.error("Seller reports fetch items error:", err);
      setItemsError(err.response?.data?.message || "Failed to load your listings.");
    } finally {
      setLoadingItems(false);
    }
  }, [userInfo.token]);

  React.useEffect(() => {
    fetchMyItems();
  }, [fetchMyItems]);

  const fetchPaymentReports = React.useCallback(async () => {
    try {
      setLoadingReports(true);
      setReportsError(null);

      if (!userInfo.token) {
        setReportsError("Please log in as a seller to view payment reports.");
        setPaymentReports([]);
        return;
      }

      const res = await axios.get("/api/payment-reports/seller", {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      if (res.data?.success) setPaymentReports(res.data.data || []);
      else setReportsError(res.data?.message || "Failed to load payment reports.");
    } catch (err) {
      console.error("Seller reports fetch payment reports error:", err);
      setReportsError(err.response?.data?.message || "Failed to load payment reports.");
    } finally {
      setLoadingReports(false);
    }
  }, [userInfo.token]);

  React.useEffect(() => {
    fetchPaymentReports();
  }, [fetchPaymentReports]);

  const lowStock = React.useMemo(() => {
    return items.filter((i) => {
      const qty = Number(i.stockQuantity ?? 0);
      const status = String(i.status || "").toLowerCase();
      if (status !== "available") return false;
      return qty > 0 && qty <= 2;
    });
  }, [items]);

  const outOfStock = React.useMemo(() => {
    return items.filter((i) => {
      const qty = Number(i.stockQuantity ?? 0);
      const status = String(i.status || "").toLowerCase();
      if (status !== "available") return false;
      return qty <= 0;
    });
  }, [items]);

  const inventoryValue = React.useMemo(() => {
    return items.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.stockQuantity || 0), 0);
  }, [items]);

  const openReportsCount = React.useMemo(() => {
    return paymentReports.filter((r) => ["submitted", "in_review"].includes(String(r.status || ""))).length;
  }, [paymentReports]);

  React.useEffect(() => {
    setReportsPage(1);
  }, [paymentReports.length]);

  const reportsTotalPages = Math.max(1, Math.ceil(paymentReports.length / reportsPageSize));
  const reportsSafePage = Math.min(reportsPage, reportsTotalPages);
  const reportsStartIndex = (reportsSafePage - 1) * reportsPageSize;
  const reportsEndIndex = reportsStartIndex + reportsPageSize;
  const pagedReports = paymentReports.slice(reportsStartIndex, reportsEndIndex);

  React.useEffect(() => {
    setReportsPage((p) => Math.min(p, reportsTotalPages));
  }, [reportsTotalPages]);

  const submitReport = () => {
    if (!form.subject.trim()) {
      toast.warn("Please enter a subject.");
      return;
    }
    if (!form.description.trim()) {
      toast.warn("Please enter a description.");
      return;
    }
    toast.success("Report submitted (UI mock).", { autoClose: 1200 });
    setForm({ category: "platform", subject: "", reference: "", description: "", attachment: null });
    setReportModalOpen?.(false);
  };

  const handleViewSlip = async (reportId) => {
    if (!userInfo.token) {
      toast.info("Please log in as a seller to view slips.");
      return;
    }

    // Open a tab immediately so popup blockers don't interfere.
    const popup = window.open("", "_blank", "noopener");
    try {
      const res = await axios.get(`/api/payment-reports/${reportId}/slip`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
        responseType: "blob"
      });

      const contentType = res.headers?.["content-type"] || res.data?.type || "application/octet-stream";
      const blob = new Blob([res.data], { type: contentType });
      const url = URL.createObjectURL(blob);

      if (popup) popup.location.href = url;
      else window.open(url, "_blank", "noopener");

      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      console.error("Error opening slip:", err);
      if (popup) popup.close();
      toast.error(err.response?.data?.message || "Failed to open slip.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Reports & Problems</h1>
          <p className="text-muted-foreground font-medium">Monitor alerts and report issues to the admin team</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              fetchMyItems();
              fetchPaymentReports();
              toast.info("Refreshing alerts...", { autoClose: 700 });
            }}
            className="px-4 py-2 rounded-xl bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/10"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setReportModalOpen?.(true)}
            className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-colors"
          >
            Report Problem
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={Package} label="Total Listings" value={items.length} color="bg-primary/10 text-primary" />
        <StatCard icon={AlertTriangle} label="Low Stock" value={lowStock.length} color="bg-amber-100 text-amber-700" />
        <StatCard icon={AlertCircle} label="Out Of Stock" value={outOfStock.length} color="bg-red-100 text-red-600" />
        <StatCard icon={FileText} label="Open Reports" value={openReportsCount} color="bg-secondary/10 text-secondary" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Alerts */}
        <div className="xl:col-span-2 rounded-3xl border bg-card shadow-xl overflow-hidden">
          <div className="p-6 border-b bg-muted/10 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-black text-primary tracking-tight">Listing Alerts</h2>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                Inventory Value: <span className="text-primary font-black">LKR {money(inventoryValue)}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onGoToListings}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all font-black text-[10px] uppercase tracking-widest"
            >
              Manage Listings <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="p-6">
            {loadingItems ? (
              <div className="py-10 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground font-bold">Loading alerts...</p>
              </div>
            ) : itemsError ? (
              <div className="py-10 text-center text-red-500 font-black">{itemsError}</div>
            ) : lowStock.length === 0 && outOfStock.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground font-bold">
                No alerts right now. Your inventory looks healthy.
              </div>
            ) : (
              <div className="space-y-4">
                {outOfStock.slice(0, 8).map((it) => (
                  <div key={it._id} className="rounded-2xl border bg-white p-4 shadow-sm flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-black text-primary truncate">{it.title || "Untitled"}</p>
                      <p className="text-xs text-muted-foreground font-bold mt-1">
                        Out of stock • LKR {money(it.price)} • ID: {String(it._id).slice(-6).toUpperCase()}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-red-50 text-red-600 border-red-100">
                      out
                    </span>
                  </div>
                ))}

                {lowStock.slice(0, 8).map((it) => (
                  <div key={it._id} className="rounded-2xl border bg-white p-4 shadow-sm flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-black text-primary truncate">{it.title || "Untitled"}</p>
                      <p className="text-xs text-muted-foreground font-bold mt-1">
                        Low stock • Qty {Number(it.stockQuantity ?? 0)} • LKR {money(it.price)}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-amber-50 text-amber-700 border-amber-100">
                      low
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reports */}
        <div className="rounded-3xl border bg-card shadow-xl overflow-hidden">
          <div className="p-6 border-b bg-muted/10">
            <h2 className="text-xl font-black text-primary tracking-tight">Buyer Payment Reports</h2>
            <p className="text-sm text-muted-foreground font-medium mt-1">Reports submitted by buyers for your items</p>
          </div>
          <div className="p-6 space-y-4">
            {loadingReports ? (
              <div className="py-10 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground font-bold">Loading reports...</p>
              </div>
            ) : reportsError ? (
              <div className="py-10 text-center text-red-500 font-black">{reportsError}</div>
            ) : paymentReports.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground font-bold">No buyer reports for your items.</div>
            ) : (
              <div className="space-y-4">
                {pagedReports.map((r) => {
                  const status = String(r.status || "submitted");
                  const purchaseDate = r.purchaseDate ? new Date(r.purchaseDate).toLocaleDateString() : "N/A";
                  const filedDate = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A";
                  const orderId = r.order?._id || r.order || "";
                  const shortOrder = orderId ? String(orderId).slice(-6).toUpperCase() : "N/A";
                  const buyerName =
                    (r.user?.firstName || r.user?.lastName)
                      ? `${r.user?.firstName || ""} ${r.user?.lastName || ""}`.trim()
                      : (r.name || "Buyer");

                  const products = Array.isArray(r.products) ? r.products : [];
                  const productTitles = products.map((p) => p?.title).filter(Boolean).slice(0, 4);

                  return (
                    <div key={r._id} className="rounded-2xl border bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-black text-primary truncate">{buyerName}</p>
                          <p className="text-[11px] text-muted-foreground font-bold mt-1">
                            Student No: <span className="text-primary">{r.studentNumber || "N/A"}</span> • Order #{shortOrder}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border whitespace-nowrap",
                            status === "submitted"
                              ? "bg-amber-50 text-amber-700 border-amber-100"
                              : status === "in_review"
                                ? "bg-primary text-primary-foreground border-primary"
                                : status === "resolved"
                                  ? "bg-green-50 text-green-700 border-green-100"
                                  : "bg-red-50 text-red-600 border-red-100"
                          )}
                        >
                          {status.replace("_", " ")}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground font-bold mt-3">
                        Purchase: {purchaseDate} • Filed: {filedDate}
                      </p>

                      {productTitles.length > 0 && (
                        <p className="text-xs text-muted-foreground font-bold mt-2 line-clamp-2">
                          Products: <span className="text-primary">{productTitles.join(", ")}</span>
                          {products.length > productTitles.length ? ` +${products.length - productTitles.length} more` : ""}
                        </p>
                      )}

                      {r.description && (
                        <div className="mt-3 p-3 rounded-2xl border bg-muted/10">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Description</p>
                          <p className="text-sm text-foreground font-medium whitespace-pre-wrap line-clamp-4">{r.description}</p>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-end gap-2">
                        {r.slipUrl ? (
                          <button
                            type="button"
                            onClick={() => handleViewSlip(r._id)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all font-black text-[10px] uppercase tracking-widest"
                          >
                            View Slip <ArrowUpRight size={14} />
                          </button>
                        ) : (
                          <div className="px-4 py-2 rounded-xl bg-muted text-muted-foreground font-black text-[10px] uppercase tracking-widest text-center border">
                            No Slip
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="pt-2">
                  <PaginationControls
                    currentPage={reportsSafePage}
                    totalPages={reportsTotalPages}
                    onPageChange={setReportsPage}
                    from={paymentReports.length === 0 ? 0 : reportsStartIndex + 1}
                    to={Math.min(reportsEndIndex, paymentReports.length)}
                    total={paymentReports.length}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-[2.5rem] border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Report a Problem</p>
                <h2 className="text-2xl font-black text-primary tracking-tight truncate">
                  {userInfo?.firstName ? `${userInfo.firstName} ${userInfo.lastName || ""}`.trim() : "Seller"}
                </h2>
                <p className="text-sm text-muted-foreground font-bold mt-1 truncate">
                  This is UI-only (no database save yet).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReportModalOpen?.(false)}
                className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full h-12 px-4 rounded-2xl border bg-white font-bold text-primary outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                  >
                    <option value="platform">Platform / Bug</option>
                    <option value="listing">Listing Problem</option>
                    <option value="payment">Payment Problem</option>
                    <option value="account">Account Problem</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reference (Optional)</label>
                  <input
                    value={form.reference}
                    onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))}
                    className="w-full h-12 px-4 rounded-2xl border bg-white font-bold text-primary outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                    placeholder="Listing ID / Order ID"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subject</label>
                <input
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  className="w-full h-12 px-4 rounded-2xl border bg-white font-bold text-primary outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all"
                  placeholder="Short title of the issue"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={5}
                  className="w-full px-4 py-3 rounded-2xl border bg-white font-medium text-primary outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all resize-none"
                  placeholder="Explain what happened and what you expected..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Attachment (Optional)</label>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={(e) => setForm((p) => ({ ...p, attachment: e.target.files?.[0] || null }))}
                  className="w-full px-4 py-3 rounded-2xl border bg-white font-bold text-primary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all"
                />
                <p className="text-xs text-muted-foreground font-medium">
                  Allowed: PNG/JPG/PDF. (Mock only - not uploaded yet)
                </p>
              </div>
            </div>

            <div className="p-6 border-t bg-muted/10 flex flex-col sm:flex-row justify-end gap-2">
              <button
                type="button"
                onClick={() => setReportModalOpen?.(false)}
                className="px-6 py-3 rounded-2xl border font-black text-xs uppercase tracking-widest text-muted-foreground hover:bg-muted/30 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReport}
                className="px-7 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 inline-flex items-center justify-center gap-2"
              >
                <Send size={16} /> Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
