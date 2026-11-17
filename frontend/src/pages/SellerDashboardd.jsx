import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Receipt,
  ShieldCheck,
  Search,
  LogOut,
  CheckCircle2,
  Clock,
  TrendingUp,
  Star,
  Edit3,
  Trash2,
  Upload,
} from 'lucide-react';

export default function SellerDashboardd() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample Seller Listings (Item Management Component)
  const [listings, setListings] = useState([
    {
      id: 'ITM-101',
      name: 'Data Structures & Algorithms (4th Ed.)',
      category: 'Books',
      price: 2500,
      status: 'Available',
      views: 48,
      aiPriceFlag: 'Fair Market Price',
    },
    {
      id: 'ITM-102',
      name: 'Casio FX-991EX Scientific Calculator',
      category: 'Electronics',
      price: 4200,
      status: 'Pending',
      views: 72,
      aiPriceFlag: 'Fair Market Price',
    },
    {
      id: 'ITM-103',
      name: 'Study Desk LED Lamp + USB Hub',
      category: 'Hostel Items',
      price: 1800,
      status: 'Sold',
      views: 31,
      aiPriceFlag: 'Fair Market Price',
    },
  ]);

  // Sample Incoming Orders & Payment Slips (Transaction & Pricing Component)
  const [orders, setOrders] = useState([
    {
      orderId: 'ORD-8821',
      buyerName: 'Vinuthan T.',
      studentId: 'IT23311022',
      items: 'Casio FX-991EX + DSA Notes (Bulk 10% Off)',
      total: 5400,
      slipStatus: 'Pending Verification',
      date: '2026-11-17',
    },
    {
      orderId: 'ORD-8809',
      buyerName: 'Pubudi P. V. A. A.',
      studentId: 'IT23252240',
      items: 'Study Desk LED Lamp',
      total: 1800,
      slipStatus: 'Approved',
      date: '2026-11-15',
    },
  ]);

  // New Item Form State
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Books',
    price: '',
    description: '',
  });

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    const created = {
      id: `ITM-${Math.floor(100 + Math.random() * 900)}`,
      name: newItem.name,
      category: newItem.category,
      price: Number(newItem.price),
      status: 'Available',
      views: 1,
      aiPriceFlag: 'Fair Market Price',
    };
    setListings([created, ...listings]);
    setNewItem({ name: '', category: 'Books', price: '', description: '' });
    setIsModalOpen(false);
  };

  const handleStatusChange = (id, newStatus) => {
    setListings(listings.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
  };

  const handleDeleteItem = (id) => {
    setListings(listings.filter((item) => item.id !== id));
  };

  const filteredListings = listings.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-800 font-sans">
      {/* Left Sidebar - Matches UniSwap Admin Navy Theme */}
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EA7828] flex items-center justify-center font-bold text-lg text-white shadow">
              U
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight text-[#EA7828]">UniSwap Seller</h1>
              <p className="text-xs text-slate-400">Verified Student Store</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1.5 mt-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === 'overview'
                  ? 'bg-[#EA7828] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/70'
              }`}
            >
              <span className="flex items-center gap-3">
                <LayoutDashboard size={18} /> Store Overview
              </span>
            </button>

            <button
              onClick={() => setActiveTab('listings')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === 'listings'
                  ? 'bg-[#EA7828] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/70'
              }`}
            >
              <span className="flex items-center gap-3">
                <Package size={18} /> My Listings
              </span>
              <span className="bg-slate-700 text-xs px-2 py-0.5 rounded-full">{listings.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === 'orders'
                  ? 'bg-[#EA7828] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/70'
              }`}
            >
              <span className="flex items-center gap-3">
                <Receipt size={18} /> Orders & Slips
              </span>
              <span className="bg-[#EA7828] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                1
              </span>
            </button>

            <button
              onClick={() => setActiveTab('trust')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === 'trust'
                  ? 'bg-[#EA7828] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800/70'
              }`}
            >
              <span className="flex items-center gap-3">
                <ShieldCheck size={18} /> Trust & AI Reviews
              </span>
            </button>
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <p className="text-xs font-medium text-slate-300 truncate">it23257122@my.sliit.lk</p>
          </div>
          <p className="text-[11px] text-slate-500 mb-3 pl-4">Verified Seller • Rank #2</p>
          <button className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-200 flex items-center justify-center gap-2 transition">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Seller Command Center</h2>
            <p className="text-sm text-slate-500">
              Manage campus listings, bulk pricing orders, and verified student receipts
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 text-slate-400" size={17} />
              <input
                type="text"
                placeholder="Search my items, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#EA7828]"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#EA7828] hover:bg-[#d9691c] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition"
            >
              <PlusCircle size={17} /> List New Item
            </button>
          </div>
        </div>

        {/* 4 KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Sales Volume (LKR)
            </p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">34,200</span>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <TrendingUp size={13} /> Rank #2 Campus
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Listings
            </p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">
                {listings.filter((i) => i.status === 'Available').length}
              </span>
              <span className="text-xs font-medium text-[#EA7828]">
                {listings.filter((i) => i.status === 'Pending').length} pending sale
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Payment Slips Status
            </p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">1</span>
              <span className="text-xs font-medium text-amber-600">Awaiting Admin Verify</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              AI Seller Trust Score
            </p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">94/100</span>
              <span className="text-xs font-medium text-emerald-600">92% Positive NLP</span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: My Item Inventory & Availability Management */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">My Campus Item Inventory</h3>
                <p className="text-xs text-slate-500">
                  Update item status (Available / Pending / Sold) & monitor AI fair-price checks
                </p>
              </div>
              <span className="bg-[#0F172A] text-white text-xs font-medium px-3 py-1.5 rounded-lg">
                Bulk Discount Eligible (2+ Items)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase text-slate-400">
                    <th className="py-3">Item & Category</th>
                    <th className="py-3">Price (LKR)</th>
                    <th className="py-3">Availability</th>
                    <th className="py-3">AI Check</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredListings.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 pr-3">
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        <span className="text-xs text-slate-400">
                          {item.id} • {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 font-semibold text-slate-800">
                        LKR {item.price.toLocaleString()}
                      </td>
                      <td className="py-3.5">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                            item.status === 'Available'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="Available">Available</option>
                          <option value="Pending">Pending</option>
                          <option value="Sold">Sold</option>
                        </select>
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-[#0F172A] text-white px-2.5 py-1 rounded-full">
                          <CheckCircle2 size={12} className="text-emerald-400" /> {item.aiPriceFlag}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          title="Edit Listing"
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          title="Delete Listing"
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Recent Buyer Orders & Sentiment Feed */}
          <div className="space-y-6">
            {/* Incoming Orders Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900">Incoming Student Orders</h3>
              <p className="text-xs text-slate-500 mb-4">
                Payment slip verification managed by UniSwap Admin
              </p>

              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.orderId}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        {order.buyerName} ({order.studentId})
                      </span>
                      <span className="text-xs font-bold text-[#EA7828]">
                        LKR {order.total.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{order.items}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">{order.orderId}</span>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          order.slipStatus === 'Approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {order.slipStatus === 'Approved' ? (
                          <CheckCircle2 size={11} />
                        ) : (
                          <Clock size={11} />
                        )}
                        {order.slipStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Review Sentiment Summary */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900">AI Buyer Review Sentiment</h3>
              <p className="text-xs text-slate-500 mb-4">NLP analysis of verified campus buyers</p>

              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Positive Sentiment
                  </span>
                </div>
                <p className="text-xs text-slate-700 italic">
                  "Calculator was in brand-new condition and met right outside the engineering block!"
                </p>
                <p className="text-[11px] text-slate-400">— Verified Student Buyer (IT23312708)</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal: Add New Item Listing */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Create Campus Listing</h3>
            <p className="text-xs text-slate-500 mb-4">
              Items are automatically scanned for abnormal pricing by UniSwap AI.
            </p>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Operating Systems Textbook"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EA7828]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EA7828]"
                  >
                    <option value="Books">Books</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Hostel Items">Hostel Items</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Price (LKR)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EA7828]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Condition
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe item condition, edition, or campus pickup spot..."
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#EA7828]"
                />
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-slate-500">
                <Upload className="mx-auto mb-1 text-slate-400" size={18} />
                Click to upload item photos (JPG, PNG)
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#EA7828] hover:bg-[#d9691c] text-white"
                >
                  Publish Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}