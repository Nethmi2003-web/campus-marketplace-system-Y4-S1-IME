import React from "react";
import { cn } from "../../lib/utils";
import { Button } from "./UI";

function buildPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => ({ type: "page", value: i + 1, key: `p-${i + 1}` }));
  }

  const keep = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1, currentPage - 2, currentPage + 2]);
  const nums = Array.from(keep)
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b);

  const items = [];
  let prev = 0;
  for (const n of nums) {
    if (n - prev > 1) items.push({ type: "ellipsis", key: `e-${prev}-${n}` });
    items.push({ type: "page", value: n, key: `p-${n}` });
    prev = n;
  }
  return items;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  from,
  to,
  total,
  className
}) {
  if (!totalPages || totalPages <= 1) return null;

  const safePage = Math.min(Math.max(1, currentPage || 1), totalPages);
  const pageItems = buildPageItems(safePage, totalPages);

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
      {typeof total === "number" && typeof from === "number" && typeof to === "number" && (
        <p className="text-sm text-muted-foreground font-bold">
          Showing <span className="text-primary font-black">{from}</span>-<span className="text-primary font-black">{to}</span> of{" "}
          <span className="text-primary font-black">{total}</span>
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={safePage <= 1}
          onClick={() => onPageChange?.(safePage - 1)}
        >
          Prev
        </Button>

        <div className="flex items-center gap-1 flex-wrap justify-center">
          {pageItems.map((it) => {
            if (it.type === "ellipsis") {
              return (
                <span key={it.key} className="h-9 min-w-9 px-2 rounded-xl text-xs font-black text-muted-foreground flex items-center justify-center">
                  ...
                </span>
              );
            }

            const p = it.value;
            return (
              <button
                key={it.key}
                onClick={() => onPageChange?.(p)}
                className={cn(
                  "h-9 min-w-9 px-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all",
                  p === safePage
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-white/50 backdrop-blur-md text-muted-foreground border-white hover:border-primary/20 hover:text-primary"
                )}
                aria-current={p === safePage ? "page" : undefined}
              >
                {p}
              </button>
            );
          })}
        </div>

        <Button
          size="sm"
          variant="outline"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange?.(safePage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

