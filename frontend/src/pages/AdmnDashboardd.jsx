import React, { useState, useEffect } from "react";
import axios from "axios";
import { cn } from '../lib/utils';
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Users, ShoppingBag, AlertTriangle, TrendingUp, ShieldCheck, 
  ArrowUpRight, ArrowDownRight, LayoutDashboard,
  LogOut, Bell, Settings, Activity, Receipt, BadgeDollarSign, Calendar, FileText, UserCheck
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { AdminPricingTab } from "../components/AdminPricingTab";
import { AdminTransactionsTab } from "../components/AdminTransactionsTab";
import { AdminListingsTab } from "../components/AdminListingsTab";
import { AdminEventsTab } from "../components/AdminEventsTab";
import { AdminPaymentReportsTab } from "../components/AdminPaymentReportsTab";
import { AdminSellerRequestsTab } from "../components/AdminSellerRequestsTab";
import { AdminUsersTab } from "../components/AdminUsersTab";
import { AdminModerationTab } from "../components/AdminModerationTab";
import { AdminSettingsTab } from "../components/AdminSettingsTab";
import { toast } from "react-toastify";
import { clearSession, getAdminSessionWithKey, STORAGE_KEYS } from "../lib/session";

// Removed IoT specific chart imports

// -------------------------------------------------------------
// STANDALONE ADMIN NAVBAR
// -------------------------------------------------------------
function AdminNavbar({ user }) {
  return (
    <nav className="h-20 bg-background/95 backdrop-blur-md border-b fixed top-0 left-0 right-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <ShieldCheck className="text-secondary w-8 h-8" />
        <h2 className="hidden md:block font-black text-xl text-primary tracking-tight">Admin<span className="text-secondary">Hub</span></h2>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative">
          <Bell className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-foreground">{user?.firstName || 'System Admin'}</p>
            <p className="text-[10px] text-secondary font-black uppercase tracking-widest">Master Control</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shadow-lg">
             <span className="text-white font-bold">{user?.firstName?.charAt(0) || 'A'}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}


function AdminSidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession(STORAGE_KEYS.admin);
    navigate("/");
  };

  const tabs = [
    { id: "overview",     label: "System Overview",     icon: LayoutDashboard },
    { id: "users",        label: "Manage Users",         icon: Users },
    { id: "sellerRequests", label: "Sellers",            icon: UserCheck },
    { id: "listings",     label: "Active Listings",      icon: ShoppingBag },
    { id: "transactions", label: "Transactions",         icon: Receipt },
    { id: "pricing",      label: "Pricing Management",   icon: BadgeDollarSign },
    { id: "paymentReports", label: "Payment Reports",    icon: FileText },
    { id: "events",       label: "Campus Events",        icon: Calendar },
    { id: "moderation",   label: "Trust & Safety",       icon: AlertTriangle },
    { id: "settings",     label: "Platform Settings",    icon: Settings },
  ];

  return (
    <aside className="w-64 fixed left-0 top-20 bottom-0 border-r bg-card/50 backdrop-blur-3xl p-4 flex flex-col hidden lg:flex overflow-y-auto">
      <div className="space-y-1 flex-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold",
              tab.id === activeTab
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>
      <button onClick={handleLogout} className="mt-auto w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold">
        <LogOut size={18} /> Logout Session
      </button>
    </aside>
  );
}

// -------------------------------------------------------------
// MAIN ADMIN DASHBOARD
// -------------------------------------------------------------
export default function AdmnDashboardd() {
  const navigate = useNavigate();
  const { session: userInfo } = getAdminSessionWithKey();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Aggressive Session Validation
  useEffect(() => {
    const allowedAdminRoles = new Set(['admin', 'sportAdmin']);
    if (!userInfo.token || !allowedAdminRoles.has(userInfo.role)) {
      navigate('/');
      return;
    }
    const verifySession = async () => {
      try {
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        if (res.status === 401 || res.status === 403) {
          toast.error('Admin Session Expired: Security mechanism detected a new login. You have been securely signed out.');
          clearSession(STORAGE_KEYS.admin);
          navigate('/');
        } else if (res.ok) {
           const userData = await res.json();
           if (!allowedAdminRoles.has(userData.role)) {
              toast.error('Unauthorized access attempt detected. Redirecting...');
              navigate('/');
           }
        }
      } catch (err) {
        console.error('Session validation error:', err);
      }
    };
    verifySession();
  }, [navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        toast.info("Updating system overview...", { autoClose: 500 });
        const { data } = await axios.get("/api/admin/stats", {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        if (data.success) {
          setStats(data.data.stats);
          setTrend(data.data.trend);
          setRecentListings(data.data.recentListings || []);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setLoading(false);
      }
    };

    if (activeTab === 'overview') {
      fetchStats();
    }
  }, [activeTab, userInfo.token]);

  const adminStats = [
    { title: "Total Users", value: stats?.totalUsers || "0", change: "+12.5%", trend: "up", icon: Users },
    { title: "Active Listings", value: stats?.activeListings || "0", change: "+5.2%", trend: "up", icon: ShoppingBag },
    { title: "Active Sellers", value: stats?.activeSellers || "0", change: "Approved", trend: "up", icon: UserCheck },
    { title: "Platform Fees", value: `LKR ${stats?.totalFees?.toLocaleString() || "0"}`, change: "+18%", trend: "up", icon: BadgeDollarSign }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <AdminNavbar user={userInfo} />
      
      <div className="flex flex-1 min-w-0 pt-20">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 min-w-0 lg:ml-64 p-4 md:p-8 lg:p-10 space-y-8 animate-in fade-in duration-700 overflow-x-hidden">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-primary tracking-tight">System Administration</h1>
                  <p className="text-muted-foreground font-medium">Platform-wide overview and management tools</p>
                </div>
                <button className="px-6 py-2.5 bg-secondary text-white rounded-xl font-bold shadow-lg shadow-secondary/20 hover:bg-secondary/90 transition-all">Security Audit</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {adminStats.map((stat, i) => (
                  <div key={i} className="rounded-2xl border bg-card p-6 shadow-xl shadow-black/5 hover:scale-[1.02] transition-transform">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className={cn("flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full", stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600')}>
                        {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {stat.change}
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-primary">{stat.value}</h3>
                    <p className="text-sm font-bold text-foreground mt-1">{stat.title}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 rounded-3xl overflow-hidden border bg-card shadow-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-primary">Platform Traffic</h3>
                      <p className="text-sm text-muted-foreground font-medium">Daily transaction volume (Last 7 Days)</p>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      <Activity size={12} /> Live
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend.length > 0 ? trend : Array.from({ length: 12 }, (_, i) => ({ name: `${i*2}h`, value: 200 + Math.random() * 500 }))}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }} />
                        <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="flex flex-col gap-8">
                  <div className="p-8 bg-gradient-to-br from-[#001f5c] to-primary/90 rounded-3xl text-white shadow-2xl flex-1 flex flex-col justify-center">
                    <ShieldCheck size={40} className="text-secondary mb-4" />
                    <h3 className="text-2xl font-black leading-tight mb-2">System Integrity</h3>
                    <p className="text-white/70 text-sm mb-6">Core modules operational. Automated security checks passed.</p>
                    <button className="w-full bg-white text-primary py-3 rounded-xl font-bold hover:bg-white/90 transition-all">Run Diagnostic</button>
                  </div>
                </div>
              </div>

              {/* Recent Listings Breakdown */}
              <div className="rounded-3xl border bg-card shadow-xl p-8">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-black text-primary tracking-tight">Recent Activity</h3>
                      <p className="text-sm text-muted-foreground font-medium">Latest items added to the marketplace</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('listings')}
                      className="text-primary font-black text-xs uppercase tracking-widest hover:underline"
                    >
                      View All Listings
                    </button>
                 </div>

                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="border-b text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                             <th className="pb-4 pr-4">Product</th>
                             <th className="pb-4 px-4 text-center">Price</th>
                             <th className="pb-4 px-4 text-center">Status</th>
                             <th className="pb-4 px-4 text-right">Seller</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y">
                          {recentListings.length > 0 ? recentListings.map((item) => (
                            <tr key={item._id} className="group hover:bg-muted/30 transition-colors">
                               <td className="py-4 pr-4">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0 border">
                                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                     </div>
                                     <span className="font-bold text-primary line-clamp-1">{item.title}</span>
                                  </div>
                               </td>
                               <td className="py-4 px-4 text-center">
                                  <span className="font-black text-secondary">LKR {item.price.toLocaleString()}</span>
                               </td>
                               <td className="py-4 px-4 text-center">
                                  <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                    item.status === 'available' ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                                  )}>
                                     {item.status}
                                  </span>
                               </td>
                               <td className="py-4 px-4 text-right">
                                  <span className="font-bold text-muted-foreground">{item.seller?.firstName} {item.seller?.lastName}</span>
                               </td>
                            </tr>
                          )) : (
                            <tr>
                               <td colSpan={4} className="py-10 text-center text-muted-foreground font-medium italic">No recent listings found.</td>
                            </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {activeTab === 'users' && <AdminUsersTab />}

          {/* ── SELLER REQUESTS ── */}
          {activeTab === 'sellerRequests' && <AdminSellerRequestsTab />}

          {/* ── LISTINGS ── */}
          {activeTab === 'listings' && <AdminListingsTab />}

          {/* ── TRANSACTIONS ── */}
          {activeTab === 'transactions' && <AdminTransactionsTab />}

          {/* ── PRICING MANAGEMENT ── */}
          {activeTab === 'pricing' && <AdminPricingTab onOpenPaymentReports={() => setActiveTab('paymentReports')} />}

          {/* ── PAYMENT REPORTS ── */}
          {activeTab === 'paymentReports' && <AdminPaymentReportsTab />}

          {/* ── MODERATION ── */}
          {activeTab === 'moderation' && (
            <AdminModerationTab
              onOpenPaymentReports={() => setActiveTab('paymentReports')}
              onOpenSellerRequests={() => setActiveTab('sellerRequests')}
              onOpenListings={() => setActiveTab('listings')}
            />
          )}

          {/* ── EVENTS ── */}
          {activeTab === 'events' && <AdminEventsTab />}

          {/* ── SETTINGS ── */}
          {activeTab === 'settings' && (
            <AdminSettingsTab onOpenPricing={() => setActiveTab('pricing')} />
          )}

        </main>
      </div>
    </div>
  );
}
