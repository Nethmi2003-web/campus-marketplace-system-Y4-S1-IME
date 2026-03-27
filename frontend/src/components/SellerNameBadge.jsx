import React from "react";
import { cn } from "../lib/utils";

export function SellerNameBadge({ user, subtitle = "Store Owner", className }) {
  const firstName = user?.firstName || "Seller";
  const initial = String(firstName || "S").charAt(0).toUpperCase();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold text-foreground">{firstName}</p>
        <p className="text-[10px] text-secondary font-black uppercase tracking-widest">{subtitle}</p>
      </div>
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shadow-lg">
        <span className="text-white font-bold">{initial}</span>
      </div>
    </div>
  );
}

