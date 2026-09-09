import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase.js";

function highlight(text, q){
  if(!q || !text) return text;
  const idx = String(text).toLowerCase().indexOf(q.toLowerCase());
  if(idx===-1) return text;
  return <>{String(text).slice(0,idx)}<mark className="bg-warning/20 text-text-main px-0.5 rounded">{String(text).slice(idx, idx+q.length)}</mark>{String(text).slice(idx+q.length)}</>;
}

export default function Search(){
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    async function load(){
      setLoading(true);
      if(!isFirebaseConfigured()){
        setAll([{ part_id:"demo1", nama_part:"Kontaktor LC1D09", location_id:"EL-A-B01", part_number:"LC1D09M7", brand:"Schneider", kompatibel_mesin:["Wrapping 1"], stok_saat_ini:4, satuan:"pcs" }]);
        setLoading(false);
        return;
      }
      try{
        const snap = await getDocs(collection(db,"parts"));
        setAll(snap.docs.map(d=>({ part_id:d.id, ...d.data() })));
      } catch(e){ console.error(e); }
      setLoading(false);
    }
    load();
  },[]);

  const debouncedQ = useMemo(()=>q, [q]);
  useEffect(()=>{
    const t = setTimeout(()=>{
      if(!debouncedQ.trim()){ setRows([]); return; }
      const s = debouncedQ.toLowerCase();
      setRows(all.filter(r=> `${r.nama_part} ${r.part_number} ${r.part_number_alternatif?.join(" ")} ${r.kompatibel_mesin?.join(" ")} ${r.brand} ${r.location_id}`.toLowerCase().includes(s)).slice(0,20));
    },200);
    return ()=>clearTimeout(t);
  },[debouncedQ,all]);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="label-lg text-text-main">Cari Part</h1>
        <p className="caption text-text-secondary mt-0.5">Cari berdasarkan nama, part number, lokasi, atau mesin.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
        <input value={q} onChange={e=>setQ(e.target.value)}
          placeholder={loading ? "Memuat data..." : "Ketik LC1D09 atau Wrapping 1..."}
          disabled={loading}
          className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-main placeholder:text-text-secondary disabled:opacity-50" />
      </div>

      <div className="space-y-2">
        {rows.map(r=>(
          <Link key={r.part_id} to={`/part/${r.part_id}`}
            className="block bg-surface border border-border rounded-xl p-4 hover:bg-background transition-colors shadow-card">
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-text-main">{highlight(r.nama_part,q)}</div>
                <div className="text-xs text-text-secondary mt-0.5">{highlight(r.brand,q)} · {highlight(r.part_number,q)} · {highlight(r.location_id,q)}</div>
                {r.kompatibel_mesin?.length? <div className="text-xs text-text-secondary mt-0.5">Mesin: {highlight(r.kompatibel_mesin.join(", "),q)}</div>:null}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-text-main">{r.stok_saat_ini ?? "—"}</div>
                <div className="text-[11px] text-text-secondary">{r.satuan ?? ""}</div>
              </div>
            </div>
          </Link>
        ))}
        {q && !loading && rows.length===0 && (
          <div className="bg-surface border border-border rounded-xl p-6 text-center text-sm text-text-secondary shadow-card">
            Tidak ketemu untuk "{q}"
          </div>
        )}
      </div>
    </div>
  );
}
