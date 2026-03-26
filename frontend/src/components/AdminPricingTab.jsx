import React, { useState, useEffect } from "react";
import axios from "axios";
import { cn } from '../lib/utils';
import { 
  Tag, Package, Percent, BadgeDollarSign, 
  Search, Loader2, Edit3, Save, X, ShoppingBag,
  CheckCircle
} from "lucide-react";
import { toast } from "react-toastify";
import { getAdminSessionWithKey } from "../lib/session";
import { PaginationControls } from "./shared/PaginationControls";

export function AdminPricingTab({ onOpenPaymentReports = () => {} }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [editingId, setEditingId] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [platformFee, setPlatformFee] = useState(5);
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [tempFee, setTempFee] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showFeeSuccess, setShowFeeSuccess] = useState(false);

  const categories = [
    "All Categories",
    "Books",
    "Electronics",
    "Lab Equipment",
    "Clothing & Uniforms",
    "Sports & Fitness",
    "Services & Tutoring",
    "Other"
  ];

  const fetchItems = async (category = "All Categories") => {
    try {
      setLoading(true);
      const [itemsRes, settingsRes] = await Promise.all([
        axios.get(`/api/items?category=${category}`),
        axios.get("/api/settings")
      ]);
      
      if (itemsRes.data.success) {
        setItems(itemsRes.data.data);
      }
      if (settingsRes.data.success) {
        setPlatformFee(settingsRes.data.data.platformFee);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load products for pricing management.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(selectedCategory);
  }, [selectedCategory]);

  const handleUpdateFee = async () => {
    if (!tempFee || isNaN(tempFee) || Number(tempFee) < 0 || Number(tempFee) > 100) {
      toast.warn("Invalid fee percentage! Please enter a value between 0 and 100.");
      return;
    }

    try {
      setIsUpdating(true);
      toast.info("Updating platform fee...", { autoClose: 1000 });
      const { session: userInfo } = getAdminSessionWithKey();
      const response = await axios.put("/api/settings", 
        { platformFee: Number(tempFee) },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      if (response.data.success) {
        setPlatformFee(Number(tempFee));
        setShowFeeSuccess(true);
        toast.success(`Platform fee set to ${Number(tempFee)}%`, {
          icon: <CheckCircle className="text-emerald-500" size={18} />,
          style: { background: "#ecfdf3", color: "#166534", fontWeight: 700 },
          progressStyle: { background: "#22c55e" }
        });
        setIsEditingFee(false);
        setTimeout(() => setShowFeeSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error updating fee:", err);
      toast.error("Failed to update platform fee.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePrice = async (id) => {
    if (!newPrice || isNaN(newPrice) || Number(newPrice) <= 0) {
      toast.warn("Invalid price! Please enter a positive numerical value.");
      return;
    }

    try {
      setIsUpdating(true);
      toast.info("Updating product price...", { autoClose: 1000 });
      const { session: userInfo } = getAdminSessionWithKey();
      const response = await axios.put(`/api/items/${id}`, 
        { price: Number(newPrice) },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      if (response.data.success) {
        setItems(items.map(item => item._id === id ? { ...item, price: Number(newPrice) } : item));
        toast.success("Price updated successfully!");
        setEditingId(null);
        setNewPrice("");
      }
    } catch (err) {
      console.error("Error updating price:", err);
      toast.error("Failed to update price.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedItems = filteredItems.slice(startIndex, endIndex);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  if (loading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold">Fetching product data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Pricing Management</h1>
          <p className="text-muted-foreground font-medium">Control platform-wide product pricing and monitor revenue</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPaymentReports}
            className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-colors"
          >
            Payment Reports
          </button>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border bg-card text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Platform Fee Card */}
        <div className="rounded-2xl border bg-card p-6 shadow-xl flex items-center gap-4 hover:scale-[1.02] transition-transform group relative overflow-hidden">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner bg-primary/10 text-primary")}>
            <Percent size={26} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Platform Fee</p>
            {isEditingFee ? (
              <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
                <input 
                  type="number"
                  className="w-16 px-2 py-1 rounded-lg border bg-background text-lg font-black focus:ring-2 focus:ring-primary/20 outline-none"
                  value={tempFee}
                  onChange={(e) => setTempFee(e.target.value)}
                  autoFocus
                  onBlur={() => !tempFee && setIsEditingFee(false)}
                />
                <span className="font-black text-primary">%</span>
                <div className="flex items-center gap-1 ml-auto">
                  <button 
                    onClick={handleUpdateFee}
                    disabled={isUpdating}
                    className="p-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all shadow-sm"
                  >
                    {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  </button>
                  <button 
                    onClick={() => { setIsEditingFee(false); setTempFee(""); }}
                    className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between group-hover:pr-2 transition-all">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-primary">{platformFee}%</h3>
                  {showFeeSuccess && (
                     <div className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-100 px-2 py-0.5 rounded-full animate-in zoom-in-95 duration-300">
                        <CheckCircle size={10} /> UPDATED
                     </div>
                  )}
                </div>
                <button 
                  onClick={() => { setIsEditingFee(true); setTempFee(platformFee); }}
                  className="p-2 rounded-lg bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white"
                  title="Edit Platform Fee"
                >
                  <Edit3 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {[
          { label: "Avg. Product Price", value: `LKR ${(items.reduce((sum, item) => sum + item.price, 0) / (items.length || 1)).toFixed(0).toLocaleString()}`, icon: Tag, color: "bg-secondary/10 text-secondary" },
          { label: "Total Inventory Value", value: `LKR ${items.reduce((sum, item) => sum + (item.price * (item.stockQuantity || 1)), 0).toLocaleString()}`, icon: Package, color: "bg-purple-100 text-purple-600" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border bg-card p-6 shadow-xl flex items-center gap-4 hover:scale-[1.02] transition-transform">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner", s.color)}>
              <s.icon size={26} />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className="text-2xl font-black text-primary">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Product Pricing Table */}
      <div className="rounded-3xl border bg-card shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-secondary text-white rounded-xl shadow-lg shadow-secondary/20">
              <BadgeDollarSign size={24} />
            </div>
            <div>
              <h3 className="font-black text-primary text-lg leading-tight">Product Price Controls</h3>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage individual listing prices across the platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">Filter By:</span>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white px-4 py-2.5 pr-10 rounded-xl border shadow-sm text-[11px] font-black uppercase tracking-widest text-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer transition-all hover:border-primary/50"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                <Search size={14} className="rotate-90" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/10 border-b">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product Details</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Current Price</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stock</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {pagedItems.map((item) => (
                <tr key={item._id} className="hover:bg-muted/30 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-black text-sm text-primary leading-tight line-clamp-1">{item.title}</p>
                        <p className="text-[9px] text-muted-foreground font-bold mt-1 uppercase">Seller: {item.seller?.firstName || "System"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/10 uppercase">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {editingId === item._id ? (
                        <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-200">
                          <span className="text-sm font-bold text-muted-foreground whitespace-nowrap">LKR</span>
                          <input 
                            type="number"
                            className="w-24 px-3 py-1.5 rounded-lg border bg-background text-sm font-black focus:ring-2 focus:ring-secondary/20 outline-none"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdatePrice(item._id)}
                          />
                        </div>
                      ) : (
                        <div className="text-lg font-black text-foreground tabular-nums">
                          LKR {item.price.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <Package size={14} className={cn(item.stockQuantity < 5 ? "text-amber-500" : "text-muted-foreground")} />
                       <span className={cn("text-xs font-black", item.stockQuantity < 5 ? "text-amber-600" : "text-primary")}>
                         {item.stockQuantity || 0}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingId === item._id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleUpdatePrice(item._id)}
                          disabled={isUpdating}
                          className="p-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all shadow-md shadow-green-500/20 disabled:opacity-50"
                        >
                          {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        </button>
                        <button 
                          onClick={() => { setEditingId(null); setNewPrice(""); }}
                          className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all border"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setEditingId(item._id); setNewPrice(item.price); }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all font-black text-xs uppercase"
                      >
                        <Edit3 size={14} /> Update Price
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                      <ShoppingBag size={48} className="text-muted-foreground" />
                      <p className="text-muted-foreground font-black text-lg">
                        {selectedCategory === "All Categories" 
                          ? "No products found for pricing adjustment." 
                          : `No products found in the "${selectedCategory}" category.`}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t bg-muted/10">
          <PaginationControls
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
            from={filteredItems.length === 0 ? 0 : startIndex + 1}
            to={Math.min(endIndex, filteredItems.length)}
            total={filteredItems.length}
          />
        </div>
      </div>

      {/* Platform Note */}
      <div className="p-6 bg-gradient-to-r from-primary to-[#001f5c] rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={18} className="text-secondary" />
              <h4 className="font-black uppercase tracking-widest text-xs text-secondary">Admin Notification</h4>
            </div>
            <h3 className="text-xl font-black mb-1">Pricing Overrides</h3>
            <p className="text-white/70 text-sm font-medium">As an administrator, you have the authority to override seller listing prices to comply with platform regulations or campaign requirements.</p>
          </div>
          <BadgeDollarSign size={80} className="text-white/10 absolute -right-4 -bottom-4 rotate-12" />
        </div>
      </div>
    </div>
  );
}
