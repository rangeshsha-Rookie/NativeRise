import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatNumber } from "../../utils/format";
import { useTranslation } from "react-i18next";

export function Pagination({
  page = 1,
  totalPages = 1,
  onPageChange,
  className = "",
}) {
  const { i18n } = useTranslation();
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - 1 && i <= page + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={`flex items-center justify-center gap-1.5 select-none ${className}`}
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="w-10 h-10 rounded-full flex items-center justify-center text-nr-ink hover:bg-nr-cream-2 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {pages.map((p, idx) => {
        if (p === "...") {
          return (
            <span key={`ellipsis-${idx}`} className="w-8 text-center text-nr-ink-2">
              ...
            </span>
          );
        }

        const isCurrent = p === page;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={isCurrent ? "page" : undefined}
            className={`w-10 h-10 rounded-full font-semibold text-sm transition-colors flex items-center justify-center ${
              isCurrent
                ? "bg-nr-primary text-nr-ink shadow-sm"
                : "text-nr-ink hover:bg-nr-cream-2"
            }`}
          >
            {formatNumber(p, i18n.language)}
          </button>
        );
      })}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="w-10 h-10 rounded-full flex items-center justify-center text-nr-ink hover:bg-nr-cream-2 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
}

export default Pagination;
