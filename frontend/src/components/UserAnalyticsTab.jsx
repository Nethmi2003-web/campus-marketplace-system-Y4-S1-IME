import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  TrendingUp, 
  ShoppingBag, 
  CreditCard, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  AlertCircle,
  FileText,
  XCircle
} from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "react-toastify";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from "../lib/utils";
import { getBuyerSessionWithKey } from "../lib/session";
import { DatePicker } from "./shared/DatePicker";

const Card = ({ children, className }) => (
  <div className={cn("bg-card/40 backdrop-blur-xl border-2 border-white rounded-[2.5rem] shadow-xl shadow-black/5 overflow-hidden", className)}>
    {children}
  </div>
);

export function UserAnalyticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session: userInfo } = getBuyerSessionWithKey();
  const [historyPage, setHistoryPage] = useState(1);
  const pageSize = 10;
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportOrderId, setReportOrderId] = useState("");
  const [reportForm, setReportForm] = useState({
    name: userInfo.firstName ? `${userInfo.firstName} ${userInfo.lastName || ""}`.trim() : "",
    studentNumber: "",
    description: "",
    purchaseDate: "",
    slip: null
  });

  const downloadOrderReceipt = (order) => {
    const doc = new jsPDF();
    const ref = order.paymentReference || order._id;
    const issuedOn = new Date(order.createdAt).toLocaleString();
    const buyerName = `${userInfo.firstName || "Student"} ${userInfo.lastName || ""}`.trim() || "Student Buyer";
    const subtotal = order.subtotal || order.totalAmount || 0;
    const fee = order.platformFee || 0;
    const total = order.totalAmount || 0;

    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    const headerHeight = 22;
    const accentHeight = 5;
    let y = 15;

    // Top color bar (blue) with orange accent
    doc.setFillColor(11, 47, 166); // vibrant blue
    doc.rect(0, 0, pageWidth, headerHeight, "F");
    doc.setFillColor(255, 149, 0); // orange accent
    doc.rect(0, headerHeight - 2, pageWidth, accentHeight, "F");

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("UNI SWAP Campus MarketPlace", margin, y);
    y += 7;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Payment Receipt (Stripe UI)", margin, y);

    // Reset text color for body
    doc.setTextColor(33, 37, 41);

    y += 10;
    doc.setFontSize(9);
    doc.text(`Receipt #: ${ref}`, margin, y);
    doc.text(`Issued: ${issuedOn}`, margin + 120, y);
    y += 5;
    doc.text(`Buyer: ${buyerName}`, margin, y);
    y += 5;
    doc.text(`Payment Method: ${order.paymentMethod}`, margin, y);
    y += 8;

    // Table headers
    doc.setFont("helvetica", "bold");
    doc.text("Item", margin, y);
    doc.text("Qty", margin + 100, y);
    doc.text("Price", margin + 120, y);
    doc.text("Line Total", margin + 150, y);
    y += 4;
    doc.setLineWidth(0.3);
    doc.line(margin, y, 200 - margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    order.items.forEach((item) => {
      const title = item.product?.title || item.title || "Item";
      const qty = item.quantity || 1;
      const price = item.price || item.product?.price || 0;
      const lineTotal = price * qty;
      const wrapped = doc.splitTextToSize(title, 90);
      doc.text(wrapped, margin, y);
      doc.text(String(qty), margin + 100, y);
      doc.text(`LKR ${price.toLocaleString()}`, margin + 120, y);
      doc.text(`LKR ${lineTotal.toLocaleString()}`, margin + 150, y);
      y += wrapped.length * 5 + 2;
      if (y > 260) { // add page if needed
        doc.addPage();
        y = 20;
      }
    });

    y += 4;
    doc.line(margin, y, 200 - margin, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Subtotal", margin + 120, y);
    doc.text(`LKR ${subtotal.toLocaleString()}`, margin + 150, y);
    y += 6;
    doc.text("Platform Fee", margin + 120, y);
    doc.text(`LKR ${fee.toLocaleString()}`, margin + 150, y);
    y += 6;
    doc.text("Total Paid", margin + 120, y);
    doc.text(`LKR ${total.toLocaleString()}`, margin + 150, y);

    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("This receipt confirms payment capture. Present this to the seller when collecting your items.", margin, y);

    doc.save(`receipt-${ref}.pdf`);
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const { session: currentUser } = getBuyerSessionWithKey();
        if (!currentUser?.token) {
          setError("Please login to view your analytics.");
          setLoading(false);
          return;
        }
        const response = await axios.get("/api/orders/analytics", {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setData(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load your spending insights. Please try again later.");
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-xl font-black text-primary animate-pulse tracking-tight">Calculating your insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-6 text-center px-4">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center shadow-xl shadow-red-100">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="max-w-sm">
          <h2 className="text-2xl font-black text-primary mb-2 tracking-tight">Analytics Unavailable</h2>
          <p className="text-muted-foreground font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Spent",
      value: `LKR ${data.totalSpent.toLocaleString()}`,
      icon: CreditCard,
      color: "from-blue-500 to-indigo-600",
      description: "Lifetime marketplace spending"
    },
    {
      label: "Items Bought",
      value: data.itemsPurchased,
      icon: ShoppingBag,
      color: "from-emerald-500 to-teal-600",
      description: "Total unique items purchased"
    },
    {
      label: "Platform Fees",
      value: `LKR ${data.platformFees.toLocaleString()}`,
      icon: TrendingUp,
      color: "from-orange-500 to-pink-600",
      description: "Support for the marketplace"
    },
    {
      label: "Pending Orders",
      value: data.pendingOrders,
      icon: Clock,
      color: "from-purple-500 to-violet-600",
      description: "Orders currently in progress"
    }
  ];

  const totalHistory = data.completedOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalHistory / pageSize));
  const pagedOrders = data.completedOrders.slice((historyPage - 1) * pageSize, historyPage * pageSize);

  const handleOpenReportModal = () => {
    setReportOrderId("");
    setReportForm({
      name: userInfo.firstName ? `${userInfo.firstName} ${userInfo.lastName || ""}`.trim() : "",
      studentNumber: "",
      description: "",
      purchaseDate: "",
      slip: null
    });
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = async () => {
    try {
      if (!userInfo.token) {
        toast.info("Please log in to report a payment issue.");
        return;
      }
      if (!reportOrderId) {
        toast.warn("Please select a purchase from your history.");
        return;
      }
      if (!reportForm.name?.trim()) {
        toast.warn("Please enter your name.");
        return;
      }
      if (!reportForm.studentNumber?.trim()) {
        toast.warn("Please enter your student number.");
        return;
      }
      if (!reportForm.purchaseDate) {
        toast.warn("Please provide the purchase date.");
        return;
      }
      if (!reportForm.description?.trim()) {
        toast.warn("Please describe the payment issue.");
        return;
      }

      const formData = new FormData();
      formData.append("orderId", reportOrderId);
      formData.append("name", reportForm.name);
      formData.append("studentNumber", reportForm.studentNumber);
      formData.append("description", reportForm.description);
      formData.append("purchaseDate", reportForm.purchaseDate);
      if (reportForm.slip) formData.append("slip", reportForm.slip);

      const res = await axios.post("/api/payment-reports", formData, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data?.success) {
        toast.success("Payment report submitted.");
        setIsReportModalOpen(false);
      } else {
        toast.error(res.data?.message || "Failed to submit report.");
      }
    } catch (err) {
      console.error("Report submit error:", err);
      toast.error(err.response?.data?.message || "Failed to submit report.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black text-primary tracking-tight">My Insights</h1>
          <p className="text-muted-foreground font-black font-medium text-lg text-secondary">Track your spending and item consumption patterns</p>
        </div>
        <button
          onClick={handleOpenReportModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all border border-red-200 shadow-sm sm:self-start"
        >
          <AlertCircle size={16} /> Report Payment Problem
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="group hover:scale-[1.02] transition-all duration-500 cursor-default">
            <div className="p-6">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform bg-gradient-to-br",
                stat.color
              )}>
                <stat.icon className="text-white w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-primary tracking-tight">{stat.value}</h3>
                <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">{stat.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Spending Trend Chart */}
        <Card className="lg:col-span-2 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-primary tracking-tight">Spending Trend</h3>
              <p className="text-xs text-muted-foreground font-medium">Your monthly marketplace activity</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
               <TrendingUp size={12} />
               Active Shopping
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlySpending}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#001f5c" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#001f5c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                  tickFormatter={(value) => `LKR ${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    backdropFilter: 'blur(8px)'
                  }}
                  itemStyle={{ color: '#001f5c', fontWeight: 900 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#001f5c" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Breakdown Card */}
        <Card className="p-8 space-y-6">
           <div>
              <h3 className="text-xl font-black text-primary tracking-tight">Monthly Breakdown</h3>
              <p className="text-xs text-muted-foreground font-medium">Spending comparison</p>
           </div>

           <div className="space-y-4">
              {data.monthlySpending.slice(-4).map((m, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black text-primary uppercase tracking-widest">{m.month}</span>
                    <span className="text-sm font-bold text-secondary">LKR {m.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000"
                      style={{ width: `${(m.amount / Math.max(...data.monthlySpending.map(x => x.amount || 1))) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
           </div>

           <div className="pt-6 border-t border-dashed border-muted-foreground/20">
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl">
                 <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                    <ArrowUpRight size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Saving Tip</p>
                    <p className="text-xs font-medium text-primary">Compare prices in "Books" category to save up to 15% this month.</p>
                 </div>
              </div>
           </div>
        </Card>
      </div>

      {/* Completed Orders List */}
      <Card className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-primary tracking-tight">Purchase History</h3>
            <p className="text-xs text-muted-foreground font-medium">All your successfully completed transactions</p>
          </div>
          <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
            {data.completedOrders.length} Completed
          </div>
        </div>

        <div className="space-y-4">
          {pagedOrders.length > 0 ? (
            pagedOrders.map((order) => (
              <div 
                key={order._id} 
                className="group flex flex-col md:flex-row md:items-center gap-6 p-5 rounded-3xl bg-white transition-all hover:shadow-xl hover:shadow-primary/5 border border-transparent hover:border-primary/10"
              >
                {/* Product Images (Multiple) */}
                <div className="flex -space-x-4">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div 
                      key={idx} 
                      className="w-16 h-16 rounded-2xl border-4 border-white overflow-hidden shadow-lg group-hover:scale-105 transition-transform"
                    >
                      <img 
                        src={item.product?.imageUrl || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=200"} 
                        alt={item.product?.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-16 h-16 rounded-2xl border-4 border-white bg-primary text-white flex items-center justify-center text-xs font-black shadow-lg">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-black text-primary truncate tracking-tight">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </h4>
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                      Completed
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium truncate">
                    {order.items.map(item => item.product?.title).join(", ")}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                     <span className="flex items-center gap-1"><Clock size={12}/> {new Date(order.createdAt).toLocaleDateString()}</span>
                     <span className="flex items-center gap-1"><CreditCard size={12}/> {order.paymentMethod}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-1">Total Paid</p>
                  <p className="text-xl font-black text-primary">LKR {order.totalAmount.toLocaleString()}</p>
                  <button 
                    onClick={() => downloadOrderReceipt(order)}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/20"
                  >
                    <FileText size={14} /> Download Receipt
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center text-muted-foreground font-medium">
              No completed orders found in your history.
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 text-sm font-bold text-primary">
            <button
              onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
              disabled={historyPage === 1}
              className="px-3 py-2 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <span className="text-muted-foreground">
              Page {historyPage} of {totalPages}
            </span>
            <button
              onClick={() => setHistoryPage((p) => Math.min(totalPages, p + 1))}
              disabled={historyPage === totalPages}
              className="px-3 py-2 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        )}
     </Card>

     {/* Payment Report Modal */}
     {isReportModalOpen && (
       <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
         <div className="bg-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-300">
           <div className="px-8 py-6 border-b flex items-center justify-between bg-muted/20">
             <div>
               <h3 className="text-xl font-black text-primary tracking-tight uppercase">Report Payment Problem</h3>
               <p className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">Attach details for the support team</p>
             </div>
             <button
               onClick={() => setIsReportModalOpen(false)}
               className="p-2 rounded-xl bg-white border hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
               aria-label="Close"
             >
               <XCircle size={24} />
             </button>
           </div>

           <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
             <div className="space-y-1">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Purchase</label>
               <select
                 value={reportOrderId}
                 onChange={(e) => {
                   const id = e.target.value;
                   setReportOrderId(id);
                   const selected = data.completedOrders.find(o => o._id === id);
                   setReportForm(prev => ({
                     ...prev,
                     purchaseDate: selected?.createdAt ? selected.createdAt.slice(0, 10) : prev.purchaseDate
                   }));
                 }}
                 className="w-full px-4 py-3 rounded-2xl border bg-white text-sm font-bold text-primary focus:ring-2 focus:ring-primary/10 outline-none"
               >
                 <option value="">Choose an order...</option>
                 {data.completedOrders.map(order => (
                   <option key={order._id} value={order._id}>
                     {`#${order._id.slice(-6).toUpperCase()} • LKR ${order.totalAmount.toLocaleString()} • ${new Date(order.createdAt).toLocaleDateString()}`}
                   </option>
                 ))}
               </select>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name</label>
                 <input
                   type="text"
                   value={reportForm.name}
                   onChange={(e) => setReportForm(prev => ({ ...prev, name: e.target.value }))}
                   className="w-full px-4 py-3 rounded-2xl border bg-white text-sm"
                   required
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Student Number</label>
                 <input
                   type="text"
                   value={reportForm.studentNumber}
                   onChange={(e) => setReportForm(prev => ({ ...prev, studentNumber: e.target.value }))}
                   className="w-full px-4 py-3 rounded-2xl border bg-white text-sm"
                   required
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Purchase Date</label>
                 <DatePicker
                   value={reportForm.purchaseDate}
                   onChange={(v) => setReportForm((prev) => ({ ...prev, purchaseDate: v }))}
                   placeholder="Select purchase date"
                   className="px-4 py-3 rounded-2xl border bg-white text-sm"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Slip</label>
                 <input
                   type="file"
                   accept="image/*,application/pdf"
                   onChange={(e) => setReportForm(prev => ({ ...prev, slip: e.target.files?.[0] || null }))}
                   className="w-full text-sm"
                 />
                 {reportForm.slip?.name && (
                   <p className="text-[10px] font-bold text-muted-foreground">Selected: {reportForm.slip.name}</p>
                 )}
               </div>
             </div>

             <div className="space-y-1">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</label>
               <textarea
                 value={reportForm.description}
                 onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                 rows={4}
                 className="w-full px-4 py-3 rounded-2xl border bg-white text-sm"
                 placeholder="Describe what went wrong (payment charged twice, not confirmed, etc.)"
                 required
               />
             </div>

             <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
               <button
                 type="button"
                 onClick={() => setIsReportModalOpen(false)}
                 className="px-5 py-3 rounded-2xl border font-black text-xs uppercase tracking-widest text-muted-foreground hover:bg-muted/30 transition-colors"
               >
                 Cancel
               </button>
               <button
                 type="button"
                 onClick={handleReportSubmit}
                 className="px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
               >
                 Submit Report
               </button>
             </div>
           </div>
         </div>
       </div>
     )}
   </div>
  );
}
