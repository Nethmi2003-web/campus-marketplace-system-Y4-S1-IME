import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clearSession, getBuyerSessionWithKey } from "../lib/session";

import { UserCartTab } from "../components/UserCartTab";
import { UserWishlistTab } from "../components/UserWishlistTab";
import { UserSidebar } from "../components/shared/UserSidebar";
import { UserEventsTab } from "../components/UserEventsTab";
import { UserAnalyticsTab } from "../components/UserAnalyticsTab";
import { UserNavbar } from "../components/UserNavbar";
import { UserWelcomeHeader } from "../components/UserWelcomeHeader";
import { UserProfileTab } from "../components/UserProfileTab";
import { UserOverviewTab } from "../components/UserOverviewTab";
import { UserMarketplaceTab } from "../components/UserMarketplaceTab";

// -------------------------------------------------------------
// MAIN USER DASHBOARD
// -------------------------------------------------------------
export default function UserDasboardd() {
  const navigate = useNavigate();
  const { session: userInfo, key: sessionKey } = getBuyerSessionWithKey();
  const [activeTab, setActiveTab] = useState("overview");
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [me, setMe] = useState(null);
  
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
           } else {
              setMe(userData);
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

  const displayUser = me || userInfo;

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <UserNavbar user={displayUser} setActiveTab={setActiveTab} cartCount={cartCount} wishlistCount={wishlistCount} />
      
      <div className="flex flex-1 min-w-0 pt-20">
        <UserSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 min-w-0 lg:ml-64 p-4 md:p-8 lg:p-10 space-y-8 animate-in fade-in duration-700 overflow-x-hidden">

          <UserWelcomeHeader user={displayUser} />

          {activeTab === 'marketplace' && (
            <UserMarketplaceTab
              onWishlistChange={(count) => setWishlistCount(count)}
              onCartChange={(count) => setCartCount(count)}
            />
          )}
          {activeTab === 'cart' && <UserCartTab />}

          {activeTab === 'overview' && (
            <UserOverviewTab
              events={events}
              loadingEvents={loadingEvents}
              onViewAllEvents={() => setActiveTab("events")}
            />
          )}


          {activeTab === 'analytics' && <UserAnalyticsTab />}
          {activeTab === 'events' && <UserEventsTab />}
          
          {activeTab === 'profile' && (
            <UserProfileTab user={displayUser} onUserUpdated={setMe} />
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
