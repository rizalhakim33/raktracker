import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase.js";
import { RESTOCK_WARN_HARI } from "../lib/constants.js";
import { formatHari } from "../lib/restock.js";
import VedBadge from "../components/VedBadge.jsx";
import { formatRupiah, hitungNilaiStok } from "../lib/cost.js";
import { SkeletonBlock } from "../components/Skeleton.jsx";

function fmt(ts){
  if(!ts) return "-";
  try{ const d = ts.toDate ? ts.toDate() : new Date(ts); return d.toLocaleString("id-ID"); } catch{ return String(ts); }
}

export default function PartDetail() {
  const { partId } = useParams();
  const [part, setPart] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(()=>{
    async function load(){
      setLoading(true);
      if(!isFirebaseConfigured()){
        setPart({ nama_part:"Mock Part "+partId, location_id:"EL-A-B01", brand:"Mock", part_number:"MOCK-001", stok_saat_ini:4, stok_minimum:2, satuan:"pcs", kategori:"Elektrikal & Kontrol" });
        setHistory([
          { history_id:"h1", tipe:"keluar", jumlah:2, timestamp:new Date(), nama_pengambil:"Budi", keperluan:"Breakdown", stok_sesudah:2 },
          { history_id:"h2", tipe:"masuk", jumlah:5, timestamp:new Date(), nama_pengambil:"Admin", keperluan:"Restock", stok_sesudah:4 },
        ]);
        setLoading(false); return;
      }
      try{
        const snap = await getDoc(doc(db,"parts",partId));
        if(snap.exists()) setPart({ part_id:snap.id, ...snap.data() });
        const hSnap = await getDocs(query(collection(db,"stock_history"), where("part_id","==",partId), orderBy("timestamp","desc"), limit(5)));
        setHistory(hSnap.docs.map(d=>({ history_id:d.id, ...d.data() })));
      } catch(e){ console.error(e); setError("Gagal memuat data: " + e.message); }
      setLoading(false);
    }
    load();
  },[partId]);

  if(loading) return <div className="max-w-xl mx-auto space-y-4"><SkeletonBlock className="h-48 w-full" /><SkeletonBlock className="h-12 w-full" /><SkeletonBlock className="h-32 w-full" /></div>;
  if(error) return <div className="max-w-xl mx-auto bg-danger/5 border border-danger/20 rounded-xl p-4 text-sm text-danger">{error} <Link to="/scan" className="underline ml-2">Kembali ke Scan</Link></div>;
  if(!part) return <div className="max-w-xl mx-auto bg-surface border border-border rounded-xl p-4 text-sm text-text-secondary shadow-card">Part tidak ditemukan: {partId} <Link to="/scan" className="underline ml-2">Kembali ke Scan</Link></div>;

  const low = Number(part.stok_saat_ini) <= Number(part.stok_minimum);

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Link to={`/location/${part.location_id}`} className="hover:text-primary">{part.location_id}</Link>
          <span>·</span>
          <span>{partId}</span>
        </div>
        <h1 className="text-xl font-bold text-text-main mt-1 flex items-center gap-2 flex-wrap">
          {part.nama_part} <VedBadge value={part.kekritisan} />
        </h1>
        <div className="text-sm text-text-secondary mt-1">{part.brand} · {part.part_number} {part.part_number_alternatif?.length ? `· alt: ${part.part_number_alternatif.join(", ")}` : ""}</div>
        <div className="text-xs text-text-secondary mt-0.5">Kategori: {part.kategori} · Satuan: {part.satuan} {part.no_induk ? `· No Induk: ${part.no_induk}`: ""} · Kekritisan: <span className="font-semibold text-text-main">{part.kekritisan||"Desirable"}</span></div>
      </div>

      <div className={`rounded-xl p-4 ${low ? "bg-danger/5 border border-danger/20" : "bg-primary-light border border-border"}`}>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${low ? "text-danger" : "text-text-main"}`}>{part.stok_saat_ini}</span>
          <span className="text-sm text-text-secondary">{part.satuan}</span>
          {low && <span className="bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full">LOW</span>}
        </div>
        <div className="text-xs text-text-secondary mt-1">min {part.stok_minimum} {part.harga_satuan != null && <span>· {formatRupiah(part.harga_satuan)}/{part.satuan}</span>}</div>
        {part.harga_satuan != null && <div className="text-xs text-text-secondary mt-0.5">Nilai stok: <span className="font-semibold text-text-main">{formatRupiah(hitungNilaiStok(part))}</span></div>}
        {part.kompatibel_mesin?.length ? <div className="text-xs text-text-secondary mt-1">Kompatibel: {part.kompatibel_mesin.join(", ")}</div> : null}
      </div>

      {part.hitung_status === "ok" && part.estimasi_hari_tersisa != null ? (
        <div className={`rounded-xl p-3 text-xs ${Number(part.estimasi_hari_tersisa) < RESTOCK_WARN_HARI ? "bg-warning/10 border border-warning/20" : "bg-surface border border-border"}`}>
          <span className="font-medium">~ {formatHari(part.estimasi_hari_tersisa)} lagi habis</span>
          <span className="text-text-secondary"> · rata {Number(part.rata_pakai_per_hari).toFixed(2)} {part.satuan}/hari</span>
          {Number(part.estimasi_hari_tersisa) < RESTOCK_WARN_HARI && <span className="ml-2 bg-warning text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Segera restock</span>}
        </div>
      ) : (
        <div className="text-xs text-text-secondary border border-dashed border-border rounded-xl px-3 py-2 bg-background">
          {part.hitung_status === "data_tipis" ? "Data pemakaian masih tipis — estimasi belum reliable." :
           part.hitung_status === "tidak_ada_pakai" ? "Belum ada pemakaian 90 hari — stok aman." :
           "Estimasi akan muncul setelah ada transaksi keluar."}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Link to={`/part/${partId}/transaction?type=keluar`} className="btn-primary text-center py-3">Ambil Stok</Link>
        <Link to={`/part/${partId}/transaction?type=masuk`} className="btn-secondary text-center py-3">Tambah Stok</Link>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
        <div className="label-md text-text-main mb-3">5 History Terakhir</div>
        {history.length===0 ? (
          <div className="text-sm text-text-secondary py-4 text-center">Belum ada transaksi.</div>
        ) : (
          <div className="space-y-2">
            {history.map(h=>(
              <div key={h.history_id} className="flex justify-between items-center bg-background rounded-lg p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${h.tipe==="keluar"?"bg-danger/10 text-danger":"bg-success/10 text-success"}`}>{h.tipe}</span>
                    <span className="text-sm font-medium text-text-main">{h.jumlah} pcs</span>
                    {h.total_biaya != null && <span className="text-xs text-text-secondary">{formatRupiah(h.total_biaya)}</span>}
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">{h.nama_pengambil} · {h.keperluan} {h.catatan?`· ${h.catatan}`:""}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-text-main">→ {h.stok_sesudah}</div>
                  <div className="text-[11px] text-text-secondary">{fmt(h.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <Link to={`/history?part=${partId}`} className="block mt-3 text-xs text-text-secondary hover:text-primary text-center">Lihat semua history →</Link>
      </div>

      <Link to={`/location/${part.location_id}`} className="btn-secondary w-full text-center">← Kembali ke {part.location_id}</Link>
    </div>
  );
}
