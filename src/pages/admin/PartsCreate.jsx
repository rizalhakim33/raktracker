import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../../lib/firebase.js";
import { CATEGORIES, VED_OPTIONS } from "../../lib/constants.js";
import { useToast } from "../../components/Toast.jsx";

export default function PartsCreate() {
  const nav = useNavigate();
  const toast = useToast();
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({
    nama_part: "",
    location_id: "",
    kategori: CATEGORIES[0].label,
    brand: "",
    part_number: "",
    part_number_alternatif: "",
    kompatibel_mesin: "",
    satuan: "pcs",
    stok_saat_ini: 0,
    stok_minimum: 2,
    no_induk: "",
    kekritisan: "Desirable",
    harga_satuan: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(()=>{
    if(!isFirebaseConfigured()) { setLocations([{location_id:"EL-A-B01", kategori:"Elektrikal & Kontrol"}]); setForm(f=>({...f, location_id:"EL-A-B01"})); return; }
    (async()=>{
      const snap = await getDocs(collection(db,"locations"));
      const rows = snap.docs.map(d=>d.data());
      setLocations(rows);
      if(rows[0]) setForm(f=>({...f, location_id: rows[0].location_id, kategori: rows[0].kategori }));
    })();
  },[]);

  function upd(k,v){ setForm(s=>({...s,[k]:v})); }

  async function submit(e){
    e.preventDefault();
    setErr("");
    if(!form.nama_part.trim()){ setErr("Nama part wajib"); return; }
    if(!form.location_id){ setErr("Lokasi wajib pilih"); return; }
    if(!form.part_number.trim()){ setErr("Part number wajib"); return; }
    setBusy(true);
    try{
      const payload = {
        nama_part: form.nama_part.trim(),
        location_id: form.location_id.trim().toUpperCase(),
        kategori: form.kategori,
        brand: form.brand.trim(),
        part_number: form.part_number.trim(),
        part_number_alternatif: form.part_number_alternatif.split(",").map(s=>s.trim()).filter(Boolean),
        kompatibel_mesin: form.kompatibel_mesin.split(",").map(s=>s.trim()).filter(Boolean),
        satuan: form.satuan.trim() || "pcs",
        stok_saat_ini: Number(form.stok_saat_ini),
        stok_minimum: Number(form.stok_minimum),
        no_induk: form.no_induk.trim(),
        kekritisan: form.kekritisan || "Desirable",
        harga_satuan: form.harga_satuan === "" || form.harga_satuan == null ? null : Number(form.harga_satuan),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if(!isFirebaseConfigured()){
        toast.info("Mock simpan part (isi .env untuk Firestore)");
        nav("/admin/parts");
        return;
      }
      const ref = doc(collection(db,"parts"));
      await setDoc(ref, payload);
      toast.success("Part disimpan: " + ref.id);
      nav("/admin/parts");
    } catch(e2){ setErr(e2.message); }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="max-w-2xl mx-auto space-y-4">
      <div>
        <Link to="/admin/parts" className="text-xs text-text-secondary hover:text-primary">← Kembali</Link>
        <h1 className="label-lg text-text-main mt-1">Tambah Part Baru</h1>
        <p className="caption text-text-secondary mt-0.5">Tambahkan spare part baru ke dalam sistem.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5 shadow-card space-y-4">
        {err && <div className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg p-2">{err}</div>}

        <label className="block">
          <span className="text-sm font-medium text-text-main">Nama Part *</span>
          <input value={form.nama_part} onChange={e=>upd("nama_part",e.target.value)} required
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Kontaktor LC1D09" />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-text-main">Lokasi *</span>
            <select value={form.location_id} onChange={e=>{
              const loc = locations.find(l=>l.location_id===e.target.value);
              upd("location_id",e.target.value);
              if(loc) upd("kategori",loc.kategori);
            }}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none">
              {locations.map(l=> <option key={l.location_id} value={l.location_id}>{l.location_id}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-main">Kategori *</span>
            <select value={form.kategori} onChange={e=>upd("kategori",e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none">
              {CATEGORIES.map(c=> <option key={c.code} value={c.label}>{c.code} - {c.label}</option>)}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-text-main">Brand</span>
            <input value={form.brand} onChange={e=>upd("brand",e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Schneider" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-main">Satuan *</span>
            <input value={form.satuan} onChange={e=>upd("satuan",e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="pcs" />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-text-main">Part Number *</span>
          <input value={form.part_number} onChange={e=>upd("part_number",e.target.value)} required
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="LC1D09M7" />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-text-main">Part Number Alternatif</span>
          <input value={form.part_number_alternatif} onChange={e=>upd("part_number_alternatif",e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="pisah koma" />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-text-main">Kompatibel Mesin</span>
          <input value={form.kompatibel_mesin} onChange={e=>upd("kompatibel_mesin",e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="pisah koma" />
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-text-main">Stok Saat Ini *</span>
            <input type="number" step="1" value={form.stok_saat_ini} onChange={e=>upd("stok_saat_ini",e.target.value)} required
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-main">Stok Minimum *</span>
            <input type="number" step="1" value={form.stok_minimum} onChange={e=>upd("stok_minimum",e.target.value)} required
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text-main">No Induk</span>
            <input value={form.no_induk} onChange={e=>upd("no_induk",e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="001" />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-text-main">Kekritisan (VED) *</span>
          <select value={form.kekritisan} onChange={e=>upd("kekritisan",e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main focus:border-primary focus:ring-1 focus:ring-primary outline-none">
            {VED_OPTIONS.map(v=> <option key={v} value={v}>{v}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-text-main">Harga Satuan (Rp, opsional)</span>
          <input type="number" min="0" step="1000" value={form.harga_satuan} onChange={e=>upd("harga_satuan",e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="250000" />
          <span className="text-xs text-text-secondary mt-1">Kosongkan jika belum diketahui</span>
        </label>

        <button disabled={busy} className="w-full btn-primary py-3 disabled:opacity-50">{busy?"Menyimpan...":"Simpan Part"}</button>
      </div>
    </form>
  );
}
