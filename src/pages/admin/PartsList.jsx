import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../../lib/firebase.js";
import VedBadge from "../../components/VedBadge.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { VED_OPTIONS } from "../../lib/constants.js";
import { formatRupiah, hitungNilaiStok } from "../../lib/cost.js";
import { useToast } from "../../components/Toast.jsx";
import { SkeletonTable } from "../../components/Skeleton.jsx";

export default function PartsList() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [locFilter, setLocFilter] = useState("");
  const [vedFilter, setVedFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!isFirebaseConfigured()) { setRows([
      { part_id: "demo1", nama_part: "Kontaktor LC1D09", location_id: "EL-A-B01", kategori:"Elektrikal & Kontrol", brand:"Schneider", part_number:"LC1D09M7", stok_saat_ini:4, stok_minimum:2, satuan:"pcs" },
    ]); return; }
    setLoading(true);
    setError("");
    try {
      const snap = await getDocs(query(collection(db, "parts"), orderBy("nama_part")));
      setRows(snap.docs.map(d => ({ part_id: d.id, ...d.data() })));
    } catch(e){ console.error(e); setError("Gagal memuat: " + e.message); }
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  const filtered = useMemo(()=>{
    let a = rows;
    if (locFilter) a = a.filter(r => r.location_id === locFilter);
    if (vedFilter) a = a.filter(r => (r.kekritisan||"Desirable") === vedFilter);
    if (q.trim()) {
      const s = q.toLowerCase();
      a = a.filter(r => `${r.nama_part} ${r.part_number} ${r.brand} ${r.location_id}`.toLowerCase().includes(s));
    }
    return a;
  },[rows,q,locFilter,vedFilter]);

  async function handleDelete(id){
    if(!confirm("Hapus part "+id+"?")) return;
    if(!isFirebaseConfigured()){ setRows(prev=>prev.filter(r=>r.part_id!==id)); toast.success("Part dihapus"); return; }
    try {
      await deleteDoc(doc(db,"parts",id));
      toast.success("Part dihapus");
      await load();
    } catch(e) { toast.error("Gagal hapus: " + e.message); }
  }

  const locs = [...new Set(rows.map(r=>r.location_id))].sort();

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="label-lg text-text-main">Spare Part</h1>
          <p className="caption text-text-secondary mt-0.5">Kelola data spare part termasuk nama, nomor part, dan lokasi.</p>
        </div>
        <Link to="/admin/parts/create" className="btn-primary text-xs py-1.5 px-3">+ Tambah Part</Link>
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari nama / part number / brand..."
          className="flex-1 min-w-[200px] bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-main placeholder:text-text-secondary" />
        <select value={locFilter} onChange={e=>setLocFilter(e.target.value)}
          className="border border-border bg-surface text-text-main rounded-lg px-2.5 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
          <option value="">Semua Lokasi</option>
          {locs.map(l=> <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={vedFilter} onChange={e=>setVedFilter(e.target.value)}
          className="border border-border bg-surface text-text-main rounded-lg px-2.5 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
          <option value="">Semua VED</option>
          {VED_OPTIONS.map(v=> <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
        {loading ? <div className="p-4"><SkeletonTable rows={5} cols={10} /></div> : (
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="p-3 text-left caption font-semibold text-text-secondary">Nama Part</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">VED</th>
              <th className="p-3 text-left caption font-semibold text-text-secondary">Lokasi</th>
              <th className="p-3 text-left caption font-semibold text-text-secondary">Part Number</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">Stok</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">Est.</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">Min</th>
              <th className="p-3 text-right caption font-semibold text-text-secondary">Harga</th>
              <th className="p-3 text-right caption font-semibold text-text-secondary">Nilai</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r=>{
              const low = Number(r.stok_saat_ini) <= Number(r.stok_minimum);
              return (
                <tr key={r.part_id} className={`border-t border-border hover:bg-background/50 ${low?"bg-danger/5":""}`}>
                  <td className="p-3">
                    <Link to={`/part/${r.part_id}`} className="font-medium text-text-main hover:text-primary">{r.nama_part}</Link>
                    <div className="text-[11px] text-text-secondary">{r.brand} · {r.kategori}</div>
                  </td>
                  <td className="p-3 text-center"><VedBadge value={r.kekritisan} /></td>
                  <td className="p-3 font-mono text-xs"><Link to={`/location/${r.location_id}`} className="text-text-secondary hover:text-primary">{r.location_id}</Link></td>
                  <td className="p-3 font-mono text-xs text-text-main">{r.part_number} {r.part_number_alternatif?.length? <span className="text-text-secondary">+{r.part_number_alternatif.length}</span>:null}</td>
                  <td className={`p-3 text-center font-bold ${low?"text-danger":"text-text-main"}`}>{r.stok_saat_ini} <span className="font-normal text-xs text-text-secondary">{r.satuan}</span></td>
                  <td className="p-3 text-center text-xs font-mono text-text-secondary">{r.hitung_status==="ok" && r.estimasi_hari_tersisa!=null ? `${Math.round(Number(r.estimasi_hari_tersisa))}h` : "—"}</td>
                  <td className="p-3 text-center text-sm text-text-main">{r.stok_minimum}</td>
                  <td className="p-3 text-right text-xs text-text-main">{r.harga_satuan != null ? formatRupiah(r.harga_satuan) : "—"}</td>
                  <td className="p-3 text-right text-xs font-mono text-text-main">{r.harga_satuan != null ? formatRupiah(hitungNilaiStok(r)) : "—"}</td>
                  <td className="p-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <Link to={`/part/${r.part_id}`} className="text-xs border border-border rounded-lg px-2 py-1 text-text-main hover:bg-background">Detail</Link>
                      <button onClick={()=>handleDelete(r.part_id)} className="text-xs border border-danger/30 rounded-lg px-2 py-1 text-danger hover:bg-danger/10">Hapus</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length===0 && <tr><td colSpan={10} className="p-0">
              <EmptyState title="Belum ada part" description="Tambah part baru untuk mulai melacak inventaris" action={<Link to="/admin/parts/create" className="btn-primary text-xs py-1.5 px-3">+ Tambah Part</Link>} />
            </td></tr>}
          </tbody>
        </table>
        </div>
        )}
      </div>
    </div>
  );
}
