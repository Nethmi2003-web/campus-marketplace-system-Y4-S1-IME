import React from "react";
import * as Popover from "@radix-ui/react-popover";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

function parseYMD(value) {
  if (!value || typeof value !== "string") return null;
  const parts = value.split("-").map((p) => Number(p));
  if (parts.length !== 3) return null;
  const [y, m, d] = parts;
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function toYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function sameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled,
  min,
  max,
  className
}) {
  const selected = React.useMemo(() => parseYMD(value), [value]);
  const minDate = React.useMemo(() => parseYMD(min), [min]);
  const maxDate = React.useMemo(() => parseYMD(max), [max]);

  const [open, setOpen] = React.useState(false);
  const [viewMonth, setViewMonth] = React.useState(() => selected || new Date());

  React.useEffect(() => {
    if (selected) setViewMonth(selected);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = firstOfMonth.getDay(); // 0..6 (Sun..Sat)

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const monthLabel = viewMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const displayLabel = selected
    ? selected.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })
    : "";

  const isDisabledDay = (date) => {
    if (!date) return true;
    if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
    if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
    return false;
  };

  const selectDay = (dayNum) => {
    if (!dayNum) return;
    const dt = new Date(year, month, dayNum);
    if (isDisabledDay(dt)) return;
    onChange?.(toYMD(dt));
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "w-full h-12 px-4 rounded-2xl border bg-white text-sm font-bold text-left flex items-center justify-between gap-3 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all",
            disabled ? "opacity-60 cursor-not-allowed" : "hover:border-primary/30",
            className
          )}
        >
          <span className={selected ? "text-primary" : "text-muted-foreground"}>{selected ? displayLabel : placeholder}</span>
          <Calendar size={18} className="text-muted-foreground" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          className="z-50 mt-2 rounded-3xl border bg-card shadow-2xl p-4 w-[320px] animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              type="button"
              onClick={() => setViewMonth(new Date(year, month - 1, 1))}
              className="h-10 w-10 rounded-2xl border bg-white hover:bg-muted/30 transition-colors flex items-center justify-center text-muted-foreground hover:text-primary"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="min-w-0 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Calendar</p>
              <p className="font-black text-primary truncate">{monthLabel}</p>
            </div>

            <button
              type="button"
              onClick={() => setViewMonth(new Date(year, month + 1, 1))}
              className="h-10 w-10 rounded-2xl border bg-white hover:bg-muted/30 transition-colors flex items-center justify-center text-muted-foreground hover:text-primary"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground py-1">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, idx) => {
              if (!d) return <div key={`e-${idx}`} className="h-9 w-9" />;

              const dt = new Date(year, month, d);
              const selectedDay = sameDay(dt, selected);
              const todayDay = sameDay(dt, today);
              const disabledDay = isDisabledDay(dt);

              return (
                <button
                  key={`d-${idx}`}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => selectDay(d)}
                  className={cn(
                    "h-9 w-9 rounded-2xl text-xs font-black transition-all border",
                    disabledDay
                      ? "bg-muted/20 text-muted-foreground border-transparent cursor-not-allowed"
                      : "bg-white hover:bg-primary/5 hover:border-primary/20 text-primary border-transparent",
                    todayDay && !selectedDay && !disabledDay ? "border-primary/20" : "",
                    selectedDay ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : ""
                  )}
                  aria-current={selectedDay ? "date" : undefined}
                >
                  {d}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                const dt = new Date();
                const todayYmd = toYMD(dt);
                if (minDate && parseYMD(todayYmd) < minDate) return;
                if (maxDate && parseYMD(todayYmd) > maxDate) return;
                onChange?.(todayYmd);
                setOpen(false);
              }}
              className="px-4 py-2 rounded-2xl border bg-white hover:bg-muted/30 transition-colors text-[10px] font-black uppercase tracking-widest text-primary"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-colors text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
            >
              Close
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

