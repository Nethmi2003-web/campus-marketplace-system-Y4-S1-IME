import React from "react";
import axios from "axios";
import { cn } from "../lib/utils";
import {
  Copy,
  Eye,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  Store,
  Users,
  X
} from "lucide-react";
import { toast } from "react-toastify";
import { getAdminSessionWithKey } from "../lib/session";
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

function formatDate(value) {
  if (!value) return "N/A";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "N/A";
  }
}

export function AdminUsersTab() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const [selectedUser, setSelectedUser] = React.useState(null);

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { session: userInfo } = getAdminSessionWithKey();
      if (!userInfo.token) {
        setError("Please log in as admin to view users.");
        setLoading(false);
        return;
      }

      const res = await axios.get("/api/users", {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users
      .filter((u) => {
        const role = String(u.role || "").toLowerCase();
        if (roleFilter !== "all" && role !== roleFilter) return false;

        if (!q) return true;
        const hay = [
          u.firstName,
          u.lastName,
          u.universityEmail,
          u.faculty,
          u.phone
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
  }, [users, searchQuery, roleFilter]);

  React.useEffect(() => {
    setPage(1);
  }, [searchQuery, roleFilter, users.length]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedUsers = filteredUsers.slice(startIndex, endIndex);

  React.useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const sellerCount = React.useMemo(
    () => users.filter((u) => String(u.role || "").toLowerCase() === "seller").length,
    [users]
  );
  const adminCount = React.useMemo(
    () => users.filter((u) => ["admin", "sportadmin"].includes(String(u.role || "").toLowerCase())).length,
    [users]
  );
  const newThisWeek = React.useMemo(() => {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    return users.filter((u) => {
      if (!u.createdAt) return false;
      const t = new Date(u.createdAt).getTime();
      return Number.isFinite(t) && now - t <= weekMs;
    }).length;
  }, [users]);

  const copyToClipboard = async (value) => {
    try {
      await navigator.clipboard.writeText(String(value || ""));
      toast.success("Copied", { autoClose: 800 });
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground font-medium">View and monitor all registered marketplace accounts</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border bg-card text-sm font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="seller">Sellers</option>
            <option value="admin">Admins</option>
            <option value="sportadmin">Sport Admins</option>
          </select>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search name, email, faculty..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => {
              fetchUsers();
              toast.info("Refreshing users...", { autoClose: 700 });
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/10"
          >
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Users" value={users.length} color="bg-primary/10 text-primary" />
        <StatCard icon={Store} label="Sellers" value={sellerCount} color="bg-secondary/10 text-secondary" />
        <StatCard icon={ShieldCheck} label="Admins" value={adminCount} color="bg-green-100 text-green-700" />
        <StatCard icon={Users} label="New (7d)" value={newThisWeek} color="bg-amber-100 text-amber-700" />
      </div>

      {/* Table */}
      <div className="rounded-3xl border bg-card shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-muted-foreground font-bold">Loading users...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-500 font-black">{error}</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Name</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Email</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Faculty</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Role</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Joined</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pagedUsers.map((u) => {
                  const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unknown";
                  const role = String(u.role || "user");
                  return (
                    <tr key={u._id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-black text-primary line-clamp-1">{name}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                          ID: {String(u._id || "").slice(-6).toUpperCase()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-foreground">{u.universityEmail || "—"}</p>
                        <p className="text-[10px] text-muted-foreground font-bold mt-1">{u.phone || "No phone"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-foreground">{u.faculty || "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                          role.toLowerCase() === "seller" ? "bg-secondary/10 text-secondary border-secondary/20" :
                          role.toLowerCase() === "admin" || role.toLowerCase() === "sportadmin" ? "bg-green-50 text-green-700 border-green-100" :
                          "bg-primary/5 text-primary border-primary/10"
                        )}>
                          {role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-foreground">{formatDate(u.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                            title="View user"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(u.universityEmail)}
                            className="p-2 rounded-lg hover:bg-secondary/10 text-muted-foreground hover:text-secondary transition-all"
                            title="Copy email"
                          >
                            <Copy size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                      No users found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {!loading && !error && filteredUsers.length > 0 && (
          <div className="p-6 border-t bg-muted/10">
            <PaginationControls
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
              from={filteredUsers.length === 0 ? 0 : startIndex + 1}
              to={Math.min(endIndex, filteredUsers.length)}
              total={filteredUsers.length}
            />
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-[2.5rem] border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">User Details</p>
                <h2 className="text-2xl font-black text-primary tracking-tight truncate">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                <p className="text-sm text-muted-foreground font-bold mt-1 truncate">{selectedUser.universityEmail}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["User ID", selectedUser._id],
                ["Role", selectedUser.role],
                ["Faculty", selectedUser.faculty],
                ["Phone", selectedUser.phone || "—"],
                ["Joined", formatDate(selectedUser.createdAt)],
                ["Bio", selectedUser.bio || "—"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border bg-white p-4 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                  <p className="font-black text-primary break-words">{value}</p>
                </div>
              ))}
            </div>

            <div className="p-6 border-t bg-muted/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(selectedUser.universityEmail)}
                className="px-4 py-2 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all font-black text-[10px] uppercase tracking-widest"
              >
                Copy Email
              </button>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

