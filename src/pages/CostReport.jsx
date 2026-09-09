import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase.js";
import { formatRupiah, totalNilaiStok, biayaPerKategori, biayaPerMesin } from "../lib/cost.js";
import Papa from "papaparse";
import { SkeletonBlock, SkeletonTable } from "../components/Skeleton.jsx";

function monthKey(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; }

export default function CostReport(){
  const [parts, setParts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulan, setBulan] = useState(()=> monthKey(new Date()));
  const [mesinFilter, setMesinFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(()=>{
    async function load(){
      setLoading(true);
      if(!isFirebaseConfigured()){
        const demoParts = [
          { part_id:"p1", nama_part:"Kontaktor LC1D09", kategori:"Elektrikal & Kontrol", stok_saat_ini:4, harga_satuan:250000, kompatibel_mesin:["ECK-01"] },
          { part_id:"p2", nama_part:"Relay MY4N", kategori:"Elektrikal & Kontrol", stok_saat_ini:1, harga_satuan:75000, kompatibel_mesin:["Filler-02"] },
        ];
        const demoHist = [
          { part_id:"p1", tipe:"keluar", jumlah:2, timestamp:new Date(), harga_satuan_snapshot:250000, total_biaya:500000, mesin_snapshot:["ECK-01"], location_id:"EL-A-B01" },
          { part_id:"p2", tipe:"keluar", jumlah:1, timestamp:new Date(), harga_satuan_snapshot:75000, total_biaya:75000, mesin_snapshot:["Filler-02"], location_id:"EL-A-B01" },
        ];
        setParts(demoParts); setHistory(demoHist); setLoading(false); return;
      }
      try{
        const [pSnap, hSnap] = await Promise.all([
          getDocs(collection(db,"parts")),
          getDocs(collection(db,"stock_history")),
        ]);
        setParts(pSnap.docs.map(d=>({ part_id:d.id, ...d.data() })));
        setHistory(hSnap.docs.map(d=>({ history_id:d.id, ...d.data() })));
      } catch(e){ console.error(e); setError("Gagal memuat data: " + e.message); }
      setLoading(false);
    }
    load();
  },[]);

  const partsById = useMemo(()=> Object.fromEntries(parts.map(p=>[p.part_id,p])), [parts]);

  // nilai stok saat ini
  const nilaiPerKategori = useMemo(()=>{
    const map={};
    for(const p of parts){
      const v = (p.harga_satuan!=null ? Number(p.stok_saat_ini)*Number(p.harga_satuan) : 0);
      if(!v) continue;
      map[p.kategori]=(map[p.kategori]||0)+v;
    }
    return map;
  },[parts]);
  const totalNilai = useMemo(()=> totalNilaiStok(parts), [parts]);

  // filter history per bulan
  const histBulan = useMemo(()=>{
    const [y,m] = bulan.split("-").map(Number);
    const from = new Date(y,m-1,1); const to = new Date(y,m,0,23,59,59,999);
    let arr = history.filter(h=>{
      if(h.tipe!=="keluar") return false;
      const t = h.timestamp?.toDate ? h.timestamp.toDate() : new Date(h.timestamp);
      return t >= from && t <= to;
    });
    if(mesinFilter){
      arr = arr.filter(h=>{
        const p = partsById[h.part_id];
        const mesinList = (h.mesin_snapshot && h.mesin_snapshot.length) ? h.mesin_snapshot : (p?.kompatibel_mesin||[]);
        return mesinList.includes(mesinFilter);
      });
    }
    return arr;
  },[history, bulan, mesinFilter, partsById]);

  const totalBiayaBulan = useMemo(()=>{
    let sum=0;
    for(const h of histBulan){
      const p = partsById[h.part_id];
      const snap = h.harga_satuan_snapshot != null ? Number(h.harga_satuan_snapshot) : (p?.harga_satuan != null ? Number(p.harga_satuan) : 0);
      const total = h.total_biaya != null ? Number(h.total_biaya) : Number(h.jumlah||0)*snap;
      sum+= total||0;
    }
    return sum;
  },[histBulan, partsById]);

  const perKategori = useMemo(()=> biayaPerKategori(histBulan, partsById), [histBulan, partsById]);
  const perMesin = useMemo(()=> biayaPerMesin(histBulan, partsById), [histBulan, partsById]);

  const allMesin = useMemo(()=>{
    const s=new Set();
    parts.forEach(p=> (p.kompatibel_mesin||[]).forEach(m=>s.add(m)));
    history.forEach(h=> (h.mesin_snapshot||[]).forEach(m=>s.add(m)));
    return [...s].sort();
  },[parts, history]);

  function exportCsv(){
    const rows = histBulan.map(h=>{
      const p = partsById[h.part_id];
      const harga = h.harga_satuan_snapshot ?? p?.harga_satuan ?? "";
      const total = h.total_biaya ?? (harga ? Number(h.jumlah)*Number(harga) : "");
      const t = h.timestamp?.toDate ? h.timestamp.toDate().toLocaleString("id-ID") : "";
      return { tanggal:t, part:p?.nama_part||h.part_id, part_number:p?.part_number||"", lokasi:h.location_id, mesin:(h.mesin_snapshot||p?.kompatibel_mesin||[]).join(";"), jumlah:h.jumlah, harga_satuan:harga, total_biaya:total, keperluan:h.keperluan||"" };
    });
    const csv=Papa.unparse(rows);
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`cost_${bulan}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div>
        <h1 className="label-lg text-text-main">Laporan Biaya</h1>
        <p className="caption text-text-secondary mt-0.5">
          Pantau nilai stok dan biaya konsumsi spare part per bulan.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <label className="flex items-center gap-1 text-sm text-text-main">
          Bulan
          <input type="month" value={bulan} onChange={e=>setBulan(e.target.value)}
            className="border border-border bg-surface rounded-lg px-2.5 py-2 text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
        </label>
        <select value={mesinFilter} onChange={e=>setMesinFilter(e.target.value)}
          className="border border-border bg-surface text-text-main rounded-lg px-2.5 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
          <option value="">Semua mesin</option>
          {allMesin.map(m=> <option key={m} value={m}>{m}</option>)}
        </select>
        <button onClick={exportCsv} className="btn-primary text-xs py-2 px-3">Export CSV</button>
        <Link to="/history" className="text-xs text-text-secondary hover:text-primary ml-auto self-center hidden sm:inline">← History</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
          <div className="caption text-text-secondary">Total Nilai Stok</div>
          {loading ? <SkeletonBlock className="h-6 w-32 mt-1" /> : <div className="text-lg font-bold text-text-main">{error || formatRupiah(totalNilai)}</div>}
          <div className="text-[11px] text-text-secondary mt-1">{parts.filter(p=>p.harga_satuan!=null).length}/{parts.length} part ada harga</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
          <div className="caption text-text-secondary">Biaya Konsumsi ({bulan})</div>
          {loading ? <SkeletonBlock className="h-6 w-32 mt-1" /> : <div className="text-lg font-bold text-danger">{error || formatRupiah(totalBiayaBulan)}</div>}
          <div className="text-[11px] text-text-secondary mt-1">{histBulan.length} transaksi keluar</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
          <div className="caption text-text-secondary">Rata per Transaksi</div>
          {loading ? <SkeletonBlock className="h-6 w-32 mt-1" /> : <div className="text-lg font-bold text-text-main">{histBulan.length ? formatRupiah(totalBiayaBulan/histBulan.length) : "—"}</div>}
          <div className="text-[11px] text-text-secondary mt-1">{mesinFilter ? `Filter: ${mesinFilter}` : "Semua mesin"}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
          <div className="label-sm text-text-main mb-2">Nilai Stok per Kategori</div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="p-2 text-left text-xs font-semibold text-text-secondary">Kategori</th>
              <th className="p-2 text-right text-xs font-semibold text-text-secondary">Nilai</th>
            </tr></thead>
            <tbody>
              {Object.entries(nilaiPerKategori).map(([k,v])=> <tr key={k} className="border-t border-border"><td className="p-2 text-text-main">{k}</td><td className="p-2 text-right font-mono text-text-main">{formatRupiah(v)}</td></tr>)}
              {Object.keys(nilaiPerKategori).length===0 && <tr><td colSpan={2} className="p-3 text-center text-sm text-text-secondary">Belum ada harga</td></tr>}
              <tr className="border-t-2 border-border bg-background font-bold"><td className="p-2 text-text-main">Total</td><td className="p-2 text-right text-text-main">{formatRupiah(totalNilai)}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
          <div className="label-sm text-text-main mb-2">Biaya per Kategori ({bulan})</div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="p-2 text-left text-xs font-semibold text-text-secondary">Kategori</th>
              <th className="p-2 text-right text-xs font-semibold text-text-secondary">Biaya</th>
            </tr></thead>
            <tbody>
              {Object.entries(perKategori).map(([k,v])=> <tr key={k} className="border-t border-border"><td className="p-2 text-text-main">{k}</td><td className="p-2 text-right font-mono text-text-main">{formatRupiah(v)}</td></tr>)}
              {Object.keys(perKategori).length===0 && <tr><td colSpan={2} className="p-3 text-center text-sm text-text-secondary">Tidak ada konsumsi</td></tr>}
              <tr className="border-t-2 border-border bg-background font-bold"><td className="p-2 text-text-main">Total</td><td className="p-2 text-right text-text-main">{formatRupiah(totalBiayaBulan)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
        <div className="label-sm text-text-main mb-2">Biaya per Mesin ({bulan}){mesinFilter && ` · ${mesinFilter}`}</div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="p-2 text-left text-xs font-semibold text-text-secondary">Mesin</th>
            <th className="p-2 text-right text-xs font-semibold text-text-secondary">Biaya</th>
            <th className="p-2 text-right text-xs font-semibold text-text-secondary">Porsi</th>
          </tr></thead>
          <tbody>
            {Object.entries(perMesin).sort((a,b)=>b[1]-a[1]).map(([m,v])=> <tr key={m} className="border-t border-border"><td className="p-2 text-text-main">{m}</td><td className="p-2 text-right font-mono text-text-main">{formatRupiah(v)}</td><td className="p-2 text-right text-xs text-text-secondary">{totalBiayaBulan ? `${(v/totalBiayaBulan*100).toFixed(1)}%` : "—"}</td></tr>)}
            {Object.keys(perMesin).length===0 && <tr><td colSpan={3} className="p-3 text-center text-sm text-text-secondary">Tidak ada data mesin</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
        <div className="label-sm text-text-main mb-2">Detail Transaksi ({bulan}) · {histBulan.length} item</div>
        <div className="overflow-auto max-h-[320px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface"><tr className="border-b border-border">
              <th className="p-2 text-left text-xs font-semibold text-text-secondary">Tanggal</th>
              <th className="p-2 text-left text-xs font-semibold text-text-secondary">Part</th>
              <th className="p-2 text-left text-xs font-semibold text-text-secondary">Mesin</th>
              <th className="p-2 text-center text-xs font-semibold text-text-secondary">Jml</th>
              <th className="p-2 text-right text-xs font-semibold text-text-secondary">Harga</th>
              <th className="p-2 text-right text-xs font-semibold text-text-secondary">Total</th>
            </tr></thead>
            <tbody>
              {histBulan.slice(0,50).map(h=>{
                const p=partsById[h.part_id];
                const harga = h.harga_satuan_snapshot ?? p?.harga_satuan ?? null;
                const total = h.total_biaya ?? (harga ? Number(h.jumlah)*Number(harga) : null);
                const t = h.timestamp?.toDate ? h.timestamp.toDate().toLocaleDateString("id-ID") : "";
                return <tr key={h.history_id||Math.random()} className="border-t border-border hover:bg-background/50">
                  <td className="p-2 text-xs whitespace-nowrap text-text-secondary">{t}</td>
                  <td className="p-2 text-text-main">{p?.nama_part||h.part_id.slice(0,6)}<div className="text-[11px] text-text-secondary">{p?.part_number}</div></td>
                  <td className="p-2 text-xs text-text-secondary">{(h.mesin_snapshot||p?.kompatibel_mesin||[]).join(", ")||"—"}</td>
                  <td className="p-2 text-center text-text-main">{h.jumlah}</td>
                  <td className="p-2 text-right text-xs text-text-secondary">{harga!=null?formatRupiah(harga):"—"}</td>
                  <td className="p-2 text-right text-xs font-mono text-text-main">{total!=null?formatRupiah(total):"—"}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
