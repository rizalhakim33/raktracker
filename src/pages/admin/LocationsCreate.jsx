import { useState } from "react";
import { doc, writeBatch, getDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../../lib/firebase.js";
import { CATEGORIES, CODE_TO_CATEGORY } from "../../lib/constants.js";
import { buildLocationId, validateLocationId, generateBulkIds } from "../../lib/generateLocationId.js";
import { exportQrPdf } from "../../lib/pdf.js";
import { exportLocationsCsv } from "../../lib/csv.js";
import { Link } from "react-router-dom";
import { useToast } from "../../components/Toast.jsx";

export default function LocationsCreate() {
  const toast = useToast();
  const [kategori, setKategori] = useState(CATEGORIES[0].label);
  const [sectionRak, setSectionRak] = useState("A");
  const [mode, setMode] = useState("bulk");
  const [kodeBinSingle, setKodeBinSingle] = useState("B01");
  const [kodeBinAwal, setKodeBinAwal] = useState("B01");
  const [jumlah, setJumlah] = useState(6);
  const [deskripsi, setDeskripsi] = useState("");
  const [preview, setPreview] = useState([]);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [qrFormat, setQrFormat] = useState("a4-2x2");

  const kodeKategori = CATEGORIES.find((c) => c.label === kategori)?.code || "EL";

  function doPreview() {
    try {
      const ids = mode === "single"
        ? [buildLocationId(kodeKategori, sectionRak, kodeBinSingle)]
        : generateBulkIds(kodeKategori, sectionRak, kodeBinAwal, Number(jumlah));
      const valid = ids.map((id) => ({ id, ok: validateLocationId(id) }));
      setPreview(valid);
      const bad = valid.filter((v) => !v.ok);
      if (bad.length) toast.warning(`Ada ${bad.length} ID tidak valid`);
    } catch (e) { toast.error(e.message); }
  }

  async function handleSave() {
    if (!preview.length) { toast.warning("Preview dulu"); return; }
    const bad = preview.filter((p) => !p.ok);
    if (bad.length) { toast.warning("Perbaiki format dulu"); return; }
    setSaving(true);
    const ids = preview.map((p) => p.id);
    const docs = ids.map((id) => ({
      location_id: id,
      kode_kategori: kodeKategori,
      kategori,
      section_rak: sectionRak.toUpperCase(),
      kode_bin: id.split("-")[2],
      bin_group_id: `${kodeKategori}-${sectionRak.toUpperCase()}`,
      deskripsi_lokasi: deskripsi,
      createdAt: new Date().toISOString(),
    }));
    try {
      if (isFirebaseConfigured()) {
        for (const id of ids) {
          const snap = await getDoc(doc(db, "locations", id));
          if (snap.exists()) throw new Error(`Duplikat: ${id} sudah ada di Firestore`);
        }
        const batch = writeBatch(db);
        docs.forEach((d) => batch.set(doc(db, "locations", d.location_id), { ...d, createdAt: new Date() }));
        await batch.commit();
      }
      setResult(docs);
    } catch (e) { toast.error("Gagal simpan: " + e.message); }
    setSaving(false);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <Link to="/admin/locations" className="text-xs text-text-secondary hover:text-primary">← Kembali</Link>
        <h1 className="label-lg text-text-main mt-1">Buat Lokasi Baru</h1>
        <p className="caption text-text-secondary mt-0.5">Buat lokasi baru untuk penyimpanan spare part.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 shadow-card space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-text-main">Kategori</span>
          <select value={kategori} onChange={(e) => setKategori(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none">
            {CATEGORIES.map((c) => <option key={c.code} value={c.label}>{c.code} - {c.label}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-text-main">Section Rak (1 huruf A-Z)</span>
          <input value={sectionRak} onChange={(e) => setSectionRak(e.target.value.toUpperCase().slice(0,1))} maxLength={1}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="A" />
        </label>

        <div className="flex gap-2">
          <button onClick={() => setMode("single")} className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${mode==="single"?"bg-primary text-white border-primary":"bg-background border-border text-text-secondary hover:bg-surface"}`}>Single</button>
          <button onClick={() => setMode("bulk")} className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${mode==="bulk"?"bg-primary text-white border-primary":"bg-background border-border text-text-secondary hover:bg-surface"}`}>Bulk</button>
        </div>

        {mode === "single" ? (
          <label className="block">
            <span className="text-sm font-medium text-text-main">Kode Bin (B01)</span>
            <input value={kodeBinSingle} onChange={(e) => setKodeBinSingle(e.target.value.toUpperCase())}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
          </label>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-text-main">Kode Bin Awal</span>
              <input value={kodeBinAwal} onChange={(e) => setKodeBinAwal(e.target.value.toUpperCase())}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="B01" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-text-main">Jumlah</span>
              <input type="number" min={1} max={50} value={jumlah} onChange={(e) => setJumlah(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </label>
          </div>
        )}

        <label className="block">
          <span className="text-sm font-medium text-text-main">Deskripsi (opsional)</span>
          <input value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Rak A Bin ..." />
        </label>

        <div className="flex gap-2">
          <button onClick={doPreview} className="flex-1 btn-secondary py-2.5">Preview ({mode==="single"?1:jumlah})</button>
          <button onClick={handleSave} disabled={saving || !preview.length} className="flex-1 btn-primary py-2.5 disabled:opacity-50">{saving?"Menyimpan...":"Generate & Simpan"}</button>
        </div>

        {preview.length > 0 && (
          <div className="border border-border rounded-xl p-3 max-h-48 overflow-auto bg-background">
            <div className="text-xs font-semibold text-text-main mb-2">Preview {preview.length} ID:</div>
            <div className="grid grid-cols-2 gap-1 text-xs font-mono">
              {preview.map((p) => <span key={p.id} className={p.ok ? "text-text-secondary" : "text-danger"}>{p.id} {p.ok?"✓":"✗"}</span>)}
            </div>
          </div>
        )}

        {result && (
          <div className="bg-success/10 border border-success/20 rounded-xl p-4">
            <div className="text-sm font-medium text-text-main">Berhasil {result.length} lokasi dibuat {isFirebaseConfigured() ? "di Firestore" : "(mock)"}</div>
            <div className="flex gap-2 mt-3 flex-wrap items-center">
              <select value={qrFormat} onChange={(e) => setQrFormat(e.target.value)}
                className="border border-border bg-background text-text-main rounded-lg px-2 py-1.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                <option value="a4-2x2">A4 2x2 (4 label/halaman)</option>
                <option value="label-100x150">Label 100x150mm</option>
              </select>
              <button onClick={() => exportQrPdf(result, qrFormat)} className="btn-secondary text-xs py-1.5 px-3">Download PDF</button>
              <button onClick={() => exportLocationsCsv(result)} className="btn-secondary text-xs py-1.5 px-3">Download CSV</button>
              <Link to="/admin/locations" className="btn-primary text-xs py-1.5 px-3">Ke List</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
