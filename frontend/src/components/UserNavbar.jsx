import React from "react";
import { Search, Bell, ShoppingCart, User, Heart } from "lucide-react";

export function UserNavbar({ user, setActiveTab, cartCount = 0, wishlistCount = 0 }) {
  return (
    <nav className="h-20 bg-background/95 backdrop-blur-md border-b fixed top-0 left-0 right-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-white font-black text-xl">UNI</span>
        </div>
        <div className="hidden md:flex flex-col cursor-pointer" onClick={() => setActiveTab("overview")}>
          <span className="font-black text-primary leading-tight tracking-tight">UNI SWAP MARKETPLACE</span>
          <span className="text-[10px] uppercase font-black text-secondary tracking-widest">Digital Campus</span>
        </div>
      </div>

      <div className="hidden md:flex relative max-w-md w-full mx-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search items, events, users..."
          className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-muted/30 border-2 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-medium"
        />
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={() => setActiveTab("cart")}
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
          onClick={() => setActiveTab("wishlist")}
          className="relative p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors"
        >
          <Heart size={20} />
          {wishlistCount > 0 && (
            <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-md">
              {wishlistCount > 99 ? "99+" : wishlistCount}
            </div>
          )}
        </button>

        <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors" type="button">
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-primary tracking-tight leading-none mb-1">{user?.firstName || "Student"}</p>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{user?.faculty || "Faculty"}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-110 transition-transform">
            <User className="text-white" size={20} />
          </div>
        </div>
      </div>
    </nav>
  );
}

