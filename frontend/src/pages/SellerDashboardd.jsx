import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Store,
  LayoutDashboard,
  Package,
  Receipt,
  FileText,
  ShoppingBag,
  PlusCircle,
  Settings,
  LogOut,
  Search,
  Loader2,
  Edit3,
  Save,
  Trash2,
  AlertTriangle,
  X
} from "lucide-react";
import { toast } from "react-toastify";
import { clearSession, getSellerSessionWithKey } from "../lib/session";
import { SellerAnalytic } from "../components/SellerAnalytic";
import { PaginationControls } from "../components/shared/PaginationControls";
import { SellerNameBadge } from "../components/SellerNameBadge";
import { SellerReportsTab } from "../components/SellerReportsTab";
import { SellerSettingsTab } from "../components/SellerSettingsTab";

function SellerNavbar({ user }) {
  return (
    <nav className="h-20 bg-background/95 backdrop-blur-md border-b fixed top-0 left-0 right-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Store className="text-secondary w-8 h-8" />
        <h2 className="hidden md:block font-black text-xl text-primary tracking-tight">
          Seller<span className="text-secondary">Hub</span>
        </h2>
      </div>
      <SellerNameBadge user={user} />
    </nav>
  );
}

function SellerSidebar({ activeTab, setActiveTab, onLogout, onReportProblem = () => {} }) {
  const navigate = useNavigate();
  const tabs = [
    { id: "overview", label: "Store Overview", icon: LayoutDashboard },
    { id: "listings", label: "My Listings", icon: Package },
    { id: "transactions", label: "Transactions", icon: Receipt },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "create", label: "Create Listing", icon: PlusCircle },
    { id: "settings", label: "Store Settings", icon: Settings }
  ];

  return (
    <aside className="w-64 fixed left-0 top-20 bottom-0 bg-gradient-to-b from-[#001f5c] to-[#002a7a] p-4 flex flex-col hidden lg:flex rounded-tr-3xl">
      <div className="space-y-3 flex-1 mt-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm group text-left",
              tab.id === activeTab
                ? "bg-gradient-to-r from-secondary to-secondary/80 text-white shadow-lg shadow-secondary/20 scale-105"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon
              size={20}
              className={cn(
                tab.id === activeTab ? "text-white" : "text-white/50 group-hover:text-white transition-colors"
              )}
            />
            {tab.label}
          </button>
        ))}

        <button
          onClick={() => navigate("/user-dashboard")}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm group text-left text-white/60 hover:text-white hover:bg-white/5"
          title="Go to Buyer Dashboard"
        >
          <ShoppingBag size={20} className="text-white/50 group-hover:text-white transition-colors" />
          Buyer Dashboard
        </button>
      </div>

      <div className="mt-auto p-4 border-t border-white/10 space-y-2">
        <button
          onClick={onReportProblem}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 bg-white/5 hover:bg-red-500/20 hover:text-red-200 transition-all font-black"
          title="Report a problem"
        >
          <AlertTriangle size={18} /> Report Problem
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:bg-red-500/20 hover:text-red-300 transition-all font-bold"
        >
          <LogOut size={18} /> Logout Session
        </button>
      </div>
    </aside>
  );
}

export default function SellerDashboardd() {
  const navigate = useNavigate();
  const { session: userInfo, key: sessionKey } = getSellerSessionWithKey();
  const [activeTab, setActiveTab] = useState("overview");
  const [me, setMe] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [listingsPage, setListingsPage] = useState(1);
  const listingsPageSize = 10;
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ price: "", stockQuantity: "", status: "available" });
  const [saving, setSaving] = useState(false);

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    category: "Books",
    condition: "New",
    price: "",
    stockQuantity: "1",
    imageUrl: ""
  });
  const [createImage, setCreateImage] = useState(null);
  const [creating, setCreating] = useState(false);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !q || String(item.title || "").toLowerCase().includes(q);
      return matchesSearch;
    });
  }, [items, searchQuery]);

  useEffect(() => {
    setListingsPage(1);
  }, [searchQuery, statusFilter]);

  const listingsTotalPages = Math.max(1, Math.ceil(filteredItems.length / listingsPageSize));
  const listingsSafePage = Math.min(listingsPage, listingsTotalPages);
  const listingsStartIndex = (listingsSafePage - 1) * listingsPageSize;
  const listingsEndIndex = listingsStartIndex + listingsPageSize;
  const pagedListings = filteredItems.slice(listingsStartIndex, listingsEndIndex);

  useEffect(() => {
    setListingsPage((p) => Math.min(p, listingsTotalPages));
  }, [listingsTotalPages]);

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => i.status === "available").length;
    const pending = items.filter((i) => i.status === "pending").length;
    const sold = items.filter((i) => i.status === "sold").length;
    const inventoryValue = items.reduce((sum, i) => sum + (Number(i.price || 0) * Number(i.stockQuantity || 0)), 0);
    return { total, active, pending, sold, inventoryValue };
  }, [items]);

  const ensureAuth = () => {
    if (!userInfo.token) {
      navigate("/");
      return false;
    }
    if (String(userInfo.role || "").toLowerCase() !== "seller") {
      toast.info("Please login as a seller to access the Seller Dashboard.");
      navigate("/user-dashboard");
      return false;
    }
    return true;
  };

  const fetchMyItems = async () => {
    try {
      if (!ensureAuth()) return;
      setLoading(true);
      const res = await axios.get(`/api/items/mine?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      if (res.data?.success) setItems(res.data.data || []);
    } catch (err) {
      console.error("Error fetching seller items:", err);
      toast.error(err.response?.data?.message || "Failed to load your listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ensureAuth()) return;
    const verifySession = async () => {
      try {
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        if (res.status === 401 || res.status === 403) {
          toast.error("Session expired. You have been signed out.");
          clearSession(sessionKey);
          navigate("/");
        } else if (res.ok) {
          const freshMe = await res.json();
          setMe(freshMe);
        }
      } catch (err) {
        console.error("Session validation error:", err);
      }
    };
    verifySession();
  }, [navigate, userInfo.token, userInfo.role, sessionKey]);

  useEffect(() => {
    if (activeTab === "overview" || activeTab === "listings") {
      fetchMyItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, statusFilter]);

  const handleLogout = () => {
    clearSession(sessionKey);
    navigate("/");
  };

  const openReportProblem = () => {
    setActiveTab("reports");
    setReportModalOpen(true);
  };

  useEffect(() => {
    if (activeTab !== "reports" && reportModalOpen) setReportModalOpen(false);
  }, [activeTab, reportModalOpen]);

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditDraft({
      price: String(item.price ?? ""),
      stockQuantity: String(item.stockQuantity ?? ""),
      status: item.status || "available"
    });
  };

  const saveEdit = async (id) => {
    try {
      if (!ensureAuth()) return;
      setSaving(true);
      const payload = {
        price: Number(editDraft.price),
        stockQuantity: Number(editDraft.stockQuantity),
        status: editDraft.status
      };
      const res = await axios.put(`/api/items/${id}`, payload, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      if (res.data?.success) {
        toast.success("Listing updated", { autoClose: 1200 });
        setItems((prev) => prev.map((it) => (it._id === id ? res.data.data : it)));
        setEditingId(null);
      }
    } catch (err) {
      console.error("Error updating item:", err);
      toast.error(err.response?.data?.message || "Failed to update listing.");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    try {
      if (!ensureAuth()) return;
      await axios.delete(`/api/items/${id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      toast.success("Listing deleted", { autoClose: 1200 });
      setItems((prev) => prev.filter((it) => it._id !== id));
    } catch (err) {
      console.error("Error deleting item:", err);
      toast.error(err.response?.data?.message || "Failed to delete listing.");
    }
  };

  const createListing = async (e) => {
    e.preventDefault();
    try {
      if (!ensureAuth()) return;
      setCreating(true);

      const formData = new FormData();
      formData.append("title", createForm.title);
      formData.append("description", createForm.description);
      formData.append("category", createForm.category);
      formData.append("condition", createForm.condition);
      formData.append("price", String(createForm.price));
      formData.append("stockQuantity", String(createForm.stockQuantity));
      if (createForm.imageUrl) formData.append("imageUrl", createForm.imageUrl);
      if (createImage) formData.append("image", createImage);

      const res = await axios.post("/api/items", formData, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });

      if (res.data?.success) {
        toast.success("Listing created!");
        setCreateForm({
          title: "",
          description: "",
          category: "Books",
          condition: "New",
          price: "",
          stockQuantity: "1",
          imageUrl: ""
        });
        setCreateImage(null);
        setActiveTab("listings");
      }
    } catch (err) {
      console.error("Error creating listing:", err);
      toast.error(err.response?.data?.message || "Failed to create listing.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <SellerNavbar user={me || userInfo} />

      <div className="flex flex-1 min-w-0 pt-20">
        <SellerSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          onReportProblem={openReportProblem}
        />

        <main className="flex-1 min-w-0 lg:ml-64 p-4 md:p-8 lg:p-10 space-y-8 animate-in fade-in duration-700 overflow-x-hidden">
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-primary tracking-tight">Store Overview</h1>
                  <p className="text-muted-foreground font-medium">Track your listings and keep your storefront fresh</p>
                </div>
                <button
                  onClick={() => setActiveTab("create")}
                  className="px-6 py-2.5 bg-secondary text-white rounded-xl font-bold shadow-lg shadow-secondary/20 hover:bg-secondary/90 transition-all inline-flex items-center gap-2"
                >
                  <PlusCircle size={18} /> New Listing
                </button>
              </div>

              {loading ? (
                <div className="h-[260px] flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-muted-foreground font-bold">Loading your store data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {[
                    { label: "Total Listings", value: stats.total },
                    { label: "Active", value: stats.active },
                    { label: "Pending", value: stats.pending },
                    { label: "Sold", value: stats.sold },
                    { label: "Inventory Value", value: `LKR ${stats.inventoryValue.toLocaleString()}` }
                  ].map((s, i) => (
                    <div key={i} className="rounded-2xl border bg-card p-6 shadow-xl shadow-black/5 hover:scale-[1.02] transition-transform">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{s.label}</p>
                      <h3 className="text-2xl font-black text-primary">{s.value}</h3>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-3xl border bg-card shadow-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-primary tracking-tight">Quick Actions</h3>
                    <p className="text-sm text-muted-foreground font-medium">Jump into listings management or create a new item</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveTab("listings")}
                      className="px-5 py-2.5 rounded-xl bg-primary/5 text-primary font-black text-xs uppercase tracking-widest border border-primary/10 hover:bg-primary hover:text-white transition-colors"
                    >
                      Manage Listings
                    </button>
                    <button
                      onClick={() => setActiveTab("create")}
                      className="px-5 py-2.5 rounded-xl bg-secondary text-white font-black text-xs uppercase tracking-widest hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20"
                    >
                      Create Listing
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LISTINGS */}
          {activeTab === "listings" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-primary tracking-tight">My Listings</h1>
                  <p className="text-muted-foreground font-medium">Edit prices, update stock, and keep items accurate</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white px-4 py-2.5 rounded-xl border shadow-sm text-[11px] font-black uppercase tracking-widest text-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer transition-all hover:border-primary/50"
                  >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="sold">Sold</option>
                  </select>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search my listings..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl border bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={fetchMyItems}
                    className="px-4 py-2 rounded-xl bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest border border-primary/10 hover:bg-primary hover:text-white transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="h-[360px] flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-muted-foreground font-bold">Loading your listings...</p>
                </div>
              ) : (
                <div className="rounded-3xl border bg-card shadow-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/10 border-b">
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Item</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Status</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Price</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Stock</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {pagedListings.map((item) => (
                          <tr key={item._id} className="hover:bg-muted/30 transition-all group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl overflow-hidden border shadow-sm flex-shrink-0">
                                  <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-black text-sm text-primary leading-tight line-clamp-1">{item.title}</p>
                                  <p className="text-[9px] text-muted-foreground font-bold mt-1 uppercase">Category: {item.category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {editingId === item._id ? (
                                <select
                                  value={editDraft.status}
                                  onChange={(e) => setEditDraft((p) => ({ ...p, status: e.target.value }))}
                                  className="px-3 py-2 rounded-xl border bg-white text-[11px] font-black uppercase tracking-widest text-primary"
                                >
                                  <option value="available">available</option>
                                  <option value="pending">pending</option>
                                  <option value="sold">sold</option>
                                </select>
                              ) : (
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                  item.status === "available" ? "bg-green-100 text-green-700" :
                                  item.status === "pending" ? "bg-amber-100 text-amber-700" :
                                                          "bg-red-100 text-red-700"
                                )}>
                                  {item.status}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {editingId === item._id ? (
                                <input
                                  type="number"
                                  value={editDraft.price}
                                  onChange={(e) => setEditDraft((p) => ({ ...p, price: e.target.value }))}
                                  className="w-28 px-3 py-2 rounded-xl border bg-white text-sm font-black text-primary text-center"
                                />
                              ) : (
                                <span className="text-sm font-black text-primary">LKR {Number(item.price || 0).toLocaleString()}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {editingId === item._id ? (
                                <input
                                  type="number"
                                  value={editDraft.stockQuantity}
                                  onChange={(e) => setEditDraft((p) => ({ ...p, stockQuantity: e.target.value }))}
                                  className="w-20 px-3 py-2 rounded-xl border bg-white text-sm font-black text-primary text-center"
                                />
                              ) : (
                                <span className="text-sm font-black text-primary">{item.stockQuantity || 0}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {editingId === item._id ? (
                                <div className="inline-flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => saveEdit(item._id)}
                                    disabled={saving}
                                    className="p-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all shadow-md shadow-green-500/20 disabled:opacity-50"
                                  >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all border"
                                  >
                                    <X size={18} />
                                  </button>
                                </div>
                              ) : (
                                <div className="inline-flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => startEdit(item)}
                                    className="p-2 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all"
                                    title="Edit listing"
                                  >
                                    <Edit3 size={18} />
                                  </button>
                                  <button
                                    onClick={() => deleteItem(item._id)}
                                    className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                                    title="Delete listing"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                        {filteredItems.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground font-bold">
                              No listings found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-6 border-t bg-muted/10">
                    <PaginationControls
                      currentPage={listingsSafePage}
                      totalPages={listingsTotalPages}
                      onPageChange={setListingsPage}
                      from={filteredItems.length === 0 ? 0 : listingsStartIndex + 1}
                      to={Math.min(listingsEndIndex, filteredItems.length)}
                      total={filteredItems.length}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TRANSACTIONS */}
          {activeTab === "transactions" && <SellerAnalytic />}

          {/* REPORTS */}
          {activeTab === "reports" && (
            <SellerReportsTab
              reportModalOpen={reportModalOpen}
              setReportModalOpen={setReportModalOpen}
              onGoToListings={() => setActiveTab("listings")}
            />
          )}

          {/* CREATE */}
          {activeTab === "create" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-primary tracking-tight">Create Listing</h1>
                  <p className="text-muted-foreground font-medium">Add a new item to the marketplace</p>
                </div>
              </div>

              <form onSubmit={createListing} className="rounded-3xl border bg-card shadow-xl p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title</label>
                    <input
                      value={createForm.title}
                      onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border bg-white text-sm font-bold"
                      placeholder="e.g. Calculus Textbook"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</label>
                    <textarea
                      value={createForm.description}
                      onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border bg-white text-sm font-medium"
                      rows={4}
                      placeholder="Short, honest description..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</label>
                    <select
                      value={createForm.category}
                      onChange={(e) => setCreateForm((p) => ({ ...p, category: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border bg-white text-sm font-bold"
                    >
                      <option>Books</option>
                      <option>Electronics</option>
                      <option>Lab Equipment</option>
                      <option>Clothing & Uniforms</option>
                      <option>Sports & Fitness</option>
                      <option>Services & Tutoring</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Condition</label>
                    <select
                      value={createForm.condition}
                      onChange={(e) => setCreateForm((p) => ({ ...p, condition: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border bg-white text-sm font-bold"
                    >
                      <option>New</option>
                      <option>Like New</option>
                      <option>Used</option>
                      <option>Refurbished</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price (LKR)</label>
                    <input
                      type="number"
                      value={createForm.price}
                      onChange={(e) => setCreateForm((p) => ({ ...p, price: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border bg-white text-sm font-black text-primary"
                      placeholder="2500"
                      required
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stock Quantity</label>
                    <input
                      type="number"
                      value={createForm.stockQuantity}
                      onChange={(e) => setCreateForm((p) => ({ ...p, stockQuantity: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border bg-white text-sm font-black text-primary"
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Image Upload (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCreateImage(e.target.files?.[0] || null)}
                      className="w-full text-sm"
                    />
                    <div className="text-[10px] text-muted-foreground font-bold">
                      Or provide an image URL:
                    </div>
                    <input
                      value={createForm.imageUrl}
                      onChange={(e) => setCreateForm((p) => ({ ...p, imageUrl: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl border bg-white text-sm font-medium"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab("listings")}
                    className="px-6 py-3 rounded-2xl border font-black text-xs uppercase tracking-widest text-muted-foreground hover:bg-muted/30 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-7 py-3 rounded-2xl bg-secondary text-white font-black text-xs uppercase tracking-widest hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20 disabled:opacity-60"
                  >
                    {creating ? "Publishing..." : "Publish Listing"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && <SellerSettingsTab user={me} onUserUpdated={setMe} />}
        </main>
      </div>
    </div>
  );
}
