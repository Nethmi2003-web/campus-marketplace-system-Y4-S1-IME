import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { cn } from "../lib/utils";
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Loader2,
  Receipt,
  User,
  XCircle
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "react-toastify";
import { getSellerSessionWithKey } from "../lib/session";

// Seller-only version of the admin Financial Dashboard.
export function SellerAnalytic() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [granularity, setGranularity] = useState("full"); // "full" | "w1" | "w2" | "w3" | "w4"
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const { session: userInfo } = getSellerSessionWithKey();
        if (!userInfo?.token) {
          setError("Please login as a seller to view your transactions.");
          setLoading(false);
          return;
        }

        const res = await axios.get("/api/orders/seller/analytics", {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });

        if (res.data?.success) {
          setOrders(res.data.data?.orders || []);
        } else {
          setError(res.data?.message || "Failed to load seller transactions.");
        }
      } catch (err) {
        console.error("Error fetching seller analytics:", err);
        setError(err.response?.data?.message || "Failed to load seller transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerOrders();
  }, []);

  const completedOrdersList = useMemo(
    () => orders.filter((o) => o.paymentStatus === "completed"),
    [orders]
  );

  const pendingOrdersCount = useMemo(
    () => orders.filter((o) => o.paymentStatus === "pending").length,
    [orders]
  );

  const totalRevenue = useMemo(
    () => completedOrdersList.reduce((sum, order) => sum + Number(order.sellerSubtotal || 0), 0),
    [completedOrdersList]
  );

  const itemsSold = useMemo(() => {
    return completedOrdersList.reduce((sum, order) => {
      return sum + (order.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0);
    }, 0);
  }, [completedOrdersList]);

  const completedOrdersCount = completedOrdersList.length;

  // --- Daily Analytics --- //
  const getDailyRevenue = (daysAgo) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysAgo);
    const dateStr = targetDate.toDateString();

    return completedOrdersList
      .filter((o) => new Date(o.createdAt).toDateString() === dateStr)
      .reduce((sum, o) => sum + Number(o.sellerSubtotal || 0), 0);
  };

  const todayRevenue = getDailyRevenue(0);
  const yesterdayRevenue = getDailyRevenue(1);
  const revenueChange =
    yesterdayRevenue === 0 ? (todayRevenue > 0 ? 100 : 0) : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

  // --- Chart Data Logic (Seller Revenue only) --- //
  const getChartData = () => {
    const data = [];
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    let startDay = 1;
    let endDay = daysInMonth;

    if (granularity === "w1") {
      startDay = 1;
      endDay = 7;
    } else if (granularity === "w2") {
      startDay = 8;
      endDay = 14;
    } else if (granularity === "w3") {
      startDay = 15;
      endDay = 21;
    } else if (granularity === "w4") {
      startDay = 22;
      endDay = daysInMonth;
    }

    for (let d = startDay; d <= endDay; d++) {
      const date = new Date(selectedYear, selectedMonth, d);

      const dailyVal = completedOrdersList
        .filter((o) => {
          const oDate = new Date(o.createdAt);
          return oDate.getDate() === d && oDate.getMonth() === selectedMonth && oDate.getFullYear() === selectedYear;
        })
        .reduce((sum, o) => sum + Number(o.sellerSubtotal || 0), 0);

      data.push({
        name: String(d),
        value: dailyVal,
        fullDate: date.toLocaleDateString(),
        showLabel: granularity !== "full" || d % 2 !== 0 || d === daysInMonth
      });
    }

    return data;
  };

  if (loading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold text-center">Loading your store transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border bg-card shadow-xl p-6">
        <p className="text-red-600 font-black text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Store Transactions</h1>
          <p className="text-muted-foreground font-medium">Revenue and sales analytics for your items</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.info("Tip: Use the month/week selector to inspect sales trends.", { autoClose: 1200 })}
            className="px-5 py-2.5 rounded-2xl bg-primary text-white text-xs font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <ArrowUpRight size={14} /> Insights
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Today's Revenue",
            value: `LKR ${todayRevenue.toLocaleString()}`,
            change: `${revenueChange >= 0 ? "+" : ""}${revenueChange.toFixed(1)}%`,
            trend: revenueChange >= 0 ? "up" : "down",
            icon: Receipt,
            color: "bg-primary/10 text-primary"
          },
          {
            label: "Completed Orders",
            value: completedOrdersCount,
            change: "",
            trend: "up",
            icon: ArrowUpRight,
            color: "bg-green-100 text-green-700"
          },
          {
            label: "Items Sold",
            value: itemsSold,
            change: "",
            trend: "up",
            icon: ArrowUpRight,
            color: "bg-secondary/10 text-secondary"
          },
          {
            label: "Pending Payments",
            value: pendingOrdersCount,
            change: "",
            trend: "down",
            icon: ArrowDownRight,
            color: "bg-amber-100 text-amber-700"
          }
        ].map((s, i) => (
          <div
            key={i}
            className="rounded-3xl border bg-card p-6 shadow-xl flex items-center gap-5 group hover:border-primary/20 transition-all"
          >
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform",
                s.color
              )}
            >
              <s.icon size={28} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className="text-2xl font-black text-primary tracking-tight truncate">{s.value}</h3>
              {s.change ? (
                <div className="flex items-center gap-1 mt-1">
                  {s.trend === "up" ? (
                    <ArrowUpRight size={12} className="text-green-600" />
                  ) : (
                    <ArrowDownRight size={12} className="text-red-500" />
                  )}
                  <span className={cn("text-[11px] font-bold", s.trend === "up" ? "text-green-600" : "text-red-500")}>
                    {s.change}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium ml-1">vs yesterday</span>
                </div>
              ) : (
                <div className="text-[10px] text-muted-foreground font-bold">Revenue: LKR {totalRevenue.toLocaleString()}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Volume chart */}
        <div className="rounded-[2.5rem] border bg-card shadow-xl p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
            <div>
              <h3 className="text-xl font-black text-primary uppercase tracking-tight">Revenue Analytics</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Seller revenue by day</p>
            </div>

            <div className="flex flex-col gap-3 bg-muted/30 p-3 rounded-[2.2rem] border border-border/50 w-full sm:w-[320px] lg:w-[360px] shadow-2xl shadow-black/5">
              {/* Top Row: Year and Month */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="flex-1 bg-white border border-border/50 text-primary rounded-2xl px-5 h-12 text-[12px] font-black focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer hover:border-primary/30 transition-all shadow-sm"
                >
                  {[2024, 2025, 2026].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="flex-1 bg-white border border-border/50 text-primary rounded-2xl px-5 h-12 text-[12px] font-black focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer hover:border-primary/30 transition-all shadow-sm"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bottom Row: Week Buttons */}
              <div className="flex bg-white/70 p-1.5 rounded-2xl border border-border/50 shadow-inner h-12 items-center">
                {[
                  { id: "full", label: "Month" },
                  { id: "w1", label: "W1" },
                  { id: "w2", label: "W2" },
                  { id: "w3", label: "W3" },
                  { id: "w4", label: "W4" }
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGranularity(g.id)}
                    className={cn(
                      "flex-1 h-full rounded-xl text-[11px] font-black transition-all uppercase tracking-tighter",
                      granularity === g.id
                        ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105"
                        : "text-muted-foreground hover:text-primary hover:bg-white/90"
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    const item = getChartData()[payload.index];
                    if (!item?.showLabel) return null;
                    return (
                      <text x={x} y={y + 16} fill="hsl(var(--muted-foreground))" fontSize={10} fontWeight="bold" textAnchor="middle">
                        {payload.value}
                      </text>
                    );
                  }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: "bold" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)", cursor: "default" }}
                  cursor={{ fill: "rgba(0,0,0,0.02)" }}
                  formatter={(val) => [`LKR ${Number(val || 0).toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="rounded-[2.5rem] border bg-card shadow-xl overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b flex items-center justify-between bg-muted/10">
            <h3 className="font-black text-primary uppercase tracking-widest text-sm">Recent Orders</h3>
            <span className="text-[10px] font-black text-white bg-primary px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-primary/20">
              Seller Records
            </span>
          </div>
          <div className="divide-y overflow-y-auto max-h-[340px] flex-1">
            {orders.slice(0, 15).map((tx) => (
              <div key={tx._id} className="px-8 py-4 flex items-center justify-between gap-6 hover:bg-muted/30 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-primary truncate group-hover:translate-x-1 transition-transform">
                    {tx.items?.[0]?.product?.title || "Order"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">#{String(tx._id).slice(-6)}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-[10px] text-muted-foreground font-medium truncate">
                      {tx.user?.firstName} {tx.user?.lastName}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2.5">
                  <div className="text-right">
                    <p className="font-black text-sm text-foreground whitespace-nowrap tracking-tight">
                      LKR {Number(tx.sellerSubtotal || 0).toLocaleString()}
                    </p>
                    <span
                      className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-lg whitespace-nowrap uppercase tracking-widest",
                        tx.paymentStatus === "completed"
                          ? "bg-green-100 text-green-700"
                          : tx.paymentStatus === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-600"
                      )}
                    >
                      {tx.paymentStatus}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOrder(tx);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white"
                    title="View details"
                  >
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="px-8 py-20 text-center space-y-3">
                <Receipt className="mx-auto text-muted-foreground/20" size={48} />
                <p className="text-muted-foreground font-bold">No orders for your items yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="text-xl font-black text-primary tracking-tight uppercase">Order Details</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">Order ID: #{selectedOrder._id}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-white border hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <User size={14} className="text-secondary" />
                    Buyer
                  </div>
                  <div className="p-4 bg-muted/20 rounded-2xl space-y-1">
                    <p className="font-black text-primary text-lg">
                      {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">{selectedOrder.user?.universityEmail}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <Clock size={14} className="text-secondary" />
                    Status
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest",
                        selectedOrder.paymentStatus === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      )}
                    >
                      Payment: {selectedOrder.paymentStatus}
                    </span>
                    <span className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest">
                      Method: {selectedOrder.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <Receipt size={14} className="text-secondary" />
                  Items (Your products only)
                </div>
                <div className="rounded-2xl border overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/30 border-b">
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Qty</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(selectedOrder.items || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3 font-bold text-sm text-primary">{item.product?.title || "Product"}</td>
                          <td className="px-4 py-3 text-center text-sm font-bold">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-sm font-black">LKR {Number(item.price || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-6 bg-primary/5 rounded-[2rem] border-2 border-dashed border-primary/20 space-y-4">
                <div className="flex justify-between items-center text-sm font-bold text-muted-foreground">
                  <span>Your Subtotal</span>
                  <span>LKR {Number(selectedOrder.sellerSubtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-secondary">
                  <span>Platform Fee Share</span>
                  <span>LKR {Number(selectedOrder.platformFeeShare || 0).toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-primary/10 flex justify-between items-center">
                  <span className="text-lg font-black text-primary uppercase">Buyer Paid (Order Total)</span>
                  <span className="text-2xl font-black text-primary">LKR {Number(selectedOrder.orderTotalAmount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-muted/10 flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-white border font-bold text-sm hover:bg-muted transition-all"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

