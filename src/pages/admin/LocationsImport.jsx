import { useState } from "react";
import { Link } from "react-router-dom";
import { doc, writeBatch, getDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../../lib/firebase.js";
import { parseCsvFile, downloadCsvTemplate } from "../../lib/csv.js";
import { buildLocationId, validateLocationId } from "../../lib/generateLocationId.js";
import { CODE_TO_CATEGORY } from "../../lib/constants.js";
import { useToast } from "../../components/Toast.jsx";

export default function LocationsImport() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [preview, setPreview] = useState([]);
  const [saving, setSaving] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await parseCsvFile(file);
    setRows(data);
    const mapped = data.map((r, idx) => {
      const kode_kategori = String(r.kode_kategori || "").trim().toUpperCase();
      const section_rak = String(r.section_rak || "").trim().toUpperCase();
      const kode_bin = String(r.kode_bin || "").trim().toUpperCase();
      const deskripsi_lokasi = String(r.deskripsi_lokasi || "").trim();
      let location_id = String(r.location_id || "").trim().toUpperCase();
      if (!location_id && kode_kategori && section_rak && kode_bin) location_id = buildLocationId(kode_kategori, section_rak, kode_bin);
      const kategori = CODE_TO_CATEGORY[kode_kategori] || "";
      const ok = validateLocationId(location_id) && !!kategori && !!section_rak && !!kode_bin;
      const err = !ok ? (!kategori ? "kode_kategori invalid" : !validateLocationId(location_id) ? "location_id format salah" : "field kosong") : "";
      return { idx: idx + 2, location_id, kode_kategori, kategori, section_rak, kode_bin, bin_group_id: `${kode_kategori}-${section_rak}`, deskripsi_lokasi, ok, err, raw: r };
    });
    setPreview(mapped);
  }

  async function handleImport() {
    const valid = preview.filter((p) => p.ok);
    if (!valid.length) { toast.warning("Tidak ada baris valid"); return; }
    if (!confirm(`Import ${valid.length} valid dari ${preview.length} baris?`)) return;
    setSaving(true);
    try {
      if (isFirebaseConfigured()) {
        for (const p of valid) {
          const snap = await getDoc(doc(db, "locations", p.location_id));
          if (snap.exists()) throw new Error(`Duplikat di Firestore: ${p.location_id}`);
        }
        const batch = writeBatch(db);
        valid.forEach((p) => batch.set(doc(db, "locations", p.location_id), { location_id: p.location_id, kode_kategori: p.kode_kategori, kategori: p.kategori, section_rak: p.section_rak, kode_bin: p.kode_bin, bin_group_id: p.bin_group_id, deskripsi_lokasi: p.deskripsi_lokasi, createdAt: new Date() }));
        await batch.commit();
        toast.success(`Berhasil import ${valid.length} lokasi`);
      } else {
        toast.info(`Mock import ${valid.length} lokasi (isi .env untuk simpan ke Firestore)`);
      }
    } catch (e) { toast.error(e.message); }
    setSaving(false);
  }

  const validCount = preview.filter((p) => p.ok).length;
  const errCount = preview.length - validCount;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <Link to="/admin/locations" className="text-xs text-text-secondary hover:text-primary">← Kembali</Link>
        <h1 className="label-lg text-text-main mt-1">Import CSV Lokasi</h1>
        <p className="caption text-text-secondary mt-0.5">Import lokasi rak dan bin dalam format CSV.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 shadow-card space-y-4">
        <div className="flex gap-2 flex-wrap items-center">
          <button onClick={downloadCsvTemplate} className="btn-secondary text-xs py-2 px-3">Download Template</button>
          <input type="file" accept=".csv" onChange={handleFile}
            className="block flex-1 text-sm text-text-main file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:text-white file:px-3 file:py-1.5 file:text-sm file:font-medium" />
        </div>

        {preview.length > 0 && (
          <>
            <div className="text-sm text-text-secondary">
              Valid <span className="font-semibold text-success">{validCount}</span>, Error <span className="font-semibold text-danger">{errCount}</span> dari {preview.length} baris
            </div>
            <div className="border border-border rounded-xl overflow-auto max-h-[320px]">
              <table className="w-full text-sm">
                <thead className="bg-background border-b border-border">
                  <tr>
                    <th className="p-2 text-left text-xs font-semibold text-text-secondary">Baris</th>
                    <th className="p-2 text-left text-xs font-semibold text-text-secondary">location_id</th>
                    <th className="p-2 text-center text-xs font-semibold text-text-secondary">Sec</th>
                    <th className="p-2 text-center text-xs font-semibold text-text-secondary">Bin</th>
                    <th className="p-2 text-center text-xs font-semibold text-text-secondary">OK</th>
                    <th className="p-2 text-left text-xs font-semibold text-text-secondary">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 50).map((p) => (
                    <tr key={p.idx} className={`border-t border-border hover:bg-background/50 ${p.ok ? "" : "bg-danger/5"}`}>
                      <td className="p-2 text-text-main">{p.idx}</td>
                      <td className="p-2 font-mono text-xs text-text-main">{p.location_id}</td>
                      <td className="p-2 text-center text-text-main">{p.section_rak}</td>
                      <td className="p-2 text-center text-text-main">{p.kode_bin}</td>
                      <td className="p-2 text-center text-xs">{p.ok ? "✓" : "✗"}</td>
                      <td className="p-2 text-xs text-danger">{p.err}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={handleImport} disabled={saving || !validCount}
              className="w-full btn-primary py-3 disabled:opacity-50">{saving ? "Mengimpor..." : `Import ${validCount} Valid`}</button>
          </>
        )}
      </div>
    </div>
  );
}
