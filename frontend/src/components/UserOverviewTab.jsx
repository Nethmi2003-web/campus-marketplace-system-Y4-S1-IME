import React from "react";
import { MarketplaceHeader } from "./MarketplaceHeader";
import { FeaturedEvents } from "./FeaturedEvents";
import { Calendar, Sparkles } from "lucide-react";

export function UserOverviewTab({ events, loadingEvents, onViewAllEvents }) {
  const hasEvents = Array.isArray(events) && events.length > 0;
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <MarketplaceHeader onSearch={() => {}} />
      {loadingEvents ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : hasEvents ? (
        <FeaturedEvents events={events} onViewAll={onViewAllEvents} />
      ) : (
        <div className="rounded-[2.5rem] border bg-card/50 backdrop-blur-xl p-10 shadow-2xl shadow-primary/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-lg shadow-secondary/20">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-primary tracking-tight mb-1">Featured Events</h2>
                <p className="text-muted-foreground font-medium">
                  Nothing featured right now. Here are some examples while data loads.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onViewAllEvents}
              className="px-6 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Browse Events
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {[
              { title: "Tech Talk: AI for Students", tag: "Technology", date: "Apr 10" },
              { title: "Inter-Faculty Sports Night", tag: "Sports", date: "Apr 14" },
              { title: "Career Fair: Internships", tag: "Academic", date: "Apr 20" }
            ].map((m) => (
              <div
                key={m.title}
                className="rounded-[2rem] border bg-gradient-to-br from-primary/5 to-secondary/5 p-6 shadow-sm hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest">
                    {m.tag}
                  </span>
                  <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {m.date}
                  </span>
                </div>
                <p className="mt-4 text-lg font-black text-primary leading-snug">{m.title}</p>
                <p className="mt-2 text-sm text-muted-foreground font-medium">
                  Mock preview card (will be replaced by real featured events).
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
