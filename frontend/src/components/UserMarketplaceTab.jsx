import React from "react";
import MarketplaceUI from "./MarketplaceUI";

export function UserMarketplaceTab({ onWishlistChange, onCartChange }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <MarketplaceUI onWishlistChange={onWishlistChange} onCartChange={onCartChange} />
    </div>
  );
}

