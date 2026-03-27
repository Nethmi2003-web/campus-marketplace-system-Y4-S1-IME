import React, { useState, useEffect } from "react";
import axios from "axios";
import { cn } from '../lib/utils';
import { 
  Trash2, Plus, Minus, ShoppingBag, 
  CreditCard, ShieldCheck, ArrowRight,
  Truck, Tag, Info, FileText, Lock
} from "lucide-react";
import { toast } from "react-toastify";
import { getBuyerSessionWithKey } from "../lib/session";

export function UserCartTab() {
  const [step, setStep] = useState("cart"); // 'cart' | 'checkout' | 'success'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [platformFeePercentage, setPlatformFeePercentage] = useState(5);
  const [cardDetails, setCardDetails] = useState({
    name: "",
    number: "",
    expiry: "",
    cvc: "",
    country: "Sri Lanka"
  });

  const fetchCart = async () => {
    try {
      const { session: userInfo } = getBuyerSessionWithKey();
      if (!userInfo.token) {
        setError("Please login to view your cart.");
        setLoading(false);
        return;
      }

      const [cartRes, settingsRes] = await Promise.all([
        axios.get("/api/cart", { headers: { Authorization: `Bearer ${userInfo.token}` } }),
        axios.get("/api/settings")
      ]);

      if (cartRes.data.success) {
        // Robust mapping that handles both old (populated) and new (embedded) cart data
        const cartItems = cartRes.data.data.items.map(item => {
          const product = item.product || {};
          return {
            ...item,
            id: product._id || product || item.product,
            title: item.name || product.title || "Unknown Item",
            price: item.price || product.price || 0,
            imageUrl: item.imageUrl || product.imageUrl || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=500&auto=format&fit=crop",
            category: item.category || product.category || "General",
            condition: item.condition || product.condition || "New"
          };
        });
        setItems(cartItems);
      }

      if (settingsRes.data.success) {
        setPlatformFeePercentage(settingsRes.data.data.platformFee);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching cart data:", err);
      setError("Failed to load your cart.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId, delta) => {
    const item = items.find(i => i.id === productId);
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + delta);
    
    try {
      const { session: userInfo } = getBuyerSessionWithKey();
      await axios.post("/api/cart", 
        { productId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      
      setItems(prev => prev.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (err) {
      console.error("Error updating quantity:", err);
      toast.error("Failed to update quantity.");
    }
  };

  const removeItem = async (productId) => {
    try {
      const { session: userInfo } = getBuyerSessionWithKey();
      await axios.delete(`/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      
      setItems(prev => prev.filter(item => item.id !== productId));
    } catch (err) {
      console.error("Error removing item:", err);
      toast.error("Failed to remove item.");
    }
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const { session: userInfo } = getBuyerSessionWithKey();
      const itemsSnapshot = items.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        category: item.category
      }));
      const subtotalValue = itemsSnapshot.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const platformFeeValue = Math.round(subtotalValue * (platformFeePercentage / 100));
      const totalValue = subtotalValue + platformFeeValue;

      const response = await axios.post("/api/orders", 
        { 
          paymentMethod, 
          shippingAddress: "SLIIT Main Campus - Student Lounge" // Default for now
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      if (response.data.success) {
        const apiOrder = response.data.data || {};
        const buyerName = apiOrder.buyerName || `${userInfo.firstName || "Student"} ${userInfo.lastName || ""}`.trim() || "Student Buyer";
        const builtOrder = {
          ...apiOrder,
          items: apiOrder.items || itemsSnapshot,
          subtotal: apiOrder.subtotal || subtotalValue,
          platformFee: apiOrder.platformFee || platformFeeValue,
          totalAmount: apiOrder.totalAmount || totalValue,
          paymentMethod,
          paymentReference: apiOrder.paymentIntentId || apiOrder._id || `PAY-${Date.now()}`,
          buyerName,
          shippingAddress: apiOrder.shippingAddress || "SLIIT Main Campus - Student Lounge",
          createdAt: apiOrder.createdAt || new Date().toISOString()
        };
        setOrderData(builtOrder);
        setStep("success");
        setItems([]); // Clear local cart
      }
      setLoading(false);
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(err.response?.data?.message || "Failed to process checkout.");
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!orderData) {
      toast.info("Receipt will be available once the order is placed.");
      return;
    }
    const itemsList = (orderData.items || [])
      .map(item => `- ${item.title} x${item.quantity} @ LKR ${item.price.toLocaleString()}`)
      .join("\n");
    const issuedOn = new Date(orderData.createdAt || Date.now()).toLocaleString();
    const receiptText = [
      "UNI SWAP Campus MarketPlace - Payment Receipt",
      `Receipt #: ${orderData.paymentReference || orderData._id || `PAY-${Date.now()}`}`,
      `Issued: ${issuedOn}`,
      `Payment Method: ${orderData.paymentMethod || paymentMethod}`,
      "",
      "Items:",
      itemsList || "No items recorded.",
      "",
      `Subtotal: LKR ${(orderData.subtotal || 0).toLocaleString()}`,
      `Platform Fee: LKR ${(orderData.platformFee || 0).toLocaleString()}`,
      `Total Paid: LKR ${(orderData.totalAmount || 0).toLocaleString()}`
    ].join("\n");

    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${orderData.paymentReference || orderData._id || Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const platformFee = Math.round(subtotal * (platformFeePercentage / 100));
  const total = subtotal + platformFee;

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xl font-bold text-primary animate-pulse tracking-tight">Checking your campus bag...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center shadow-xl shadow-red-100">
          <Info size={40} />
        </div>
        <div className="space-y-2 max-w-sm">
          <h1 className="text-3xl font-black text-red-500 mb-2 tracking-tight">Cart Issue</h1>
          <p className="text-muted-foreground font-medium">{error}</p>
        </div>
        <button onClick={fetchCart} className="px-8 py-3 bg-red-500 text-white rounded-2xl font-black shadow-lg hover:shadow-red-200 transition-all hover:scale-105">Retry</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-24 h-24 bg-muted/50 rounded-[2rem] flex items-center justify-center text-muted-foreground/30 shadow-inner">
          <ShoppingBag size={48} />
        </div>
        <div className="space-y-2 max-w-sm">
          <h1 className="text-4xl font-black text-primary mb-2 tracking-tight">Your bag is empty</h1>
          <p className="text-muted-foreground font-medium">Looks like you haven't added anything to your cart yet. Explore the marketplace to find great deals!</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-8 py-3 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all uppercase tracking-widest text-xs"
        >
          Browse Marketplace
        </button>
      </div>
    );
  }

  // --- CART STEP --- //
  if (step === "cart") {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Items List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-4xl font-black text-primary mb-2 tracking-tight">Shopping Cart</h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <ShoppingBag size={16} className="text-secondary" />
              You have {items.length} items in your campus bag
            </p>
          </div>

          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="group bg-card/40 backdrop-blur-xl border-2 border-white rounded-[2.5rem] p-4 md:p-6 transition-all hover:border-primary/20 hover:shadow-2xl shadow-xl shadow-black/5 flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="w-full md:w-32 h-32 rounded-[1.5rem] overflow-hidden bg-muted flex-shrink-0 relative">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1 block">{item.category}</span>
                      <h3 className="font-bold text-lg text-primary leading-tight line-clamp-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">Condition: {item.condition}</p>
                    </div>
                    <p className="font-black text-xl text-primary whitespace-nowrap">LKR {item.price.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:text-primary transition-all text-muted-foreground"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:text-primary transition-all text-muted-foreground"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 transition-colors p-2"
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Note/Promo */}
          <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <Tag size={20} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="font-bold text-primary text-sm">Have a promo code?</h4>
              <p className="text-xs text-muted-foreground">Apply student discounts or campus seasonal codes.</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input 
                type="text" 
                placeholder="Enter code" 
                className="px-4 py-2 rounded-xl bg-white border-transparent focus:border-primary/30 border focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold w-full md:w-32"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm">Apply</button>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#001f5c] rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden border-4 border-white/5">
            {/* Decorative Circle */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            
            <h3 className="text-2xl font-black mb-6 relative tracking-tight">Order Summary</h3>
            
            <div className="space-y-4 relative">
              <div className="flex justify-between text-sm font-medium text-white/70">
                <span>Subtotal</span>
                <span>LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-white/70">
                <div className="flex items-center gap-1.5">
                  <span>Platform Fee</span>
                  <Info size={12} className="opacity-50" />
                </div>
                <span>LKR {platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-white/70">
                <span>Delivery</span>
                <span className="text-secondary font-bold">FREE (On-Campus)</span>
              </div>
              
              <div className="pt-4 border-t border-white/10 mt-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Amount</p>
                    <p className="text-3xl font-black text-white">LKR {total.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setStep("checkout")}
              className="w-full mt-8 py-4 bg-secondary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              Proceed to Checkout
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-[10px] font-bold text-white/50 uppercase tracking-wider">
                <ShieldCheck size={14} className="text-secondary" />
                Secure Campus Payment
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-white/50 uppercase tracking-wider">
                <Truck size={14} className="text-secondary" />
                 Instant Handover or Delivery
              </div>
            </div>
          </div>

          {/* Help box */}
          <div className="bg-card/50 backdrop-blur-xl border-2 border-white rounded-[2rem] p-6 shadow-xl shadow-black/5">
             <h4 className="font-black text-primary mb-2 flex items-center gap-2 tracking-tight">
               <CreditCard size={16} className="text-secondary" /> Payment Methods
             </h4>
             <p className="text-xs text-muted-foreground leading-relaxed">
               We support SLIIT student cards, bank transfers, and secure cash-on-handover for all campus trades.
             </p>
          </div>
        </div>
      </div>
    );
  }

  // --- SUCCESS STEP --- //
  if (step === "success") {
    const receiptItems = orderData?.items || [];
    const paymentRef = orderData?.paymentReference || orderData?._id || `PAY-${Date.now()}`;
    const issuedOn = new Date(orderData?.createdAt || Date.now()).toLocaleString();
    const subtotalPaid = orderData?.subtotal ?? 0;
    const feePaid = orderData?.platformFee ?? 0;
    const totalPaid = orderData?.totalAmount ?? 0;

    return (
      <div className="max-w-3xl mx-auto py-12 space-y-10 animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="w-20 h-20 bg-green-500 text-white rounded-[1.75rem] flex items-center justify-center shadow-2xl shadow-green-200">
            <ShieldCheck size={44} />
          </div>
          <h2 className="text-4xl font-black text-primary tracking-tight">Payment Captured</h2>
          <p className="text-muted-foreground font-medium">
            Receipt #{paymentRef} • Paid via {orderData?.paymentMethod || paymentMethod}
          </p>
        </div>

        <div className="rounded-[2.5rem] border bg-card shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-[#001f5c] text-white px-8 py-6 flex items-center justify-between">
             <div>
                <p className="text-xs uppercase font-black tracking-widest text-white/70">Stripe Payment Receipt</p>
                <h3 className="text-2xl font-black">UNI SWAP Campus MarketPlace</h3>
             </div>
             <div className="text-right">
                <p className="text-sm font-bold">Issued {issuedOn}</p>
                <p className="text-xs text-white/70">Reference {paymentRef}</p>
             </div>
          </div>
          <div className="p-8 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Billed To</p>
                 <p className="font-bold text-primary">{orderData?.buyerName || "Student Buyer"}</p>
                 <p className="text-sm text-muted-foreground">{orderData?.shippingAddress || "SLIIT Main Campus - Student Lounge"}</p>
               </div>
               <div className="space-y-2">
                 <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Payment Method</p>
                 <p className="font-bold text-primary">{orderData?.paymentMethod || "Stripe (Card)"}</p>
                 <p className="text-sm text-muted-foreground">UI-only capture • Redirects to Stripe checkout</p>
               </div>
             </div>

             <div className="border rounded-2xl divide-y">
               {receiptItems.map(item => (
                 <div key={item.id || item._id || item.title} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="font-bold text-primary">{item.title}</p>
                      <p className="text-xs text-muted-foreground">Qty {item.quantity} • LKR {item.price?.toLocaleString()}</p>
                    </div>
                    <p className="font-black text-primary">LKR {(item.price * item.quantity).toLocaleString()}</p>
                 </div>
               ))}
               {receiptItems.length === 0 && (
                 <div className="px-4 py-3 text-sm text-muted-foreground">No items recorded for this receipt.</div>
               )}
             </div>

             <div className="space-y-2">
               <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>LKR {subtotalPaid.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Platform Fee</span>
                  <span>LKR {feePaid.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Total Paid</span>
                  <span className="text-2xl font-black text-primary">LKR {totalPaid.toLocaleString()}</span>
               </div>
             </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleDownloadReceipt}
            className="px-6 py-3 rounded-2xl border border-primary/40 text-primary font-black text-sm uppercase tracking-widest bg-white hover:bg-primary/5 transition-all flex items-center gap-2 shadow-sm"
          >
            <FileText size={18} /> Download Receipt
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  // --- CHECKOUT STEP --- //
  if (step === "checkout") return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setStep("cart")}
          className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <ArrowRight size={16} className="rotate-180" />
          </div>
          Back to Cart
        </button>
        <h2 className="text-2xl font-black text-primary tracking-tight text-center">Checkout</h2>
        <div className="w-24" /> {/* Spacer */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Method Selection */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <CreditCard size={20} /> Select Payment Method
          </h3>
          
          <div className="space-y-4">
            <div 
              onClick={() => setPaymentMethod("online")}
              className={cn(
                "p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden group",
                paymentMethod === 'online' ? "border-primary bg-primary/5 shadow-xl shadow-primary/5" : "border-muted hover:border-primary/20 bg-card"
              )}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                  paymentMethod === 'online' ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <CreditCard size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-primary">Online Payment</h4>
                  <p className="text-xs text-muted-foreground">Secure payment via Stripe</p>
                </div>
                <div className={cn(
                  "ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  paymentMethod === 'online' ? "border-primary bg-primary" : "border-muted"
                )}>
                  {paymentMethod === 'online' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </div>

            <div 
              onClick={() => setPaymentMethod("cash")}
              className={cn(
                "p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden group",
                paymentMethod === 'cash' ? "border-primary bg-primary/5 shadow-xl shadow-primary/5" : "border-muted hover:border-primary/20 bg-card"
              )}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                  paymentMethod === 'cash' ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <Truck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-primary">Cash on Handover</h4>
                  <p className="text-xs text-muted-foreground">Pay when you receive the item</p>
                </div>
                <div className={cn(
                  "ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  paymentMethod === 'cash' ? "border-primary bg-primary" : "border-muted"
                )}>
                  {paymentMethod === 'cash' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </div>
          </div>

          {paymentMethod === 'online' && (
            <div className="p-6 rounded-3xl border-2 border-primary/20 bg-white shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-primary">Stripe Card (UI only)</p>
                    <p className="text-xs text-muted-foreground">Capture card details before redirecting.</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-secondary uppercase tracking-widest bg-secondary/10 px-2 py-1 rounded-lg border border-secondary/30">Sandbox</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <input 
                  type="text"
                  placeholder="Cardholder Name"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border bg-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                />
                <input 
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border bg-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm font-mono tracking-widest"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input 
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                    className="px-4 py-3 rounded-2xl border bg-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                  />
                  <input 
                    type="text"
                    placeholder="CVC"
                    value={cardDetails.cvc}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cvc: e.target.value }))}
                    className="px-4 py-3 rounded-2xl border bg-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                  />
                  <input 
                    type="text"
                    placeholder="Country"
                    value={cardDetails.country}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, country: e.target.value }))}
                    className="px-4 py-3 rounded-2xl border bg-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                <Lock size={14} className="text-green-600" />
                <span>UI only: final payment is completed after redirecting to Stripe.</span>
              </div>
            </div>
          )}
        </div>

        {/* Order Preview & Action */}
        <div className="bg-[#001f5c] rounded-[2.5rem] p-8 text-white shadow-2xl flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-xl font-black">Final Review</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-white/60">
                <span>Items Subtotal</span>
                <span>LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-white/60">
                <span>Platform Fee</span>
                <span>LKR {platformFee.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Grand Total</p>
                  <p className="text-4xl font-black">LKR {total.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-4">
             <button 
               onClick={handleCheckout}
               disabled={loading}
               className="w-full py-5 bg-secondary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
             >
               {paymentMethod === 'online' ? "Pay with Stripe" : "Confirm Order"}
               {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ArrowRight size={18} />}
             </button>
             <p className="text-center text-[10px] text-white/40 font-bold px-4 leading-relaxed">
               By clicking the button, you agree to the UNI SWAP Campus MarketPlace terms and buyer protection policies.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
