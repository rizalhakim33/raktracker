export default function FilterBar({ q, setQ, filterLow, setFilterLow }) {
  return (
    <div className="flex gap-2 flex-wrap items-center bg-surface p-2 rounded-xl border border-border shadow-card">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / part number / brand..." className="flex-1 min-w-[180px] bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-main placeholder:text-text-secondary" />
      <button onClick={() => setFilterLow(!filterLow)} className={`caption px-3 py-1.5 rounded-full border ${filterLow ? "bg-danger/10 border-danger/20 text-danger" : "bg-surface border-border text-text-secondary hover:text-text-main hover:bg-background"}`}>
        {filterLow ? "● Low saja" : "○ Semua"}
      </button>
    </div>
  );
}
