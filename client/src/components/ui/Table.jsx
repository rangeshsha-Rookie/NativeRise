export function Table({
  columns = [],
  data = [],
  keyExtractor = (item, index) => item._id || item.id || index,
  emptyMessage = "No data available",
  className = "",
}) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-nr-ink-2 bg-nr-surface rounded-card border border-nr-line">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile Card View (< md) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {data.map((item, index) => (
          <div
            key={keyExtractor(item, index)}
            className="p-4 rounded-card bg-nr-surface border border-nr-line shadow-soft flex flex-col gap-2"
          >
            {columns.map((col) => (
              <div key={col.key} className="flex items-center justify-between gap-4 py-1 border-b border-nr-line/40 last:border-0">
                <span className="text-xs font-semibold text-nr-ink-2">
                  {col.header}
                </span>
                <span className="text-sm text-nr-ink text-right">
                  {col.render ? col.render(item, index) : item[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block overflow-hidden rounded-card border border-nr-line bg-nr-surface shadow-soft">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-nr-line bg-nr-cream-2/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3.5 px-5 text-xs font-semibold text-nr-ink-2 ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-nr-line/60">
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                className="hover:bg-nr-cream-2/20 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-4 px-5 text-sm text-nr-ink ${col.className || ""}`}
                  >
                    {col.render ? col.render(item, index) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
