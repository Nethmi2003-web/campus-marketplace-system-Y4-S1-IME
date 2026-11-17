import React from "react";
import axios from "axios";
import { cn } from "../lib/utils";
import { AlertCircle, ArrowUpRight, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { getAdminSessionWithKey } from "../lib/session";
import { PaginationControls } from "./shared/PaginationControls";

export function AdminPaymentReportsTab() {
  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const handleViewSlip = async (reportId) => {
    const { session: userInfo } = getAdminSessionWithKey();
    if (!userInfo.token) {
      toast.info("Please log in as admin to view slips.");
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

      // Let the viewer load before revoking.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      console.error("Error opening slip:", err);
      if (popup) popup.close();
      toast.error(err.response?.data?.message || "Failed to open slip.");
    }
  };

  const fetchReports = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { session: userInfo } = getAdminSessionWithKey();
      if (!userInfo.token) {
        setError("Please log in as admin to view payment reports.");
        setLoading(false);
        return;
      }
      const res = await axios.get("/api/payment-reports", {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      if (res.data?.success) {
        setReports(res.data.data || []);
      } else {
        setError(res.data?.message || "Failed to load payment reports.");
      }
    } catch (err) {
      console.error("Error fetching payment reports:", err);
      setError(err.response?.data?.message || "Failed to load payment reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  React.useEffect(() => {
    setPage(1);
  }, [reports.length]);

  const totalPages = Math.max(1, Math.ceil(reports.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedReports = reports.slice(startIndex, endIndex);

  React.useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Payment Reports</h1>
          <p className="text-muted-foreground font-medium">Buyer-submitted payment issues and slips</p>
        </div>
        <button
          onClick={() => { fetchReports(); toast.info("Refreshing reports...", { autoClose: 700 }); }}
          className="px-4 py-2 rounded-xl bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/10 w-fit"
        >
          Refresh
        </button>
      </div>

      <div className="rounded-3xl border bg-card shadow-2xl overflow-hidden">
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-muted-foreground font-bold">Loading payment reports...</p>
            </div>
          ) : error ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-center">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="text-red-500 font-black">{error}</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground font-bold">
              No payment reports submitted yet.
            </div>
          ) : (
            <div className="space-y-4">
              {pagedReports.map((r) => {
                const status = r.status || "submitted";
                const orderId = r.order?._id || "";
                const shortOrder = orderId ? orderId.slice(-6).toUpperCase() : "N/A";
                const totalPaid = typeof r.order?.totalAmount === "number" ? r.order.totalAmount.toLocaleString() : "0";
                const purchaseDate = r.purchaseDate ? new Date(r.purchaseDate).toLocaleDateString() : "N/A";
                const filedDate = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A";

                return (
                  <div key={r._id} className="rounded-3xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Report #{String(r._id).slice(-6).toUpperCase()}
                          </span>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                            status === "submitted" ? "bg-amber-50 text-amber-700 border-amber-100" :
                            status === "in_review" ? "bg-primary text-primary-foreground border-primary" :
                            status === "resolved"  ? "bg-green-50 text-green-700 border-green-100" :
                                                   "bg-red-50 text-red-600 border-red-100"
                          )}>
                            {String(status).replace("_", " ")}
                          </span>
                        </div>

                        <p className="font-black text-primary text-lg leading-tight truncate">
                          {r.name} <span className="text-muted-foreground font-bold text-sm">({r.studentNumber})</span>
                        </p>
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                          User: {r.user?.firstName} {r.user?.lastName} • {r.user?.universityEmail}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                          Purchase Date: {purchaseDate} • Filed: {filedDate}
                        </p>

                        <div className="mt-3 p-4 bg-muted/20 rounded-2xl border">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Description</p>
                          <p className="text-sm text-foreground font-medium whitespace-pre-wrap">{r.description}</p>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 border border-primary/10 px-3 py-1 rounded-full">
                            Order: #{shortOrder}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 border border-primary/10 px-3 py-1 rounded-full">
                            Method: {r.order?.paymentMethod || "N/A"}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 border border-primary/10 px-3 py-1 rounded-full">
                            Paid: LKR {totalPaid}
                          </span>
                        </div>

                        {Array.isArray(r.products) && r.products.length > 0 && (
                          <div className="mt-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Products</p>
                            <p className="text-xs text-muted-foreground font-bold line-clamp-2">
                              {r.products.map(p => p?.title).filter(Boolean).join(", ")}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-stretch gap-2 md:w-44">
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
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!loading && !error && reports.length > 0 && (
          <div className="p-6 border-t bg-muted/10">
            <PaginationControls
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
              from={reports.length === 0 ? 0 : startIndex + 1}
              to={Math.min(endIndex, reports.length)}
              total={reports.length}
            />
          </div>
        )}
      </div>
    </div>
  );
}
