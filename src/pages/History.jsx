import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase.js";
import Papa from "papaparse";
import { formatRupiah } from "../lib/cost.js";
import { SkeletonTable } from "../components/Skeleton.jsx";
import EmptyState from "../components/EmptyState.jsx";

function fmt(ts){ if(!ts) return "-"; try{ const d = ts.toDate ? ts.toDate() : new Date(ts); return d.toLocaleString("id-ID"); } catch{ return String(ts); } }

export default function History(){
  const [sp] = useSearchParams();
  const partFilter = sp.get("part") || "";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTipe, setFilterTipe] = useState("");
  const [locFilter, setLocFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [error, setError] = useState("");

  useEffect(()=>{
    async function load(){
      setLoading(true);
      if(!isFirebaseConfigured()){
        setRows([
          { history_id:"h1", part_id:"demo1", location_id:"EL-A-B01", tipe:"keluar", jumlah:2, timestamp:new Date(), nama_pengambil:"Budi", keperluan:"Breakdown", stok_sesudah:2 },
          { history_id:"h2", part_id:"demo1", location_id:"EL-A-B01", tipe:"masuk", jumlah:5, timestamp:new Date(), nama_pengambil:"Admin", keperluan:"Restock", stok_sesudah:4 },
        ].filter(r=>!partFilter || r.part_id===partFilter).filter(r=>!filterTipe || r.tipe===filterTipe));
        setLoading(false); return;
      }
      try{
        let q = query(collection(db,"stock_history"), orderBy("timestamp","desc"), limit(100));
        if(partFilter){
          q = query(collection(db,"stock_history"), where("part_id","==",partFilter), orderBy("timestamp","desc"), limit(100));
        }
        const snap = await getDocs(q);
        let data = snap.docs.map(d=>({ history_id:d.id, ...d.data() }));
        if(filterTipe) data = data.filter(r=>r.tipe===filterTipe);
        setRows(data);
      } catch(e){ console.error(e); setRows([]); setError("Gagal memuat history: " + e.message); }
      setLoading(false);
    }
    load();
  },[partFilter, filterTipe]);

  const filtered = useMemo(()=>{
    let a = rows;
    if(locFilter) a = a.filter(r=>r.location_id===locFilter);
    if(dateFrom){
      const d = new Date(dateFrom); d.setHours(0,0,0,0);
      a = a.filter(r=>{ const t = r.timestamp?.toDate ? r.timestamp.toDate() : new Date(r.timestamp); return t >= d; });
    }
    if(dateTo){
      const d = new Date(dateTo); d.setHours(23,59,59,999);
      a = a.filter(r=>{ const t = r.timestamp?.toDate ? r.timestamp.toDate() : new Date(r.timestamp); return t <= d; });
    }
    return a;
  },[rows, locFilter, dateFrom, dateTo]);

  function exportCsv(){
    const csv = Papa.unparse(filtered.map(r=>({ timestamp: fmt(r.timestamp), part_id:r.part_id, location_id:r.location_id, location_id_asal:r.location_id_asal||"", location_id_tujuan:r.location_id_tujuan||"", tipe:r.tipe, jumlah:r.jumlah, harga_satuan_snapshot:r.harga_satuan_snapshot ?? "", total_biaya:r.total_biaya ?? (r.harga_satuan_snapshot ? Number(r.jumlah)*Number(r.harga_satuan_snapshot) : ""), stok_sesudah:r.stok_sesudah, nama_pengambil:r.nama_pengambil, keperluan:r.keperluan, catatan:r.catatan||"" })));
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`history_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  const locs = [...new Set(rows.map(r=>r.location_id))].filter(Boolean).sort();

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="label-lg text-text-main">Riwayat Stok</h1>
        <p className="caption text-text-secondary mt-0.5">Lihat semua transaksi masuk, keluar, dan transfer. Gunakan filter untuk mencari berdasarkan tipe, lokasi, atau rentang tanggal.</p>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <select value={filterTipe} onChange={e=>setFilterTipe(e.target.value)}
          className="border border-border bg-surface text-text-main rounded-lg px-2.5 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
          <option value="">Semua tipe</option>
          <option value="keluar">Keluar</option>
          <option value="masuk">Masuk</option>
          <option value="transfer">Transfer</option>
        </select>
        <select value={locFilter} onChange={e=>setLocFilter(e.target.value)}
          className="border border-border bg-surface text-text-main rounded-lg px-2.5 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
          <option value="">Semua lokasi</option>
          {locs.map(l=> <option key={l} value={l}>{l}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}
          className="border border-border bg-surface text-text-main rounded-lg px-2.5 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
        <span className="text-text-secondary">—</span>
        <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}
          className="border border-border bg-surface text-text-main rounded-lg px-2.5 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
        <button onClick={exportCsv} className="ml-auto btn-secondary text-xs py-2 px-3">Export CSV ({filtered.length})</button>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
        {loading ? <div className="p-4"><SkeletonTable rows={5} cols={8} /></div> : error ? (
          <div className="p-4 text-center text-sm text-danger">{error}</div>
        ) : (
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="p-3 text-left caption font-semibold text-text-secondary">Waktu</th>
              <th className="p-3 text-left caption font-semibold text-text-secondary">Part</th>
              <th className="p-3 text-left caption font-semibold text-text-secondary">Lokasi</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">Tipe</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">Jml</th>
              <th className="p-3 text-right caption font-semibold text-text-secondary">Biaya</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">Stok→</th>
              <th className="p-3 text-left caption font-semibold text-text-secondary">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r=>{
              const biaya = r.total_biaya != null ? r.total_biaya : (r.harga_satuan_snapshot != null ? Number(r.jumlah)*Number(r.harga_satuan_snapshot) : null);
              return (
              <tr key={r.history_id} className="border-t border-border hover:bg-background/50">
                <td className="p-3 text-xs whitespace-nowrap text-text-secondary">{fmt(r.timestamp)}</td>
                <td className="p-3 font-mono text-xs"><Link to={`/part/${r.part_id}`} className="text-text-secondary hover:text-primary">{r.part_id.slice(0,8)}</Link></td>
                <td className="p-3 font-mono text-xs"><Link to={`/location/${r.location_id}`} className="text-text-secondary hover:text-primary">{r.location_id}</Link>{r.tipe==="transfer" && r.location_id_tujuan ? <span className="text-text-secondary"> → <Link to={`/location/${r.location_id_tujuan}`} className="hover:text-primary">{r.location_id_tujuan}</Link></span> : null}</td>
                <td className="p-3 text-center"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.tipe==="keluar"?"bg-danger/10 text-danger":r.tipe==="transfer"?"bg-violet-100 text-violet-700":"bg-success/10 text-success"}`}>{r.tipe==="transfer"?`${r.location_id_asal||r.location_id} → ${r.location_id_tujuan}`:r.tipe}</span></td>
                <td className="p-3 text-center text-sm font-medium text-text-main">{r.jumlah}</td>
                <td className="p-3 text-right text-xs font-mono text-text-main">{biaya != null ? formatRupiah(biaya) : "—"}</td>
                <td className="p-3 text-center text-xs font-mono text-text-main">{r.stok_sesudah ?? "—"}</td>
                <td className="p-3 text-xs text-text-secondary">{r.nama_pengambil} · {r.keperluan} {r.catatan?`· ${r.catatan}`:""}</td>
              </tr>
              );
            })}
            {!loading && filtered.length===0 && <tr><td colSpan={8} className="p-0">
              <EmptyState title="Belum ada riwayat" description="Riwayat transaksi akan muncul setelah ada pengambilan atau penambahan stok" />
            </td></tr>}
          </tbody>
        </table>
        </div>
        )}
      </div>
    </div>
  );
}
