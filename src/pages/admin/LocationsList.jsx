import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../../lib/firebase.js";
import { exportLocationsCsv } from "../../lib/csv.js";
import { exportQrPdf } from "../../lib/pdf.js";
import { useToast } from "../../components/Toast.jsx";
import { SkeletonTable } from "../../components/Skeleton.jsx";
import EmptyState from "../../components/EmptyState.jsx";

const MOCK = [
  { location_id: "EL-A-B01", kode_kategori: "EL", kategori: "Elektrikal & Kontrol", section_rak: "A", kode_bin: "B01", bin_group_id: "EL-A", deskripsi_lokasi: "Rak A Bin 1 atas", part_count: 3 },
  { location_id: "EL-A-B02", kode_kategori: "EL", kategori: "Elektrikal & Kontrol", section_rak: "A", kode_bin: "B02", bin_group_id: "EL-A", deskripsi_lokasi: "Rak A Bin 2", part_count: 0 },
  { location_id: "MK-B-C01", kode_kategori: "MK", kategori: "Mekanikal", section_rak: "B", kode_bin: "C01", bin_group_id: "MK-B", deskripsi_lokasi: "Mekanikal Section B", part_count: 1 },
];

export default function LocationsList() {
  const toast = useToast();
  const [rows, setRows] = useState(MOCK);
  const [q, setQ] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!isFirebaseConfigured()) return;
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(query(collection(db, "locations"), orderBy("location_id")));
      const data = snap.docs.map((d) => d.data());
      if (data.length) setRows(data);
    } catch (e) { console.error(e); setError("Gagal memuat: " + e.message); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let a = rows;
    if (q.trim()) {
      const s = q.toLowerCase();
      a = a.filter((r) => `${r.location_id} ${r.deskripsi_lokasi} ${r.kategori}`.toLowerCase().includes(s));
    }
    if (filterSection) a = a.filter((r) => r.section_rak === filterSection);
    return a;
  }, [rows, q, filterSection]);

  function toggleSel(id) {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSelected(n);
  }
  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.location_id)));
  }

  const selectedRows = filtered.filter((r) => selected.has(r.location_id));
  const exportRows = selectedRows.length ? selectedRows : filtered;

  async function handleDelete(id) {
    if (!confirm(`Hapus ${id}?`)) return;
    if (!isFirebaseConfigured()) {
      setRows((prev) => prev.filter((r) => r.location_id !== id));
      toast.success(`${id} dihapus`);
      return;
    }
    try {
      await deleteDoc(doc(db, "locations", id));
      toast.success(`${id} dihapus`);
      await load();
    } catch (e) { toast.error("Gagal hapus: " + e.message); }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="label-lg text-text-main">Rak / Bin</h1>
          <p className="caption text-text-secondary mt-0.5">Kelola lokasi rak dan bin untuk penyimpanan spare part.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/locations/create" className="btn-primary text-xs py-1.5 px-3">+ Tambah</Link>
          <Link to="/admin/locations/import" className="btn-secondary text-xs py-1.5 px-3">Import CSV</Link>
          <button onClick={() => exportLocationsCsv(exportRows)} className="btn-secondary text-xs py-1.5 px-3">Export CSV</button>
          <button onClick={() => exportQrPdf(exportRows)} className="btn-secondary text-xs py-1.5 px-3">Export PDF</button>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari ID / deskripsi..."
          className="flex-1 min-w-[200px] bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-main placeholder:text-text-secondary" />
        <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)}
          className="border border-border bg-surface text-text-main rounded-lg px-2.5 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
          <option value="">Semua Section</option>
          {[...new Set(rows.map((r) => r.section_rak))].map((s) => <option key={s} value={s}>Section {s}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-text-secondary whitespace-nowrap">
          <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="accent-primary" />
          ({filtered.length})
        </label>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
        {loading ? <div className="p-4"><SkeletonTable rows={5} cols={8} /></div> : (
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="p-3 w-8"><input type="checkbox" checked={selected.size === filtered.length && filtered.length>0} onChange={toggleAll} className="accent-primary" /></th>
              <th className="p-3 text-left caption font-semibold text-text-secondary">Location ID</th>
              <th className="p-3 text-left caption font-semibold text-text-secondary">Kategori</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">Sec</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">Bin</th>
              <th className="p-3 text-left caption font-semibold text-text-secondary">Deskripsi</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">Part</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.location_id} className="border-t border-border hover:bg-background/50">
                <td className="p-3 text-center"><input type="checkbox" checked={selected.has(r.location_id)} onChange={() => toggleSel(r.location_id)} className="accent-primary" /></td>
                <td className="p-3 font-mono text-sm font-medium"><Link to={`/location/${r.location_id}`} className="text-text-main hover:text-primary">{r.location_id}</Link></td>
                <td className="p-3 text-xs text-text-secondary">{r.kategori}</td>
                <td className="p-3 text-center text-sm text-text-main">{r.section_rak}</td>
                <td className="p-3 text-center text-sm text-text-main">{r.kode_bin}</td>
                <td className="p-3 text-xs text-text-secondary max-w-[200px] truncate" title={r.deskripsi_lokasi}>{r.deskripsi_lokasi}</td>
                <td className="p-3 text-center text-sm text-text-main">{r.part_count ?? "—"}</td>
                <td className="p-3 text-center">
                  <div className="flex gap-1 justify-center">
                    <Link to={`/location/${r.location_id}`} className="text-xs border border-border rounded-lg px-2 py-1 text-text-main hover:bg-background">Lihat</Link>
                    <button onClick={() => handleDelete(r.location_id)} className="text-xs border border-danger/30 rounded-lg px-2 py-1 text-danger hover:bg-danger/10">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="p-0">
              <EmptyState title="Belum ada lokasi" description="Buat lokasi baru atau impor dari CSV" action={<Link to="/admin/locations/create" className="btn-primary text-xs py-1.5 px-3">+ Buat Lokasi</Link>} />
            </td></tr>}
          </tbody>
        </table>
        </div>
        )}
      </div>
    </div>
  );
}
