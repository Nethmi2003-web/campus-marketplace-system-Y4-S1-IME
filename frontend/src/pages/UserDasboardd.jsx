import React, { useState, useEffect } from "react";
import axios from "axios";
import { cn } from '../lib/utils';
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Building2, Search, Bell, ShoppingCart, User, LayoutDashboard,
  ShoppingBag, PlusCircle, ShieldCheck, LogOut,
  Heart
} from "lucide-react";
import { toast } from "react-toastify";
import { clearSession, getBuyerSessionWithKey } from "../lib/session";

import { MarketplaceHeader } from "../components/MarketplaceHeader";
import { FeaturedEvents } from "../components/FeaturedEvents";

import { UserCartTab } from "../components/UserCartTab";
import { UserWishlistTab } from "../components/UserWishlistTab";
import { EventCard } from "../components/EventCard";
import MarketplaceUI from "../components/MarketplaceUI";
import { UserSidebar } from "../components/shared/UserSidebar";
import { UserEventsTab } from "../components/UserEventsTab";
import { UserAnalyticsTab } from "../components/UserAnalyticsTab";


function UserNavbar({ user, setActiveTab, cartCount = 0, wishlistCount = 0 }) {
  return (
    <nav className="h-20 bg-background/95 backdrop-blur-md border-b fixed top-0 left-0 right-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-white font-black text-xl">S</span>
        </div>
        <div className="hidden md:flex flex-col cursor-pointer" onClick={() => setActiveTab('overview')}>
           <span className="font-black text-primary leading-tight tracking-tight">SLIIT MARKETPLACE</span>
           <span className="text-[10px] uppercase font-black text-secondary tracking-widest">Digital Campus</span>
        </div>
      </div>
      
      <div className="hidden md:flex relative max-w-md w-full mx-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search items, events, users..." className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-muted/30 border-2 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-medium" />
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => setActiveTab('cart')}
          className="relative p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors"
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-secondary text-white text-[10px] font-black flex items-center justify-center shadow-md">
              {cartCount > 99 ? "99+" : cartCount}
            </div>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('wishlist')}
          className="relative p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors"
        >
          <Heart size={20} />
          {wishlistCount > 0 && (
            <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-md">
              {wishlistCount > 99 ? "99+" : wishlistCount}
            </div>
          )}
        </button>
        <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors">
          <Bell size={20} />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-primary tracking-tight leading-none mb-1">{user?.firstName || 'Student'}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{user?.faculty || 'Faculty'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-110 transition-transform">
             <User className="text-white" size={20} />
          </div>
        </div>
      </div>
    </nav>
  );
}

// UserSidebar is now imported from shared components

// -------------------------------------------------------------
// MAIN USER DASHBOARD
// -------------------------------------------------------------
export default function UserDasboardd() {
  const navigate = useNavigate();
  const { session: userInfo, key: sessionKey } = getBuyerSessionWithKey();
  const [activeTab, setActiveTab] = useState("overview");
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  
  // Aggressive Session Validation
  React.useEffect(() => {
    const allowedRoles = new Set(['user', 'seller']);
    if (!userInfo.token || !allowedRoles.has(userInfo.role)) {
      navigate('/');
      return;
    }
    const verifySession = async () => {
      try {
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        if (res.status === 401 || res.status === 403) {
          toast.error('Session Expired: Security mechanism detected a new login. You have been securely signed out.');
          clearSession(sessionKey);
          navigate('/');
        } else if (res.ok) {
           const userData = await res.json();
           if (!allowedRoles.has(userData.role)) {
              toast.error('Unauthorized access. Redirecting...');
              navigate('/');
           }
        }
      } catch (err) {
        console.error('Session validation error:', err);
      }
    };
    verifySession();
  }, [navigate, userInfo.token, userInfo.role, sessionKey]);

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get("/api/events");
        // Map backend Event model to FeaturedEvents expected props
        const mappedEvents = data.data.map(event => ({
          id: event._id,
          title: event.name,
          date: new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          attendees: Math.floor(Math.random() * 200) + 50, // Realistic placeholder for now
          category: event.category,
          imageUrl: event.imageUrl,
          description: event.description
        }));
        setEvents(mappedEvents);
      } catch (error) {
        console.error("Error fetching live events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        if (!userInfo.token) return;
        const [cartRes, wishlistRes] = await Promise.all([
          axios.get("/api/cart", { headers: { Authorization: `Bearer ${userInfo.token}` } }),
          axios.get("/api/wishlist", { headers: { Authorization: `Bearer ${userInfo.token}` } })
        ]);
        setCartCount(cartRes.data?.data?.items?.length || 0);
        setWishlistCount(wishlistRes.data?.data?.products?.length || 0);
      } catch (err) {
        console.error("Count fetch error:", err);
      }
    };
    fetchCounts();
  }, [userInfo.token]);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <UserNavbar user={userInfo} setActiveTab={setActiveTab} cartCount={cartCount} wishlistCount={wishlistCount} />
      
      <div className="flex flex-1 min-w-0 pt-20">
        <UserSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 min-w-0 lg:ml-64 p-4 md:p-8 lg:p-10 space-y-8 animate-in fade-in duration-700 overflow-x-hidden">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 transition-all duration-500">
              <div className="flex flex-col gap-2">
                  <h1 className="text-4xl font-black text-primary tracking-tight">Welcome, {userInfo?.firstName || 'Student'}!</h1>
                  <p className="text-muted-foreground font-medium text-lg">Manage your marketplace activity and campus life</p>
              </div>
          </div>

          {activeTab === 'marketplace' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <MarketplaceUI 
                onWishlistChange={(count) => setWishlistCount(count)}
                onCartChange={(count) => setCartCount(count)}
              />
            </div>
          )}
          {activeTab === 'cart' && <UserCartTab />}

          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <MarketplaceHeader onSearch={() => {}} />
              {loadingEvents ? (
                <div className="flex justify-center py-10">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <FeaturedEvents events={events} onViewAll={() => setActiveTab('events')} />
              )}
            </div>
          )}


          {activeTab === 'analytics' && <UserAnalyticsTab />}
          {activeTab === 'events' && <UserEventsTab />}
          
          {activeTab === 'profile' && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-muted/20 rounded-[3rem] border-2 border-dashed border-muted">
               <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-primary">
                  <User size={40} />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-primary">Profile Settings</h3>
                  <p className="text-muted-foreground">Manage your university faculty and contact details here.</p>
               </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <UserWishlistTab 
              onWishlistChange={(count) => setWishlistCount(count)}
            />
          )}

        </main>
      </div>
    </div>
  );
}
