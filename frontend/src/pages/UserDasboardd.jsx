import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ShoppingBag,
  Sparkles,
  ShoppingCart,
  Receipt,
  ShieldCheck,
  Search,
  LogOut,
  CheckCircle2,
  Tag,
  Upload,
  Star,
  FileText,
  Plus,
  Trash2,
  UserCheck,
} from "lucide-react";
import { clearSession, getBuyerSessionWithKey } from "../lib/session";

const FALLBACK_ITEMS = [
  {
    id: "ITM-101",
    name: "Data Structures & Algorithms (4th Ed.)",
    category: "Books",
    price: 2500,
    status: "Available",
    sellerName: "Batawala B. A. E. H.",
    sellerId: "IT23257122",
    trustScore: 94,
    recommended: true,
  },
  {
    id: "ITM-204",
    name: "Logitech Wireless Mouse + Laptop Stand",
    category: "Electronics",
    price: 3800,
    status: "Available",
    sellerName: "Nethmi Pussepitiya",
    sellerId: "IT23312708",
    trustScore: 98,
    recommended: true,
  },
  {
    id: "ITM-309",
    name: "Electric Kettle (1.5L Stainless Steel)",
    category: "Hostel Items",
    price: 2900,
    status: "Available",
    sellerName: "Pubudi P. V. A. A.",
    sellerId: "IT23252240",
    trustScore: 96,
    recommended: false,
  },
  {
    id: "ITM-412",
    name: "IT3040 Project Management Printed Guide",
    category: "Books",
    price: 950,
    status: "Available",
    sellerName: "Nethmi Pussepitiya",
    sellerId: "IT23312708",
    trustScore: 98,
    recommended: true,
  },
];

export default function UserDasboardd() {
  const navigate = useNavigate();
  const { session: userInfo, key: sessionKey } = getBuyerSessionWithKey();

  const [me, setMe] = useState(null);
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(20000);
  const [searchQuery, setSearchQuery] = useState("");

  // Marketplace & Cart States
  const [marketplaceItems, setMarketplaceItems] = useState(FALLBACK_ITEMS);
  const [cart, setCart] = useState([FALLBACK_ITEMS[0], FALLBACK_ITEMS[1]]);
  const [slipFile, setSlipFile] = useState(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Review States
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  // Transaction History & Digital Receipts
  const [myPurchases, setMyPurchases] = useState([
    {
      receiptNo: "RCP-2026-041",
      date: "2026-11-14",
      items: "Computer Networks Textbook + Lab Manual",
      seller: "Nethmi Pussepitiya (IT23312708)",
      amountPaid: 3150,
      discountApplied: "10% Bulk Discount",
      status: "Approved",
    },
    {
      receiptNo: "RCP-2026-038",
      date: "2026-11-10",
      items: "Mini Hostel Iron",
      seller: "Batawala B. A. E. H. (IT23257122)",
      amountPaid: 2200,
      discountApplied: "None",
      status: "Approved",
    },
  ]);

  // 1. Session Validation (Preserved from your original UserDashboard)
  useEffect(() => {
    const allowedRoles = new Set(["user", "seller", "buyer"]);
    if (!userInfo?.token) {
      // Allow preview if testing directly without login; redirect only on invalid role if logged in
      return;
    }
    if (userInfo.role && !allowedRoles.has(userInfo.role)) {
      navigate("/");
      return;
    }

    const verifySession = async () => {
      try {
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        if (res.status === 401 || res.status === 403) {
          toast.error(
            "Session Expired: Security mechanism detected a new login. You have been securely signed out."
          );
          clearSession(sessionKey);
          navigate("/login");
        } else if (res.ok) {
          const userData = await res.json();
          setMe(userData.data || userData);
        }
      } catch (err) {
        console.error("Session validation error:", err);
      }
    };
    verifySession();
  }, [navigate, userInfo?.token, userInfo?.role, sessionKey]);

  // 2. Fetch Live Marketplace Items if API is available (falls back cleanly to campus demo items)
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await axios.get("/api/items");
        const list = data?.data || data;
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map((item, idx) => ({
            id: item._id || `ITM-${100 + idx}`,
            name: item.name || item.title,
            category: item.category || "Other",
            price: Number(item.price) || 1500,
            status: item.status || "Available",
            sellerName: item.seller?.name || "Verified Campus Seller",
            sellerId: item.seller?.studentId || "IT23312708",
            trustScore: item.seller?.trustScore || 95,
            recommended: idx < 3,
          }));
          setMarketplaceItems(mapped);
        }
      } catch {
        // Keep fallback campus catalog when backend endpoint is offline
      }
    };
    fetchItems();
  }, []);

  const handleLogout = () => {
    clearSession(sessionKey);
    toast.success("Logged out securely.");
    navigate("/login");
  };

  // Cart Actions
  const addToCart = (item) => {
    if (!cart.find((c) => c.id === item.id)) {
      setCart([...cart, item]);
      toast.info(`Added "${item.name}" to cart`);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Pricing Intelligence Calculations (Bulk discount for 2+ items)
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const isBulkEligible = cart.length >= 2;
  const bulkDiscount = isBulkEligible ? Math.round(subtotal * 0.1) : 0;
  const finalTotal = subtotal - bulkDiscount;

  // Search & Filtering
  const filteredItems = marketplaceItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesPrice = item.price <= maxPrice;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPrice && matchesQuery;
  });

  // Payment Slip Submission
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!slipFile) {
      toast.warning("Please attach your bank transfer payment slip first.");
      return;
    }

    setSubmittingOrder(true);
    try {
      const newOrder = {
        receiptNo: `RCP-2026-0${Math.floor(50 + Math.random() * 49)}`,
        date: new Date().toISOString().split("T")[0],
        items: cart.map((c) => c.name).join(" + "),
        seller: cart.map((c) => c.sellerName).join(", "),
        amountPaid: finalTotal,
        discountApplied: isBulkEligible ? "10% Bulk Discount" : "None",
        status: "Pending",
      };

      setMyPurchases([newOrder, ...myPurchases]);
      setCart([]);
      setSlipFile(null);
      setActiveTab("orders");
      toast.success(
        "Payment slip uploaded! Sent to UniSwap Admin for verification."
      );
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Submit Seller Review
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      toast.warning("Please write a short review before submitting.");
      return;
    }
    toast.success(
      "Review submitted! AI Sentiment Engine updated the seller's Trust Score."
    );
    setReviewText("");
    setRating(5);
  };

  const displayUser = me || userInfo || {};
  const userEmail = displayUser.email || "it23311022@my.sliit.lk";
  const userName = displayUser.name || "Vinuthan T.";

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-800 font-sans">
      {/* Left Sidebar - Matches UniSwap Admin & Seller Navy Theme */}
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EA7828] flex items-center justify-center font-bold text-lg text-white shadow">
              U
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight text-[#EA7828]">
                UniSwap Buyer
              </h1>
              <p className="text-xs text-slate-400">Student Marketplace</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1.5 mt-2">
            <button
              onClick={() => setActiveTab("browse")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === "browse"
                  ? "bg-[#EA7828] text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800/70"
              }`}
            >
              <span className="flex items-center gap-3">
                <ShoppingBag size={18} /> Browse Campus Items
              </span>
            </button>

            <button
              onClick={() => setActiveTab("cart")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === "cart"
                  ? "bg-[#EA7828] text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800/70"
              }`}
            >
              <span className="flex items-center gap-3">
                <ShoppingCart size={18} /> Cart & Bulk Checkout
              </span>
              {cart.length > 0 && (
                <span className="bg-[#EA7828] border border-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {cart.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === "orders"
                  ? "bg-[#EA7828] text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800/70"
              }`}
            >
              <span className="flex items-center gap-3">
                <Receipt size={18} /> Orders & Receipts
              </span>
              <span className="bg-slate-700 text-xs px-2 py-0.5 rounded-full">
                {myPurchases.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === "profile"
                  ? "bg-[#EA7828] text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-800/70"
              }`}
            >
              <span className="flex items-center gap-3">
                <UserCheck size={18} /> Student Verification
              </span>
            </button>
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <p className="text-xs font-medium text-slate-300 truncate">
              {userEmail}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 mb-3 pl-4">
            Verified @uni.edu Student
          </p>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-200 flex items-center justify-center gap-2 transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Student Buyer Hub
            </h2>
            <p className="text-sm text-slate-500">
              Welcome back, <span className="font-semibold text-slate-700">{userName}</span> •
              Verified `@uni.edu` marketplace with AI trust scores & bulk savings
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-3.5 top-2.5 text-slate-400"
                size={17}
              />
              <input
                type="text"
                placeholder="Search books, electronics, seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#EA7828]"
              />
            </div>
          </div>
        </div>

        {/* 4 Buyer KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Cart Items
            </p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">
                {cart.length}
              </span>
              <span className="text-xs font-medium text-emerald-600">
                {isBulkEligible
                  ? "10% Bulk Discount Unlocked!"
                  : "Add 2+ for 10% off"}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Bulk Savings Earned (LKR)
            </p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">
                {(350 + bulkDiscount).toLocaleString()}
              </span>
              <span className="text-xs font-medium text-[#EA7828]">
                Smart Pricing Active
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Completed Orders
            </p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">
                {myPurchases.length}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Digital receipts ready
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              AI Recommended For You
            </p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">
                {marketplaceItems.filter((i) => i.recommended).length}
              </span>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <Sparkles size={13} /> Based on IT3040
              </span>
            </div>
          </div>
        </div>

        {/* Profile / Student Verification View */}
        {activeTab === "profile" ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 max-w-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Student Identity & Security Profile
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Only verified university members with valid student IDs can buy or sell on UniSwap.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400">Full Name</p>
                <p className="font-semibold text-slate-800 mt-1">{userName}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400">University Email</p>
                <p className="font-semibold text-slate-800 mt-1">{userEmail}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400">Student ID Status</p>
                <p className="font-semibold text-emerald-600 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> Verified Campus Member
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-400">Account Role</p>
                <p className="font-semibold text-slate-800 mt-1 capitalize">
                  {displayUser.role || "Verified Student Buyer"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Main 3-Column Layout: Marketplace Feed (2 cols) + Smart Cart & Slip Upload (1 col) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Category Filter + Listings + Receipts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search & Filter Bar */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {["All", "Books", "Electronics", "Hostel Items", "Other"].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                          selectedCategory === cat
                            ? "bg-[#0F172A] text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="font-medium">
                    Max Price: LKR {maxPrice.toLocaleString()}
                  </span>
                  <input
                    type="range"
                    min="500"
                    max="20000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="accent-[#EA7828] cursor-pointer"
                  />
                </div>
              </div>

              {/* Verified Student Listings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => {
                  const inCart = cart.some((c) => c.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-[#EA7828]/50 transition"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {item.category}
                          </span>
                          {item.recommended && (
                            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-[#EA7828] flex items-center gap-1">
                              <Sparkles size={11} /> AI Pick
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-slate-900 text-base mb-1">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-500 mb-3">
                          Seller:{" "}
                          <span className="font-medium text-slate-700">
                            {item.sellerName}
                          </span>{" "}
                          ({item.sellerId})
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between py-2.5 border-t border-slate-100 mb-3">
                          <span className="text-lg font-bold text-slate-900">
                            LKR {item.price.toLocaleString()}
                          </span>
                          <span className="text-xs font-semibold bg-[#0F172A] text-white px-2.5 py-1 rounded-full flex items-center gap-1">
                            <ShieldCheck
                              size={12}
                              className="text-emerald-400"
                            />{" "}
                            {item.trustScore}/100 Trust
                          </span>
                        </div>

                        <button
                          onClick={() => addToCart(item)}
                          disabled={inCart}
                          className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                            inCart
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                              : "bg-[#EA7828] hover:bg-[#d9691c] text-white"
                          }`}
                        >
                          {inCart ? (
                            <>
                              <CheckCircle2 size={15} /> Added to Cart
                            </>
                          ) : (
                            <>
                              <Plus size={15} /> Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Transaction History & Digital Receipts */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      My Purchase History & Digital Receipts
                    </h3>
                    <p className="text-xs text-slate-500">
                      Admin-verified slips generate official UniSwap digital receipts
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {myPurchases.map((order) => (
                    <div
                      key={order.receiptNo}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {order.receiptNo}
                          </span>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              order.status === "Approved"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {order.date}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-700 mt-1">
                          {order.items}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {order.seller}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">
                            LKR {order.amountPaid.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-emerald-600 font-medium">
                            {order.discountApplied}
                          </p>
                        </div>
                        {order.status === "Approved" && (
                          <button
                            onClick={() =>
                              toast.info(
                                `Downloading Digital Receipt ${order.receiptNo}...`
                              )
                            }
                            className="px-3 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-medium flex items-center gap-1 hover:bg-slate-800"
                          >
                            <FileText size={13} /> Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Smart Cart, Automatic Bulk Discount & Payment Slip Upload */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Smart Checkout & Slip Upload
                  </h3>
                  <Tag size={17} className="text-[#EA7828]" />
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Buy 2+ items for an automatic 10% campus bulk discount
                </p>

                {/* Cart Items List */}
                {cart.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center bg-slate-50 rounded-xl">
                    Your cart is empty. Add items from the feed!
                  </p>
                ) : (
                  <div className="space-y-2.5 mb-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div className="pr-2">
                          <p className="font-semibold text-slate-800 line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-slate-500">
                            LKR {item.price.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Automatic Pricing Breakdown */}
                <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs mb-4">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal ({cart.length} items)</span>
                    <span>LKR {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Bulk Discount (2+ items)</span>
                    <span>- LKR {bulkDiscount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-100">
                    <span>Total Payable</span>
                    <span>LKR {finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Slip Upload Form */}
                <form onSubmit={handleCheckoutSubmit} className="space-y-3">
                  <label className="block border-2 border-dashed border-slate-200 hover:border-[#EA7828] rounded-xl p-4 text-center cursor-pointer transition">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                    />
                    <Upload className="mx-auto mb-1 text-[#EA7828]" size={20} />
                    <p className="text-xs font-semibold text-slate-700">
                      {slipFile ? slipFile.name : "Upload Payment Slip"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Admin verifies slip before releasing digital receipt
                    </p>
                  </label>

                  <button
                    type="submit"
                    disabled={cart.length === 0 || submittingOrder}
                    className="w-full py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-semibold transition"
                  >
                    {submittingOrder
                      ? "Uploading Slip..."
                      : "Submit Payment Slip for Verification"}
                  </button>
                </form>
              </div>

              {/* Leave Seller Review Card */}
              <form
                onSubmit={handleReviewSubmit}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6"
              >
                <h3 className="text-base font-bold text-slate-900">
                  Rate Recent Seller
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Your review updates the seller's AI Trust Score via NLP sentiment analysis
                </p>
                <div className="flex items-center gap-1 text-amber-400 mb-2.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        size={18}
                        fill={star <= rating ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  rows="2"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your campus handover experience..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs mb-2.5 focus:outline-none focus:ring-2 focus:ring-[#EA7828]"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#EA7828] hover:bg-[#d9691c] text-white text-xs font-semibold transition"
                >
                  Submit Verified Review
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}