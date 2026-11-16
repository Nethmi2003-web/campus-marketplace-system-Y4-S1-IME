import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, Image as ImageIcon, Calendar as CalendarIcon, MapPin, Users, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { toast } from "react-toastify";
import { PaginationControls } from "./shared/PaginationControls";
import { DatePicker } from "./shared/DatePicker";

export function AdminEventsTab() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const [formData, setFormData] = useState({
    name: "",
    faculty: "Computing",
    date: "",
    time: "",
    venue: "",
    organizedTeam: "",
    category: "General",
    description: "",
    status: "Upcoming",
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [events.length]);

  const totalPages = Math.max(1, Math.ceil(events.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedEvents = events.slice(startIndex, endIndex);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
          const { data } = await axios.get("/api/events");
      setEvents(data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast.warn("Please select an image for the event.");
      return;
    }
    if (!formData.date) {
      toast.warn("Please select an event date.");
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    data.append("image", imageFile);

    try {
      await axios.post("/api/events", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Event created successfully!", {
        icon: <ImageIcon className="text-emerald-500" size={18} />,
        style: { background: "#ecfdf3", color: "#166534", fontWeight: 700 },
        progressStyle: { background: "#22c55e" }
      });
      setShowForm(false);
      setImageFile(null);
      setFormData({
        name: "",
        faculty: "Computing",
        date: "",
        time: "",
        venue: "",
        organizedTeam: "",
        category: "General",
        description: "",
        status: "Upcoming",
      });
      fetchEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-primary tracking-tight">Campus Events</h2>
          <p className="text-muted-foreground font-medium">Manage university events and activities.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-bold border-2 border-primary/20 shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
        >
          {showForm ? "Cancel" : <><PlusCircle size={18} /> Add New Event</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border-2 border-border shadow-sm">
          <h3 className="text-xl font-bold text-primary mb-4">Create New Event</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Event Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 bg-muted/30 border-2 border-border rounded-xl focus:border-primary outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Faculty *</label>
                <select required name="faculty" value={formData.faculty} onChange={handleInputChange} className="w-full px-4 py-2 bg-muted/30 border-2 border-border rounded-xl focus:border-primary outline-none transition-all">
                  <option>Computing</option>
                  <option>Business</option>
                  <option>Engineering</option>
                  <option>Humanities & Sciences</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Date *</label>
                <DatePicker
                  value={formData.date}
                  onChange={(v) => setFormData((p) => ({ ...p, date: v }))}
                  placeholder="Select a date"
                  className="bg-muted/30 border-2 border-border rounded-xl focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Time</label>
                <input type="text" name="time" placeholder="e.g. 10:00 AM" value={formData.time} onChange={handleInputChange} className="w-full px-4 py-2 bg-muted/30 border-2 border-border rounded-xl focus:border-primary outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Venue *</label>
                <input required type="text" name="venue" value={formData.venue} onChange={handleInputChange} className="w-full px-4 py-2 bg-muted/30 border-2 border-border rounded-xl focus:border-primary outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Organized Team *</label>
                <input required type="text" name="organizedTeam" value={formData.organizedTeam} onChange={handleInputChange} className="w-full px-4 py-2 bg-muted/30 border-2 border-border rounded-xl focus:border-primary outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2 bg-muted/30 border-2 border-border rounded-xl focus:border-primary outline-none transition-all">
                  <option>General</option>
                  <option>Technology</option>
                  <option>Sports</option>
                  <option>Cultural</option>
                  <option>Academic</option>
                  <option>Social</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2 bg-muted/30 border-2 border-border rounded-xl focus:border-primary outline-none transition-all">
                  <option>Upcoming</option>
                  <option>Ongoing</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Event Flyer/Image *</label>
              <div className="w-full p-4 border-2 border-dashed border-border rounded-xl flex items-center justify-center bg-muted/10 hover:bg-muted/30 transition-all cursor-pointer">
                <input required type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageChange} className="w-full h-full" />
              </div>
              {imageFile && <p className="text-sm text-green-600 font-medium">Selected: {imageFile.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-4 py-2 bg-muted/30 border-2 border-border rounded-xl focus:border-primary outline-none transition-all"></textarea>
            </div>

            <div className="pt-4">
              <button disabled={isSubmitting} type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <ImageIcon size={18} />}
                {isSubmitting ? "Uploading & Saving..." : "Publish Event"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
           <div className="col-span-full flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : events.length === 0 ? (
           <div className="col-span-full text-center py-10 text-muted-foreground font-medium border-2 border-dashed rounded-2xl">No events found. Create one above!</div>
        ) : (
          pagedEvents.map(event => (
            <div key={event._id} className="bg-white rounded-2xl overflow-hidden border-2 border-border shadow-sm group hover:border-primary/30 transition-all">
              <div className="h-48 bg-muted relative overflow-hidden">
                <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm z-10">
                  {event.status}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-primary line-clamp-1">{event.name}</h3>
                <p className="text-sm font-medium text-secondary mb-3">{event.faculty}</p>
                <div className="space-y-2 text-sm text-muted-foreground font-medium">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={16} />
                    <span>{new Date(event.date).toLocaleDateString()} {event.time && `• ${event.time}`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span className="truncate">{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span className="truncate">{event.organizedTeam}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!isLoading && events.length > 0 && (
        <div className="pt-2">
          <PaginationControls
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
            from={events.length === 0 ? 0 : startIndex + 1}
            to={Math.min(endIndex, events.length)}
            total={events.length}
          />
        </div>
      )}
    </div>
  );
}
