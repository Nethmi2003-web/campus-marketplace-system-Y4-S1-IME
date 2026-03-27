import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Filter, Calendar, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";
import { EventCard } from "./EventCard";
import { PaginationControls } from "./shared/PaginationControls";

export function UserEventsTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get("/api/events");
        setEvents(data.data);
      } catch (error) {
        console.error("Error fetching all events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const categories = ["All", "Technology", "Sports", "Arts", "Social", "Academic"];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || event.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    setPage(1);
  }, [searchQuery, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedEvents = filteredEvents.slice(startIndex, endIndex);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header (match other dashboard tab headers) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black text-primary tracking-tight">Campus Events</h1>
          <p className="text-muted-foreground font-medium text-lg">Discover university activities</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or description..."
              className="w-full pl-12 pr-4 h-14 rounded-2xl border-white bg-white/50 backdrop-blur-md focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="h-14 px-6 bg-white/50 backdrop-blur-md border border-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:border-primary/20 hover:bg-white transition-all text-sm shadow-sm">
            <Filter className="w-4 h-4 text-primary" />
            Filters
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest font-black transition-all border-2 whitespace-nowrap shadow-sm",
              activeCategory === cat 
                ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105"
                : "bg-white/50 backdrop-blur-md text-muted-foreground border-white hover:border-primary/20 hover:text-primary"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-10">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-96 bg-card/50 rounded-[2rem] animate-pulse border-2 border-dashed border-muted" />
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pagedEvents.map((event) => (
              <EventCard
                key={event._id}
                id={event._id}
                title={event.name}
                description={event.description}
                date={new Date(event.date).toLocaleDateString()}
                time={event.time}
                location={event.venue}
                category={event.category}
                imageUrl={event.imageUrl}
                status="open"
              />
            ))}
          </div>

          <PaginationControls
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
            from={filteredEvents.length === 0 ? 0 : startIndex + 1}
            to={Math.min(endIndex, filteredEvents.length)}
            total={filteredEvents.length}
          />
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-card/50 rounded-[3rem] border-2 border-dashed border-muted">
           <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center text-primary">
              <Sparkles size={40} className="opacity-20" />
           </div>
           <div>
              <h3 className="text-2xl font-black text-primary">No events found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">Try adjusting your filters or search terms.</p>
           </div>
        </div>
      )}
    </div>
  );
}
