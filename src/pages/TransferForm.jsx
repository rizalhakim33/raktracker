import { useSearchParams, useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../lib/firebase.js";
import { submitTransfer } from "../lib/transfer.js";
import { useToast } from "../components/Toast.jsx";
import { SkeletonBlock } from "../components/Skeleton.jsx";

export default function TransferForm() {
  const { partId } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [part, setPart] = useState(null);
  const [locations, setLocations] = useState([]);
  const [locTujuan, setLocTujuan] = useState("");
  const [jumlah, setJumlah] = useState(1);
  const [nama, setNama] = useState("");
  const [catatan, setCatatan] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (!isFirebaseConfigured()) {
      setPart({ nama_part: "Mock Part " + partId, location_id: "EL-A-B01", stok_saat_ini: 4, satuan: "pcs", part_number: "MOCK-001" });
      setLocations([
        { location_id: "EL-A-B01" }, { location_id: "MK-B-C01" }, { location_id: "PH-C-D01" },
      ]);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const snap = await getDoc(doc(db, "parts", partId));
        if (snap.exists()) setPart({ part_id: snap.id, ...snap.data() });
        const locSnap = await getDocs(collection(db, "locations"));
        setLocations(locSnap.docs.map(d => ({ location_id: d.id })));
      } catch (e) { setErr("Gagal memuat data: " + e.message); }
      setLoading(false);
    })();
  }, [partId]);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    const n = Number(jumlah);
    if (!n || n <= 0) { setErr("Jumlah harus > 0"); return; }
    if (!locTujuan) { setErr("Pilih lokasi tujuan"); return; }
    if (locTujuan === part?.location_id) { setErr("Lokasi tujuan sama dengan lokasi asal"); return; }
    if (part && n > Number(part.stok_saat_ini)) { setErr(`Stok tidak cukup. Sisa ${part.stok_saat_ini}`); return; }
    if (!confirm) { setConfirm(true); return; }
    setBusy(true);
    try {
      if (!isFirebaseConfigured()) {
        toast.success(`Mock transfer ${n} pcs dari ${part?.location_id} ke ${locTujuan}`);
        nav(`/location/${part?.location_id || "EL-A-B01"}`, { replace: true });
        return;
      }
      const res = await submitTransfer({
        partAsalId: partId,
        locationIdTujuan: locTujuan,
        jumlah: n,
        namaPengambil: nama,
        catatan,
      });
      toast.success(`Transfer sukses. Stok ${part?.location_id}: ${res.stokAsalBaru} · ${locTujuan}: ${res.stokTujuanBaru}`);
      nav(`/location/${part?.location_id || ""}`, { replace: true });
    } catch (e2) { setErr(e2.message); toast.error("Gagal: " + e2.message); }
    setBusy(false);
  }

  if (loading) return <div className="max-w-md mx-auto space-y-4"><SkeletonBlock className="h-16 w-full" /><SkeletonBlock className="h-64 w-full" /></div>;

  const lokasiLain = locations.filter(l => l.location_id !== part?.location_id);

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div>
        <Link to={part?.location_id ? `/location/${part.location_id}` : "/scan"} className="text-xs text-text-secondary hover:text-primary">← Kembali</Link>
        <h1 className="label-lg text-text-main mt-1">Transfer Stok</h1>
      </div>

      {part && (
        <div className="bg-primary-light border border-border rounded-xl p-4">
          <div className="text-sm font-semibold text-text-main">{part.nama_part}</div>
          <div className="text-xs text-text-secondary mt-0.5">Stok: <span className="font-bold text-text-main">{part.stok_saat_ini} {part.satuan}</span> · {part.location_id} · {part.part_number}</div>
        </div>
      )}

      {err && <div className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-xl p-3">{err}</div>}
      {confirm && (
        <div className="text-sm bg-warning/10 border border-warning/20 rounded-xl p-3">
          <div className="font-semibold">Konfirmasi Transfer</div>
          <div className="text-text-secondary mt-0.5">
            Pindahkan <span className="font-bold text-text-main">{jumlah} {part?.satuan || "pcs"}</span> dari <span className="font-semibold">{part?.location_id}</span> ke <span className="font-semibold">{locTujuan}</span>?
          </div>
          <button type="button" onClick={() => setConfirm(false)} className="text-xs text-text-secondary underline mt-1">Batal</button>
        </div>
      )}

      <form onSubmit={submit} className="bg-surface border border-border rounded-xl p-5 shadow-card space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-text-main">Lokasi Tujuan *</span>
          <select value={locTujuan} onChange={(e) => { setLocTujuan(e.target.value); setConfirm(false); }}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none" required>
            <option value="">— Pilih lokasi tujuan —</option>
            {lokasiLain.map(l => <option key={l.location_id} value={l.location_id}>{l.location_id}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text-main">Jumlah *</span>
          <input type="number" min={1} max={part?.stok_saat_ini || 9999} step="1" value={jumlah} onChange={(e) => { setJumlah(e.target.value); setConfirm(false); }}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary" required />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text-main">Nama Pengambil *</span>
          <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Budi - Shift 2"
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main placeholder:text-text-secondary outline-none focus:border-primary focus:ring-1 focus:ring-primary" required />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text-main">Catatan</span>
          <input value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Reorganisasi rak, dll"
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main placeholder:text-text-secondary outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
        </label>
        <button disabled={busy} className="w-full btn-primary py-3 text-[15px] disabled:opacity-50">
          {busy ? "Memproses..." : confirm ? "Konfirmasi Transfer" : "Transfer Stok"}
        </button>
      </form>

      {!isFirebaseConfigured() && <div className="text-xs text-warning bg-warning/10 border border-warning/20 rounded-xl p-2">Belum ada .env — transfer masih mock.</div>}
    </div>
  );
}
