import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Fallback realistic campus data so the dashboard works seamlessly even before backend endpoints are wired
const MOCK_USERS = [
  {
    _id: "u1",
    name: "Nethmi Pussepitiya",
    email: "it23312708@uni.edu",
    studentId: "IT23312708",
    role: "seller",
    verified: true,
    sellerRequest: { status: "approved", submittedAt: "2026-10-12" },
    trustScore: 98,
  },
  {
    _id: "u2",
    name: "Vinuthan T.",
    email: "it23311022@uni.edu",
    studentId: "IT23311022",
    role: "student",
    verified: true,
    sellerRequest: { status: "pending", submittedAt: "2026-11-15" },
    trustScore: 91,
  },
  {
    _id: "u3",
    name: "Batawala B. A. E. H.",
    email: "it23257122@uni.edu",
    studentId: "IT23257122",
    role: "seller",
    verified: true,
    sellerRequest: { status: "approved", submittedAt: "2026-10-20" },
    trustScore: 94,
  },
  {
    _id: "u4",
    name: "Kasun Perera",
    email: "it23409812@uni.edu",
    studentId: "IT23409812",
    role: "student",
    verified: false,
    sellerRequest: { status: "pending", submittedAt: "2026-11-16" },
    trustScore: 76,
  },
];

const MOCK_TRANSACTIONS = [
  {
    _id: "TXN-2026-0891",
    buyerName: "Pubudi P. V. A. A.",
    buyerEmail: "it23252240@uni.edu",
    sellerName: "Nethmi Pussepitiya",
    items: [
      { title: "Data Structures & Algorithms Textbook", qty: 1, price: 2400 },
      { title: "Engineering Drawing Kit", qty: 1, price: 1600 },
    ],
    subtotal: 4000,
    bulkDiscount: 400, // 10% bulk discount for 2+ items
    totalAmount: 3600,
    slipUrl: "https://placehold.co/400x520/0B1F3A/FFFFFF?text=Bank+Transfer+Slip+%230891",
    status: "Pending",
    createdAt: "2026-11-16 14:20",
  },
  {
    _id: "TXN-2026-0890",
    buyerName: "Vinuthan T.",
    buyerEmail: "it23311022@uni.edu",
    sellerName: "Batawala B. A. E. H.",
    items: [{ title: "Casio fx-991EX Scientific Calculator", qty: 1, price: 4500 }],
    subtotal: 4500,
    bulkDiscount: 0,
    totalAmount: 4500,
    slipUrl: "https://placehold.co/400x520/0B1F3A/FFFFFF?text=Bank+Transfer+Slip+%230890",
    status: "Approved",
    createdAt: "2026-11-15 10:05",
  },
  {
    _id: "TXN-2026-0887",
    buyerName: "Kasun Perera",
    buyerEmail: "it23409812@uni.edu",
    sellerName: "Nethmi Pussepitiya",
    items: [
      { title: "Hostel Study Table Lamp", qty: 1, price: 1800 },
      { title: "Electric Kettle 1.5L", qty: 1, price: 3200 },
    ],
    subtotal: 5000,
    bulkDiscount: 500,
    totalAmount: 4500,
    slipUrl: "https://placehold.co/400x520/0B1F3A/FFFFFF?text=Blurry+Slip+%230887",
    status: "Rejected",
    rejectionNote: "Transaction reference number unreadable on uploaded slip.",
    createdAt: "2026-11-14 18:45",
  },
];

const MOCK_ITEMS = [
  {
    _id: "ITM-101",
    name: "Data Structures & Algorithms Textbook",
    category: "Books",
    price: 2400,
    marketAvg: 2500,
    seller: "Nethmi Pussepitiya",
    status: "Pending",
    flagged: false,
  },
  {
    _id: "ITM-102",
    name: "MacBook Pro M2 16GB (Suspiciously Low)",
    category: "Electronics",
    price: 15000,
    marketAvg: 240000,
    seller: "Kasun Perera",
    status: "Available",
    flagged: true,
    flagReason: "AI Anomaly: Price is 93% below category average.",
  },
  {
    _id: "ITM-103",
    name: "Hostel Single Mattress & Pillow Set",
    category: "Hostel Items",
    price: 6500,
    marketAvg: 7000,
    seller: "Batawala B. A. E. H.",
    status: "Available",
    flagged: false,
  },
  {
    _id: "ITM-104",
    name: "Lab Coat & Safety Goggles",
    category: "Other",
    price: 1500,
    marketAvg: 1600,
    seller: "Nethmi Pussepitiya",
    status: "Sold",
    flagged: false,
  },
];

const MOCK_SECURITY_ALERTS = [
  {
    _id: "ALT-01",
    type: "Abnormal Pricing",
    severity: "High",
    targetUser: "Kasun Perera (IT23409812)",
    detail: "Listed 'MacBook Pro M2 16GB' at LKR 15,000 (93% below campus baseline).",
    sentimentScore: "Negative (0.21)",
    status: "Open",
    detectedAt: "2026-11-16 12:10",
  },
  {
    _id: "ALT-02",
    type: "Repeated Suspicious Listings",
    severity: "Medium",
    targetUser: "Kasun Perera (IT23409812)",
    detail: "Posted 4 identical electronics listings within 10 minutes.",
    sentimentScore: "Neutral (0.48)",
    status: "Open",
    detectedAt: "2026-11-16 12:18",
  },
  {
    _id: "ALT-03",
    type: "Review Sentiment Warning",
    severity: "Low",
    targetUser: "Demo Seller (IT23991100)",
    detail: "NLP sentiment analysis flagged 2 recent buyer reviews citing delayed meetup.",
    sentimentScore: "Negative (0.32)",
    status: "Resolved",
    detectedAt: "2026-11-13 09:30",
  },
];

const MOCK_BEST_SELLERS = [
  { rank: 1, name: "Nethmi Pussepitiya", studentId: "IT23312708", totalSales: 48500, orders: 14, trustScore: 98, sentiment: "96% Positive" },
  { rank: 2, name: "Batawala B. A. E. H.", studentId: "IT23257122", totalSales: 34200, orders: 11, trustScore: 94, sentiment: "92% Positive" },
  { rank: 3, name: "Vinuthan T.", studentId: "IT23311022", totalSales: 21900, orders: 7, trustScore: 91, sentiment: "89% Positive" },
];

export default function AdmnDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  // Core States
  const [users, setUsers] = useState(MOCK_USERS);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [items, setItems] = useState(MOCK_ITEMS);
  const [alerts, setAlerts] = useState(MOCK_SECURITY_ALERTS);
  const [bestSellers, setBestSellers] = useState(MOCK_BEST_SELLERS);

  // Filters & Modals
  const [searchQuery, setSearchQuery] = useState("");
  const [txnFilter, setTxnFilter] = useState("All");
  const [itemCategoryFilter, setItemCategoryFilter] = useState("All");
  const [selectedSlipTxn, setSelectedSlipTxn] = useState(null);
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, type: "", id: "", reason: "" });

  const adminUser = useMemo(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("admin_user")) ||
        JSON.parse(localStorage.getItem("user")) || {
          name: "Campus Admin",
          email: "admin@uni.edu",
        }
      );
    } catch {
      return { name: "Campus Admin", email: "admin@uni.edu" };
    }
  }, []);

  // Attempt live API fetch with graceful fallback to mock state
  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [usersRes, txnsRes, itemsRes] = await Promise.allSettled([
          fetch(`${API_BASE}/users`, { headers }),
          fetch(`${API_BASE}/transactions`, { headers }),
          fetch(`${API_BASE}/items`, { headers }),
        ]);

        if (usersRes.status === "fulfilled" && usersRes.value.ok) {
          const data = await usersRes.value.json();
          if (Array.isArray(data) && data.length) setUsers(data);
        }
        if (txnsRes.status === "fulfilled" && txnsRes.value.ok) {
          const data = await txnsRes.value.json();
          if (Array.isArray(data) && data.length) setTransactions(data);
        }
        if (itemsRes.status === "fulfilled" && itemsRes.value.ok) {
          const data = await itemsRes.value.json();
          if (Array.isArray(data) && data.length) setItems(data);
        }
      } catch {
        // Keep fallback data if backend is offline
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // KPI Metrics
  const stats = useMemo(() => {
    const pendingUsers = users.filter(
      (u) => !u.verified || u.sellerRequest?.status === "pending"
    ).length;
    const pendingPayments = transactions.filter((t) => t.status === "Pending").length;
    const approvedRevenue = transactions
      .filter((t) => t.status === "Approved")
      .reduce((sum, t) => sum + Number(t.totalAmount || 0), 0);
    const openFraudAlerts = alerts.filter((a) => a.status === "Open").length;

    return {
      totalUsers: users.length,
      pendingUsers,
      pendingPayments,
      approvedRevenue,
      openFraudAlerts,
      totalItems: items.length,
    };
  }, [users, transactions, alerts, items]);

  // Handlers: User & Seller Verification
  const handleVerifyStudent = async (userId) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, verified: true } : u))
    );
    toast.success("University Student ID verified.");
  };

  const handleApproveSeller = async (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u._id === userId
          ? {
              ...u,
              role: "seller",
              verified: true,
              sellerRequest: { ...u.sellerRequest, status: "approved" },
            }
          : u
      )
    );
    toast.success("Seller request approved! Student can now list items.");
  };

  // Handlers: Payment Slip Approval / Rejection
  const handleApprovePayment = async (txnId) => {
    setTransactions((prev) =>
      prev.map((t) => (t._id === txnId ? { ...t, status: "Approved" } : t))
    );
    setSelectedSlipTxn(null);
    toast.success(`Payment ${txnId} approved & digital receipt issued.`);
  };

  const handleConfirmReject = () => {
    if (!rejectModal.reason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }

    if (rejectModal.type === "seller") {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === rejectModal.id
            ? {
                ...u,
                sellerRequest: {
                  ...u.sellerRequest,
                  status: "rejected",
                  rejectionReason: rejectModal.reason.trim(),
                },
              }
            : u
        )
      );
      toast.info("Seller request rejected with reason saved.");
    } else if (rejectModal.type === "payment") {
      setTransactions((prev) =>
        prev.map((t) =>
          t._id === rejectModal.id
            ? { ...t, status: "Rejected", rejectionNote: rejectModal.reason.trim() }
            : t
        )
      );
      setSelectedSlipTxn(null);
      toast.info(`Payment ${rejectModal.id} marked as Rejected.`);
    }

    setRejectModal({ open: false, type: "", id: "", reason: "" });
  };

  // Handlers: Item Moderation
  const handleRemoveFlaggedItem = (itemId) => {
    setItems((prev) => prev.filter((item) => item._id !== itemId));
    toast.warn("Suspicious listing removed from marketplace.");
  };

  const handleClearItemFlag = (itemId) => {
    setItems((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, flagged: false, flagReason: "" } : item
      )
    );
    toast.success("Listing verified and cleared.");
  };

  // Handlers: Trust & Security Alerts
  const handleResolveAlert = (alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a._id === alertId ? { ...a, status: "Resolved" } : a))
    );
    toast.success("Security alert marked as resolved.");
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.info("Logged out of Admin Portal.");
    navigate("/login");
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesStatus = txnFilter === "All" || t.status === txnFilter;
    const matchesQuery =
      t._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const filteredItems = items.filter((item) => {
    const matchesCat = itemCategoryFilter === "All" || item.category === itemCategoryFilter;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.seller.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-white text-[#0B1F3A] flex flex-col md:flex-row">
      {/* Dark Navy Sidebar */}
      <aside className="w-full md:w-68 bg-[#0B1F3A] text-white flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="h-9 w-9 rounded-lg bg-[#F97316] flex items-center justify-center font-bold text-white text-lg">
                U
              </span>
              <div>
                <h1 className="text-lg font-bold tracking-tight leading-none">
                  UniSwap <span className="text-[#F97316]">Admin</span>
                </h1>
                <p className="text-xs text-slate-300 mt-1">Campus Marketplace Control</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            {[
              { id: "overview", label: "Overview & Analytics" },
              {
                id: "users",
                label: "User & Seller Verification",
                badge: stats.pendingUsers,
              },
              {
                id: "payments",
                label: "Payment Slips & Receipts",
                badge: stats.pendingPayments,
              },
              { id: "items", label: "Item Moderation" },
              {
                id: "security",
                label: "Trust, Fraud & AI Score",
                badge: stats.openFraudAlerts,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-[#F97316] text-white shadow-sm"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      activeTab === tab.id
                        ? "bg-white text-[#0B1F3A]"
                        : "bg-[#F97316] text-white"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="mb-3 px-2">
            <p className="text-sm font-semibold text-white">{adminUser.name}</p>
            <p className="text-xs text-slate-300">{adminUser.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-lg bg-white/10 hover:bg-[#F97316] text-white text-sm font-semibold transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-white p-6 md:p-8 overflow-y-auto">
        {/* Top Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-[#0B1F3A]">
              {activeTab === "overview" && "Platform Command Center"}
              {activeTab === "users" && "User Management & Student ID Verification"}
              {activeTab === "payments" && "Transaction & Payment Slip Verification"}
              {activeTab === "items" && "Campus Item Catalog & Status Audit"}
              {activeTab === "security" && "Trust, Security & AI Fraud Intelligence"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Verified `@uni.edu` student-only marketplace governance & moderation
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, student, item..."
              className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A] w-60"
            />
          </div>
        </header>

        {loading && (
          <div className="mt-4 text-xs font-medium text-[#F97316]">
            Syncing latest campus records...
          </div>
        )}

        {/* KPI Cards (Always visible on Overview, compact elsewhere) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Verified Campus Users
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#0B1F3A]">{stats.totalUsers}</span>
              <span className="text-xs font-semibold text-[#F97316]">
                {stats.pendingUsers} pending review
              </span>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Payment Slips
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#0B1F3A]">
                {stats.pendingPayments}
              </span>
              <span className="text-xs font-semibold text-[#F97316]">
                Requires verification
              </span>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Approved Volume (LKR)
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#0B1F3A]">
                {stats.approvedRevenue.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-emerald-700">
                Bulk discounts active
              </span>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              AI Security & Fraud Alerts
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#0B1F3A]">
                {stats.openFraudAlerts}
              </span>
              <span className="text-xs font-semibold text-[#F97316]">
                Anomaly detection live
              </span>
            </div>
          </div>
        </section>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Best Sellers Leaderboard (Pricing Intelligence Component) */}
            <div className="lg:col-span-2 rounded-xl border border-slate-200 p-6 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#0B1F3A]">
                    Top Campus Best Sellers & Trust Scores
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ranked by completed sales volume & NLP review sentiment
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#0B1F3A] text-white">
                  Performance Intelligence
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                      <th className="py-3 px-2">Rank</th>
                      <th className="py-3 px-2">Student Seller</th>
                      <th className="py-3 px-2">Orders</th>
                      <th className="py-3 px-2">Total Sales</th>
                      <th className="py-3 px-2">AI Trust Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bestSellers.map((seller) => (
                      <tr key={seller.studentId} className="hover:bg-slate-50">
                        <td className="py-3 px-2 font-bold text-[#F97316]">
                          #{seller.rank}
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-semibold text-[#0B1F3A]">{seller.name}</div>
                          <div className="text-xs text-slate-500">{seller.studentId}</div>
                        </td>
                        <td className="py-3 px-2">{seller.orders}</td>
                        <td className="py-3 px-2 font-semibold">
                          LKR {seller.totalSales.toLocaleString()}
                        </td>
                        <td className="py-3 px-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0B1F3A] text-white">
                            {seller.trustScore}/100 · {seller.sentiment}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Action Queue */}
            <div className="rounded-xl border border-slate-200 p-6 bg-white flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0B1F3A] mb-1">
                  Immediate Admin Actions
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Items awaiting manual verification
                </p>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#0B1F3A]">
                        Seller Role Requests
                      </p>
                      <p className="text-xs text-slate-500">
                        Verify Student ID before enabling selling
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("users")}
                      className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0B1F3A] text-white hover:bg-[#F97316] transition"
                    >
                      Review ({stats.pendingUsers})
                    </button>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#0B1F3A]">
                        Payment Slip Queue
                      </p>
                      <p className="text-xs text-slate-500">
                        Approve slips & issue digital receipts
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("payments")}
                      className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0B1F3A] text-white hover:bg-[#F97316] transition"
                    >
                      Verify ({stats.pendingPayments})
                    </button>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#0B1F3A]">
                        Abnormal Pricing Flags
                      </p>
                      <p className="text-xs text-slate-500">
                        AI-detected fraud & duplicate listings
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("security")}
                      className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#F97316] text-white hover:bg-[#0B1F3A] transition"
                    >
                      Inspect ({stats.openFraudAlerts})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER & SELLER VERIFICATION */}
        {activeTab === "users" && (
          <section className="mt-6 rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-[#0B1F3A]">
                Registered University Members (`@uni.edu`)
              </h3>
              <span className="text-xs text-slate-500">
                Student ID verification & seller privilege control
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Student ID</th>
                    <th className="py-3.5 px-4">ID Status</th>
                    <th className="py-3.5 px-4">Role / Seller Request</th>
                    <th className="py-3.5 px-4">Trust Score</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users
                    .filter(
                      (u) =>
                        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#0B1F3A]">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs font-semibold">
                          {user.studentId}
                        </td>
                        <td className="py-3.5 px-4">
                          {user.verified ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Verified
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#F97316] border border-orange-200">
                              Unverified ID
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="capitalize font-medium text-[#0B1F3A]">
                            {user.role}
                          </span>
                          {user.sellerRequest?.status === "pending" && (
                            <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-[#F97316] text-white">
                              Seller Pending
                            </span>
                          )}
                          {user.sellerRequest?.status === "rejected" && (
                            <p className="text-xs text-red-600 mt-0.5">
                              Rejected: {user.sellerRequest.rejectionReason}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold">
                          {user.trustScore}/100
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {!user.verified && (
                            <button
                              onClick={() => handleVerifyStudent(user._id)}
                              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#0B1F3A] text-white hover:bg-[#102A43]"
                            >
                              Verify ID
                            </button>
                          )}
                          {user.sellerRequest?.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApproveSeller(user._id)}
                                className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#F97316] text-white hover:bg-orange-600"
                              >
                                Approve Seller
                              </button>
                              <button
                                onClick={() =>
                                  setRejectModal({
                                    open: true,
                                    type: "seller",
                                    id: user._id,
                                    reason: "",
                                  })
                                }
                                className="px-3 py-1.5 rounded-md text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 3: TRANSACTION & PRICING MANAGEMENT */}
        {activeTab === "payments" && (
          <section className="mt-6 rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-[#0B1F3A]">
                  Payment Slip Verification & Digital Receipts
                </h3>
                <p className="text-xs text-slate-500">
                  Includes automatic bulk purchase discount verification (2+ items)
                </p>
              </div>

              <div className="flex items-center gap-2">
                {["All", "Pending", "Approved", "Rejected"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setTxnFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      txnFilter === status
                        ? "bg-[#0B1F3A] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Transaction ID</th>
                    <th className="py-3.5 px-4">Buyer & Seller</th>
                    <th className="py-3.5 px-4">Items & Bulk Discount</th>
                    <th className="py-3.5 px-4">Total Paid</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTransactions.map((txn) => (
                    <tr key={txn._id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#0B1F3A]">
                          {txn._id}
                        </span>
                        <p className="text-xs text-slate-500">{txn.createdAt}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-xs">
                          <span className="text-slate-500">Buyer:</span>{" "}
                          <span className="font-semibold">{txn.buyerName}</span>
                        </p>
                        <p className="text-xs mt-0.5">
                          <span className="text-slate-500">Seller:</span>{" "}
                          <span className="font-semibold">{txn.sellerName}</span>
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-xs font-medium text-[#0B1F3A]">
                          {txn.items.length} item(s) — Subtotal LKR{" "}
                          {txn.subtotal.toLocaleString()}
                        </p>
                        {txn.bulkDiscount > 0 ? (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-50 text-[#F97316] border border-orange-200">
                            Bulk Discount Applied: -LKR {txn.bulkDiscount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Single item purchase
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#0B1F3A]">
                        LKR {txn.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            txn.status === "Approved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : txn.status === "Rejected"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-orange-50 text-[#F97316] border border-orange-200"
                          }`}
                        >
                          {txn.status}
                        </span>
                        {txn.rejectionNote && (
                          <p className="text-[11px] text-red-600 mt-1 max-w-48">
                            {txn.rejectionNote}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedSlipTxn(txn)}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#0B1F3A] text-white hover:bg-[#F97316] transition"
                        >
                          Inspect Slip
                        </button>
                        {txn.status === "Approved" && (
                          <button
                            onClick={() => setSelectedReceiptTxn(txn)}
                            className="px-3 py-1.5 rounded-md text-xs font-semibold border border-[#0B1F3A] text-[#0B1F3A] hover:bg-slate-100 transition"
                          >
                            Digital Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 4: ITEM MANAGEMENT MODERATION */}
        {activeTab === "items" && (
          <section className="mt-6 rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-[#0B1F3A]">
                  Campus Item Listings & Availability Audit
                </h3>
                <p className="text-xs text-slate-500">
                  Categories: Books, Electronics, Hostel Items, Other
                </p>
              </div>

              <div className="flex items-center gap-2">
                {["All", "Books", "Electronics", "Hostel Items", "Other"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setItemCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      itemCategoryFilter === cat
                        ? "bg-[#0B1F3A] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Item</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Listed Price vs Avg</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">AI Integrity Check</th>
                    <th className="py-3.5 px-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredItems.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#0B1F3A]">{item.name}</p>
                        <p className="text-xs text-slate-500">
                          {item._id} · Seller: {item.seller}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-[#0B1F3A]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#0B1F3A]">
                          LKR {item.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          Campus avg: LKR {item.marketAvg.toLocaleString()}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            item.status === "Available"
                              ? "bg-emerald-50 text-emerald-700"
                              : item.status === "Pending"
                              ? "bg-orange-50 text-[#F97316]"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.flagged ? (
                          <span className="text-xs font-semibold text-[#F97316]">
                            {item.flagReason}
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-700 font-medium">
                            Normal price range
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {item.flagged && (
                          <button
                            onClick={() => handleClearItemFlag(item._id)}
                            className="px-3 py-1.5 rounded-md text-xs font-semibold border border-slate-300 text-[#0B1F3A] hover:bg-slate-100"
                          >
                            Mark Safe
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveFlaggedItem(item._id)}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 5: TRUST, SECURITY & AI INTELLIGENCE */}
        {activeTab === "security" && (
          <section className="mt-6 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#0B1F3A]">
                    Fraud Detection, Abnormal Pricing & Review Sentiment Feed
                  </h3>
                  <p className="text-xs text-slate-500">
                    Automated AI monitoring for suspicious behavior & seller trust scoring
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#0B1F3A] text-white">
                  AI Shield Active
                </span>
              </div>

              <div className="divide-y divide-slate-200">
                {alerts.map((alert) => (
                  <div
                    key={alert._id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                            alert.severity === "High"
                              ? "bg-[#F97316] text-white"
                              : alert.severity === "Medium"
                              ? "bg-[#0B1F3A] text-white"
                              : "bg-slate-200 text-slate-800"
                          }`}
                        >
                          {alert.severity} Risk
                        </span>
                        <span className="font-bold text-sm text-[#0B1F3A]">
                          {alert.type}
                        </span>
                        <span className="text-xs text-slate-400">
                          · {alert.detectedAt}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{alert.detail}</p>
                      <p className="text-xs text-slate-500">
                        Account: <strong className="text-[#0B1F3A]">{alert.targetUser}</strong>{" "}
                        · NLP Review Sentiment:{" "}
                        <strong className="text-[#F97316]">{alert.sentimentScore}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {alert.status === "Open" ? (
                        <button
                          onClick={() => handleResolveAlert(alert._id)}
                          className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#0B1F3A] text-white hover:bg-[#F97316] transition"
                        >
                          Resolve Incident
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODAL 1: PAYMENT SLIP INSPECTION */}
      {selectedSlipTxn && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="font-bold text-lg text-[#0B1F3A]">
                Verify Payment Slip — {selectedSlipTxn._id}
              </h4>
              <button
                onClick={() => setSelectedSlipTxn(null)}
                className="text-slate-400 hover:text-[#0B1F3A] font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Buyer:</span>
                <span className="font-semibold">{selectedSlipTxn.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bulk Discount (2+ items):</span>
                <span className="font-semibold text-[#F97316]">
                  -LKR {selectedSlipTxn.bulkDiscount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#0B1F3A]">
                <span>Expected Amount:</span>
                <span>LKR {selectedSlipTxn.totalAmount.toLocaleString()}</span>
              </div>

              <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex justify-center">
                <img
                  src={selectedSlipTxn.slipUrl}
                  alt="Uploaded Payment Slip"
                  className="max-h-64 object-contain"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() =>
                  setRejectModal({
                    open: true,
                    type: "payment",
                    id: selectedSlipTxn._id,
                    reason: "",
                  })
                }
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-red-300 text-red-600 hover:bg-red-50"
              >
                Reject Slip
              </button>
              <button
                onClick={() => handleApprovePayment(selectedSlipTxn._id)}
                className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#0B1F3A] text-white hover:bg-[#F97316] transition"
              >
                Approve & Generate Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DIGITAL RECEIPT VIEWER */}
      {selectedReceiptTxn && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border-2 border-[#0B1F3A]">
            <div className="text-center border-b border-dashed border-slate-300 pb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F97316] text-white">
                OFFICIAL DIGITAL RECEIPT
              </span>
              <h4 className="text-xl font-bold text-[#0B1F3A] mt-2">
                UniSwap Campus Marketplace
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified Student Transaction · {selectedReceiptTxn._id}
              </p>
            </div>

            <div className="py-4 space-y-2 text-sm border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Buyer:</span>
                <span className="font-semibold">{selectedReceiptTxn.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Seller:</span>
                <span className="font-semibold">{selectedReceiptTxn.sellerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span>{selectedReceiptTxn.createdAt}</span>
              </div>

              <div className="pt-2">
                <p className="text-xs font-semibold uppercase text-slate-500 mb-1">
                  Purchased Items
                </p>
                {selectedReceiptTxn.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs py-1">
                    <span>
                      {it.title} (x{it.qty})
                    </span>
                    <span className="font-semibold">
                      LKR {it.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>LKR {selectedReceiptTxn.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#F97316] font-medium">
                <span>Bulk Purchase Discount</span>
                <span>-LKR {selectedReceiptTxn.bulkDiscount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#0B1F3A] pt-1">
                <span>Total Verified Paid</span>
                <span>LKR {selectedReceiptTxn.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedReceiptTxn(null)}
                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-[#0B1F3A] text-white hover:bg-[#F97316] transition"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REJECTION REASON INPUT */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h4 className="font-bold text-lg text-[#0B1F3A]">
              Provide Rejection Reason
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              This note will be displayed to the student upon login or payment review.
            </p>
            <textarea
              rows={3}
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal((prev) => ({ ...prev, reason: e.target.value }))
              }
              placeholder="e.g., Student ID card image is unclear / Bank slip reference mismatch..."
              className="mt-3 w-full p-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B1F3A]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() =>
                  setRejectModal({ open: false, type: "", id: "", reason: "" })
                }
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-300 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#F97316] text-white hover:bg-orange-600"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}