import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase.js";
import FilterBar from "../components/FilterBar.jsx";
import VedBadge from "../components/VedBadge.jsx";
import { formatHari } from "../lib/restock.js";
import { RESTOCK_WARN_HARI, CODE_TO_CATEGORY } from "../lib/constants.js";
import { formatRupiah, hitungNilaiStok } from "../lib/cost.js";
import { exportSingleQrPdf } from "../lib/pdf.js";

const MOCK_PARTS = [
  { part_id: "p1", nama_part: "Kontaktor Schneider LC1D09", location_id: "EL-A-B01", brand: "Schneider", part_number: "LC1D09M7", stok_saat_ini: 4, stok_minimum: 2, satuan: "pcs" },
  { part_id: "p2", nama_part: "Relay Omron MY4N", location_id: "EL-A-B01", brand: "Omron", part_number: "MY4N-GS", stok_saat_ini: 1, stok_minimum: 2, satuan: "pcs" },
  { part_id: "p3", nama_part: "Fuse 10A", location_id: "EL-A-B01", brand: "Bussmann", part_number: "F10A", stok_saat_ini: 12, stok_minimum: 5, satuan: "pcs" },
];

export default function LocationDetail() {
  const { locationId } = useParams();
  const [q, setQ] = useState("");
  const [filterLow, setFilterLow] = useState(false);
  const [parts, setParts] = useState([]);
  const [locDoc, setLocDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showQrMenu, setShowQrMenu] = useState(false);

  useEffect(()=>{
    let cancelled = false;
    async function load(){
      setLoading(true);
      setError("");
      if(!isFirebaseConfigured()){
        setParts(MOCK_PARTS.filter(p=>p.location_id===locationId).length ? MOCK_PARTS.filter(p=>p.location_id===locationId) : MOCK_PARTS);
        setLoading(false);
        return;
      }
      try{
        const [partsSnap, locSnap] = await Promise.all([
          getDocs(query(collection(db,"parts"), where("location_id","==",locationId))),
          getDoc(doc(db,"locations",locationId)),
        ]);
        const data = partsSnap.docs.map(d=>({ part_id:d.id, ...d.data() }));
        if(!cancelled) setParts(data);
        if(!cancelled && locSnap.exists()) setLocDoc(locSnap.data());
      } catch(e){ console.error(e); if(!cancelled) { setParts([]); setError("Gagal memuat data: " + e.message); } }
      if(!cancelled) setLoading(false);
    }
    load();
    return ()=>{ cancelled=true; };
  },[locationId]);

  const filtered = useMemo(() => {
    let arr = parts;
    if (q.trim()) {
      const s = q.toLowerCase();
      arr = arr.filter((p) => `${p.nama_part} ${p.part_number} ${p.brand}`.toLowerCase().includes(s));
    }
    if (filterLow) arr = arr.filter((p) => Number(p.stok_saat_ini) <= Number(p.stok_minimum));
    return arr;
  }, [parts, q, filterLow]);

  const categoryCode = locationId.split("-")[0];
  const section = locationId.split("-")[1];
  const kodeBin = locationId.split("-")[2];

  const locationObj = useMemo(() => {
    if (locDoc) return locDoc;
    return {
      location_id: locationId,
      kode_kategori: categoryCode,
      kategori: CODE_TO_CATEGORY[categoryCode] || categoryCode,
      section_rak: section,
      kode_bin: kodeBin,
      deskripsi_lokasi: "",
    };
  }, [locDoc, locationId, categoryCode, section, kodeBin]);

  function handlePrintQr(format) {
    exportSingleQrPdf(locationObj, format);
    setShowQrMenu(false);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <div className="caption text-text-secondary uppercase tracking-wider font-semibold">Lokasi</div>
        <div className="flex items-center gap-3 mt-1">
          <h1 className="text-2xl font-bold font-mono text-text-main">{locationId}</h1>
          <span className="text-xs bg-primary-light text-primary border border-primary/20 px-2.5 py-1 rounded-full font-medium">{categoryCode} · {section}</span>
        </div>
        <p className="caption text-text-secondary mt-1">
          {loading ? "Memuat parts..." : `${parts.length} part di lokasi ini`}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/scan" className="btn-secondary text-xs py-1.5 px-3">← Scan</Link>
        <Link to="/admin/parts/create" className="btn-primary text-xs py-1.5 px-3">+ Tambah Part</Link>
        <div className="relative">
          <button onClick={() => setShowQrMenu(!showQrMenu)} className="btn-secondary text-xs py-1.5 px-3">Cetak QR Label ▾</button>
          {showQrMenu && (
            <div className="absolute top-full left-0 mt-1 bg-surface border border-border rounded-lg shadow-soft z-10 min-w-[180px]">
              <button onClick={() => handlePrintQr("label-100x150")} className="block w-full text-left px-3 py-2 text-xs text-text-main hover:bg-background rounded-t-lg">Label 100x150mm</button>
              <button onClick={() => handlePrintQr("a4-2x2")} className="block w-full text-left px-3 py-2 text-xs text-text-main hover:bg-background rounded-b-lg">A4 2x2 grid</button>
            </div>
          )}
        </div>
      </div>

      {error && <div className="bg-danger/5 border border-danger/20 rounded-xl p-3 text-sm text-danger">{error}</div>}

      <FilterBar q={q} setQ={setQ} filterLow={filterLow} setFilterLow={setFilterLow} />

      <div className="space-y-2">
        {!loading && filtered.length === 0 && (
          <div className="bg-surface border border-border rounded-xl p-6 text-center text-sm text-text-secondary shadow-card">
            Tidak ada part di {locationId}.
          </div>
        )}
        {filtered.map((p) => {
          const low = Number(p.stok_saat_ini) <= Number(p.stok_minimum);
          const estOk = p.hitung_status === "ok" && p.estimasi_hari_tersisa != null;
          const estHari = estOk ? Number(p.estimasi_hari_tersisa) : null;
          const estSoon = estHari != null && estHari < RESTOCK_WARN_HARI;
          return (
            <Link key={p.part_id} to={`/part/${p.part_id}`}
              className={`block bg-surface border rounded-xl p-4 hover:bg-background transition-colors shadow-card ${
                low ? "border-danger/30" : estSoon ? "border-warning/30" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-text-main flex items-center gap-2 flex-wrap">
                    {p.nama_part}
                    <VedBadge value={p.kekritisan} />
                    {low && <span className="bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full">LOW</span>}
                    {estOk && (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${estSoon ? "bg-warning text-white" : "bg-primary-light text-text-secondary border border-border"}`}>
                        ~{formatHari(estHari)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    {p.brand} · {p.part_number}
                    {estOk && <span> · {Number(p.rata_pakai_per_hari).toFixed(2)}/{p.satuan}/hari</span>}
                    {p.harga_satuan != null && <span> · {formatRupiah(hitungNilaiStok(p))}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-base font-bold ${low ? "text-danger" : estSoon ? "text-warning" : "text-text-main"}`}>
                    {p.stok_saat_ini} <span className="text-xs font-normal text-text-secondary">{p.satuan}</span>
                  </div>
                  <div className="text-[11px] text-text-secondary">min {p.stok_minimum}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
