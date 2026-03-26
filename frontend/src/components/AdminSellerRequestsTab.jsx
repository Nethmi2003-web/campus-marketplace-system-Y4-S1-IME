import React from "react";
import axios from "axios";
import { cn } from "../lib/utils";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  Loader2,
  RefreshCcw,
  XCircle
} from "lucide-react";
import { toast } from "react-toastify";
import { getAdminSessionWithKey } from "../lib/session";
import { PaginationControls } from "./shared/PaginationControls";

export function AdminSellerRequestsTab() {
  const [requests, setRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [statusFilter, setStatusFilter] = React.useState("pending"); // pending | approved | rejected | all
  const [expandedId, setExpandedId] = React.useState(null);
  const [processingId, setProcessingId] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const fetchRequests = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { session: userInfo } = getAdminSessionWithKey();
      if (!userInfo.token) {
        setError("Please log in as admin to view seller requests.");
        setLoading(false);
        return;
      }

      const res = await axios.get(`/api/admin/seller-requests?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      if (res.data?.success) setRequests(res.data.data || []);
      else setError(res.data?.message || "Failed to load seller requests.");
    } catch (err) {
      console.error("Error fetching seller requests:", err);
      setError(err.response?.data?.message || "Failed to load seller requests.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  React.useEffect(() => {
    setPage(1);
    setExpandedId(null);
  }, [statusFilter]);

  const totalPages = Math.max(1, Math.ceil(requests.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedRequests = requests.slice(startIndex, endIndex);

  React.useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const handleApprove = async (id) => {
    try {
      const { session: userInfo } = getAdminSessionWithKey();
      if (!userInfo.token) {
        toast.info("Please log in as admin.");
        return;
      }
      setProcessingId(id);
      const res = await axios.put(`/api/admin/seller-requests/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      if (res.data?.success) {
        toast.success("Seller request approved.");
        setRequests((prev) => prev.map((r) => (r._id === id ? res.data.data : r)));
      } else {
        toast.error(res.data?.message || "Failed to approve request.");
      }
    } catch (err) {
      console.error("Approve request error:", err);
      toast.error(err.response?.data?.message || "Failed to approve request.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Rejection reason (optional):") || "";
    try {
      const { session: userInfo } = getAdminSessionWithKey();
      if (!userInfo.token) {
        toast.info("Please log in as admin.");
        return;
      }
      setProcessingId(id);
      const res = await axios.put(`/api/admin/seller-requests/${id}/reject`, { reason }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      if (res.data?.success) {
        toast.success("Seller request rejected.");
        setRequests((prev) => prev.map((r) => (r._id === id ? res.data.data : r)));
      } else {
        toast.error(res.data?.message || "Failed to reject request.");
      }
    } catch (err) {
      console.error("Reject request error:", err);
      toast.error(err.response?.data?.message || "Failed to reject request.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Seller Requests</h1>
          <p className="text-muted-foreground font-medium">Approve or reject seller registration requests</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border bg-card text-sm font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
          <button
            onClick={() => { fetchRequests(); toast.info("Refreshing requests...", { autoClose: 700 }); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/10"
          >
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="rounded-3xl border bg-card shadow-2xl overflow-hidden">
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-muted-foreground font-bold">Loading seller requests...</p>
            </div>
          ) : error ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-center">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="text-red-500 font-black">{error}</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground font-bold">
              No seller requests found.
            </div>
          ) : (
            <div className="space-y-4">
              {pagedRequests.map((r) => {
                const status = r.status || "pending";
                const isPending = status === "pending";
                const u = r.user || {};
                const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unknown User";
                const submitted = r.createdAt ? new Date(r.createdAt).toLocaleString() : "N/A";
                const decided = r.decidedAt ? new Date(r.decidedAt).toLocaleString() : null;
                const isExpanded = expandedId === r._id;
                const busy = processingId === r._id;

                return (
                  <div key={r._id} className="rounded-3xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Request #{String(r._id).slice(-6).toUpperCase()}
                          </span>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                            status === "pending" ? "bg-amber-50 text-amber-700 border-amber-100" :
                            status === "approved" ? "bg-green-50 text-green-700 border-green-100" :
                            "bg-red-50 text-red-600 border-red-100"
                          )}>
                            {status}
                          </span>
                        </div>

                        <p className="font-black text-primary text-lg leading-tight truncate">
                          {name}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                          {u.universityEmail || "No email"} • {u.faculty || "No faculty"}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                          Submitted: {submitted}{decided ? ` • Decided: ${decided}` : ""}
                        </p>

                        {isExpanded && (
                          <div className="mt-4 p-4 bg-muted/20 rounded-2xl border">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Details</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="text-muted-foreground font-bold">User ID</div>
                              <div className="font-black text-primary break-all">{u._id || r.user}</div>
                              <div className="text-muted-foreground font-bold">Phone</div>
                              <div className="font-black text-primary">{u.phone || "N/A"}</div>
                              <div className="text-muted-foreground font-bold">Current Role</div>
                              <div className="font-black text-primary">{u.role || "N/A"}</div>
                              <div className="text-muted-foreground font-bold">Rejection Reason</div>
                              <div className="font-black text-primary">{r.rejectionReason || "N/A"}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-stretch gap-2 md:w-56">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : r._id)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all font-black text-[10px] uppercase tracking-widest border border-primary/10"
                        >
                          <Eye size={14} /> {isExpanded ? "Hide Details" : "View Details"}
                        </button>

                        <button
                          type="button"
                          disabled={!isPending || busy}
                          onClick={() => handleApprove(r._id)}
                          className={cn(
                            "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                            isPending
                              ? "bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border border-green-200"
                              : "bg-muted text-muted-foreground border cursor-not-allowed"
                          )}
                        >
                          {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                          Approve
                        </button>

                        <button
                          type="button"
                          disabled={!isPending || busy}
                          onClick={() => handleReject(r._id)}
                          className={cn(
                            "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                            isPending
                              ? "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200"
                              : "bg-muted text-muted-foreground border cursor-not-allowed"
                          )}
                        >
                          {busy ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!loading && !error && requests.length > 0 && (
          <div className="p-6 border-t bg-muted/10">
            <PaginationControls
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
              from={requests.length === 0 ? 0 : startIndex + 1}
              to={Math.min(endIndex, requests.length)}
              total={requests.length}
            />
          </div>
        )}
      </div>
    </div>
  );
}
