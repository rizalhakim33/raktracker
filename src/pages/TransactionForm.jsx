import { useSearchParams, useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase.js";
import { KEPERLUAN_OPTIONS } from "../lib/constants.js";
import { submitStockTransaction } from "../lib/stock.js";
import { updateEstimasiDiPart } from "../lib/restock.js";
import { useToast } from "../components/Toast.jsx";
import { SkeletonBlock } from "../components/Skeleton.jsx";

export default function TransactionForm() {
  const { partId } = useParams();
  const [sp] = useSearchParams();
  const type = sp.get("type") === "masuk" ? "masuk" : "keluar";
  const nav = useNavigate();
  const toast = useToast();
  const [part, setPart] = useState(null);
  const [jumlah, setJumlah] = useState(1);
  const [nama, setNama] = useState("");
  const [keperluan, setKeperluan] = useState(KEPERLUAN_OPTIONS[0]);
  const [catatan, setCatatan] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (!isFirebaseConfigured()) { setPart({ nama_part: "Mock Part " + partId, location_id: "EL-A-B01", stok_saat_ini: 4, satuan: "pcs" }); setLoading(false); return; }
    (async () => {
      try { const snap = await getDoc(doc(db, "parts", partId)); if (snap.exists()) setPart({ part_id: snap.id, ...snap.data() }); } catch (e) { setErr("Gagal memuat data part: " + e.message); }
      setLoading(false);
    })();
  }, [partId]);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    const n = Number(jumlah);
    if (!n || n <= 0) { setErr("Jumlah harus >0"); return; }
    if (type === "keluar" && part && n > Number(part.stok_saat_ini)) { setErr(`Stok tidak cukup. Sisa ${part.stok_saat_ini}`); return; }
    if (!confirm) { setConfirm(true); return; }
    setBusy(true);
    try {
      if (!isFirebaseConfigured()) {
        toast.success(`Mock ${type} ${n} pcs oleh ${nama} (${keperluan}) untuk ${partId}`);
        nav(`/location/${part?.location_id || "EL-A-B01"}`, { replace: true });
        return;
      }
      const res = await submitStockTransaction({
        partId, locationId: part?.location_id || "", tipe: type, jumlah: n, namaPengambil: nama, keperluan, catatan,
      });
      try { await updateEstimasiDiPart(partId, res.stokSesudah); } catch (eEst) { console.warn("Estimasi gagal:", eEst.message); }
      toast.success(`Sukses ${type} ${n} pcs. Stok ${res.stokSesudah}`);
      nav(`/location/${part?.location_id || ""}`, { replace: true });
    } catch (e2) { setErr(e2.message); toast.error("Gagal: " + e2.message); }
    setBusy(false);
  }

  if (loading) return <div className="max-w-md mx-auto space-y-4"><SkeletonBlock className="h-16 w-full" /><SkeletonBlock className="h-64 w-full" /></div>;

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div>
        <Link to={part?.location_id ? `/location/${part.location_id}` : "/scan"} className="text-xs text-text-secondary hover:text-primary">← Kembali</Link>
        <h1 className="label-lg text-text-main mt-1">{type === "keluar" ? "Ambil Stok" : "Tambah Stok"}</h1>
      </div>

      {part && (
        <div className="bg-primary-light border border-border rounded-xl p-4">
          <div className="text-sm font-semibold text-text-main">{part.nama_part}</div>
          <div className="text-xs text-text-secondary mt-0.5">Stok: <span className="font-bold text-text-main">{part.stok_saat_ini} {part.satuan}</span> · {part.location_id}</div>
        </div>
      )}

      {err && <div className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-xl p-3">{err}</div>}
      {confirm && (
        <div className="text-sm bg-warning/10 border border-warning/20 rounded-xl p-3">
          <div className="font-semibold">Konfirmasi {type === "keluar" ? "Pengambilan" : "Penambahan"}</div>
          <div className="text-text-secondary mt-0.5">{type === "keluar" ? "Ambil" : "Tambah"} <span className="font-bold text-text-main">{jumlah} {part?.satuan || "pcs"}</span> {type === "keluar" ? "dari stok" : "ke stok"}?</div>
          <button type="button" onClick={() => setConfirm(false)} className="text-xs text-text-secondary underline mt-1">Batal</button>
        </div>
      )}

      <form onSubmit={submit} className="bg-surface border border-border rounded-xl p-5 shadow-card space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-text-main">Jumlah *</span>
          <input type="number" min={1} step="1" value={jumlah} onChange={(e)=>{setJumlah(e.target.value); setConfirm(false);}}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary" required />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text-main">Nama Pengambil *</span>
          <input value={nama} onChange={(e)=>setNama(e.target.value)} placeholder="Budi - Shift 2"
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main placeholder:text-text-secondary outline-none focus:border-primary focus:ring-1 focus:ring-primary" required />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text-main">Keperluan *</span>
          <select value={keperluan} onChange={(e)=>setKeperluan(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none">
            {KEPERLUAN_OPTIONS.map(o=><option key={o}>{o}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text-main">Catatan</span>
          <input value={catatan} onChange={(e)=>setCatatan(e.target.value)} placeholder="Ganti kontaktor Line 1"
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main placeholder:text-text-secondary outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
        </label>
        <button disabled={busy} className="w-full btn-primary py-3 text-[15px] disabled:opacity-50">
          {busy ? "Memproses..." : confirm ? `Konfirmasi ${type === "keluar" ? "Ambil" : "Tambah"}` : type === "keluar" ? "Ambil Stok" : "Tambah Stok"}
        </button>
      </form>

      {!isFirebaseConfigured() && <div className="text-xs text-warning bg-warning/10 border border-warning/20 rounded-xl p-2">Belum ada .env — transaksi masih mock.</div>}
    </div>
  );
}
