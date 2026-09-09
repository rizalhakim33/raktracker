import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase.js";
import Papa from "papaparse";
import { formatRupiah, totalNilaiStok } from "../lib/cost.js";
import { SkeletonTable } from "../components/Skeleton.jsx";

export default function Dashboard(){
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [all, setAll] = useState([]);
  const [catFilter, setCatFilter] = useState("");
  const [view, setView] = useState("low");
  const [error, setError] = useState("");

  useEffect(()=>{
    async function load(){
      setLoading(true);
      if(!isFirebaseConfigured()){
        const demo = [{ part_id:"demo2", nama_part:"Relay Omron MY4N", location_id:"EL-A-B01", kategori:"Elektrikal & Kontrol", stok_saat_ini:1, stok_minimum:2, satuan:"pcs", part_number:"MY4N-GS" }];
        setAll(demo); setRows(demo);
        setLoading(false); return;
      }
      try{
        const snap = await getDocs(query(collection(db,"parts"), orderBy("nama_part")));
        const allData = snap.docs.map(d=>({ part_id:d.id, ...d.data() }));
        setAll(allData);
        setRows(allData.filter(r=> Number(r.stok_saat_ini) <= Number(r.stok_minimum)));
      } catch(e){ console.error(e); setError("Gagal memuat data: " + e.message); }
      setLoading(false);
    }
    load();
  },[]);

  const filtered = useMemo(()=>{
    let a = view === "estimasi" ? all.filter(r=>r.hitung_status==="ok" && r.estimasi_hari_tersisa!=null) : rows;
    if(catFilter) a = a.filter(r=>r.kategori===catFilter);
    if(view==="estimasi") a = [...a].sort((a,b)=> Number(a.estimasi_hari_tersisa) - Number(b.estimasi_hari_tersisa));
    return a;
  },[rows,all,catFilter,view]);

  const stats = useMemo(()=>{
    const low = rows.length;
    const total = all.length;
    const est = all.filter(r=>r.hitung_status==="ok").length;
    const estSoon = all.filter(r=>r.hitung_status==="ok" && Number(r.estimasi_hari_tersisa) < 14).length;
    return { low, total, est, estSoon };
  },[all,rows]);

  function exportCsv(){
    const csv = Papa.unparse(filtered.map(r=>({ part_id:r.part_id, nama_part:r.nama_part, location_id:r.location_id, part_number:r.part_number, stok_saat_ini:r.stok_saat_ini, stok_minimum:r.stok_minimum, kategori:r.kategori, estimasi_hari_tersisa: r.estimasi_hari_tersisa ?? "", rata_pakai_per_hari: r.rata_pakai_per_hari ?? "", hitung_status: r.hitung_status ?? "" })));
    const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`${view}_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  const categories = [...new Set(all.map(r=>r.kategori))].filter(Boolean);
  const nilaiTotal = useMemo(()=> totalNilaiStok(all), [all]);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="label-lg text-text-main">Dashboard</h1>
        <p className="caption text-text-secondary mt-0.5">Pantau kondisi stok spare part secara keseluruhan. Gunakan filter untuk melihat item yang perlu segera direstock.</p>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <button onClick={()=>setView("low")} className={`label-sm border rounded-lg px-3 py-1.5 transition-colors ${view==="low"?"bg-danger text-white border-danger":"bg-surface text-text-secondary border-border hover:text-text-main hover:bg-background"}`}>Low: {stats.low}</button>
        <button onClick={()=>setView("estimasi")} className={`label-sm border rounded-lg px-3 py-1.5 transition-colors ${view==="estimasi"?"bg-warning text-white border-warning":"bg-surface text-text-secondary border-border hover:text-text-main hover:bg-background"}`}>Estimasi &lt;14h: {stats.estSoon}</button>
        <span className="label-sm bg-primary-light border border-border rounded-lg px-3 py-1.5 text-text-secondary">Total: <span className="text-text-main">{stats.total}</span></span>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} className="border border-border bg-surface text-text-main rounded-lg px-2.5 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
          <option value="">Semua kategori</option>
          {categories.map(c=> <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={exportCsv} className="border border-border bg-surface text-text-main rounded-lg px-3 py-1.5 text-sm hover:bg-background">Export CSV ({filtered.length})</button>
        <Link to="/cost" className="btn-primary text-xs py-1.5 px-3">Cost Report</Link>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
        {loading ? <div className="p-4"><SkeletonTable rows={5} cols={7} /></div> : (
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="p-3 text-left caption font-semibold text-text-secondary">Part</th>
              <th className="p-3 text-left caption font-semibold text-text-secondary">Lokasi</th>
              <th className="p-3 text-left caption font-semibold text-text-secondary">Kategori</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">Stok</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">Min</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">Est. Habis</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r=>{
              const est = r.hitung_status==="ok" && r.estimasi_hari_tersisa!=null ? `${Math.round(Number(r.estimasi_hari_tersisa))}h` : "—";
              const estSoon = r.hitung_status==="ok" && Number(r.estimasi_hari_tersisa) < 14;
              return (
                <tr key={r.part_id} className={`border-t border-border ${estSoon ? "bg-warning/5" : ""}`}>
                  <td className="p-3">
                    <Link to={`/part/${r.part_id}`} className="font-medium text-text-main hover:text-primary">{r.nama_part}</Link>
                    <div className="caption text-text-secondary">{r.part_number} {r.rata_pakai_per_hari ? `• ${Number(r.rata_pakai_per_hari).toFixed(2)}/hari` : ""}</div>
                  </td>
                  <td className="p-3 font-mono caption"><Link to={`/location/${r.location_id}`} className="text-text-secondary hover:text-primary">{r.location_id}</Link></td>
                  <td className="p-3 caption text-text-secondary">{r.kategori}</td>
                  <td className={`p-3 text-center font-bold ${Number(r.stok_saat_ini) <= Number(r.stok_minimum) ? "text-danger" : "text-text-main"}`}>{r.stok_saat_ini} <span className="font-normal caption text-text-secondary">{r.satuan}</span></td>
                  <td className="p-3 text-center text-text-main">{r.stok_minimum}</td>
                  <td className={`p-3 text-center caption font-mono ${estSoon ? "text-warning font-bold" : "text-text-secondary"}`}>{est}</td>
                  <td className="p-3 text-center"><Link to={`/part/${r.part_id}/transaction?type=masuk`} className="border border-border bg-surface text-text-main rounded-lg px-2.5 py-1 text-xs hover:bg-background">Restock</Link></td>
                </tr>
              );
            })}
            {!loading && filtered.length===0 && <tr><td colSpan={7} className="p-6 text-center text-text-secondary">{view==="estimasi" ? "Belum ada estimasi reliable (butuh 3 transaksi 30 hari)" : "Semua stok aman"}</td></tr>}
          </tbody>
        </table>
        </div>
        )}
      </div>
    </div>
  );
}
