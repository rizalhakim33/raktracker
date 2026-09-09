import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase.js";
import { VED_WEIGHT } from "./constants.js";

export function hitungQtyPesan(part){
  const stok = Number(part.stok_saat_ini ?? 0);
  const min = Number(part.stok_minimum ?? 0);
  if (min <= 0) return Math.max(1, 1 - stok);
  // default: stok_minimum*2 - stok (buffer 2x), minimal 1
  const qty = Math.ceil(min * 2 - stok);
  return Math.max(1, qty);
}

export function sortReorder(a,b){
  const wa = VED_WEIGHT[a.kekritisan] || VED_WEIGHT.Desirable;
  const wb = VED_WEIGHT[b.kekritisan] || VED_WEIGHT.Desirable;
  if (wa !== wb) return wb - wa; // Vital dulu
  const ea = a.hitung_status === "ok" && a.estimasi_hari_tersisa != null ? Number(a.estimasi_hari_tersisa) : Infinity;
  const eb = b.hitung_status === "ok" && b.estimasi_hari_tersisa != null ? Number(b.estimasi_hari_tersisa) : Infinity;
  if (ea !== eb) return ea - eb; // tercepat habis dulu
  return Number(a.stok_saat_ini) - Number(b.stok_saat_ini); // stok paling tipis dulu
}

export async function fetchReorderCandidates(){
  if (!isFirebaseConfigured()) return [
    { part_id:"demo2", nama_part:"Relay Omron MY4N", location_id:"EL-A-B01", part_number:"MY4N-GS", stok_saat_ini:1, stok_minimum:2, kekritisan:"Vital", hitung_status:"ok", estimasi_hari_tersisa:3, rata_pakai_per_hari:0.33 },
  ].filter(r=> Number(r.stok_saat_ini) < Number(r.stok_minimum)).sort(sortReorder);

  const snap = await getDocs(query(collection(db,"parts"), orderBy("nama_part")));
  const all = snap.docs.map(d=>({ part_id:d.id, ...d.data() }));
  const low = all.filter(r=> Number(r.stok_saat_ini) < Number(r.stok_minimum));
  return low.sort(sortReorder);
}

export function formatReorderText(list){
  const lines = [`Daftar Reorder — ${new Date().toLocaleDateString("id-ID")} (${list.length} item)`,""];
  list.forEach((p,i)=>{
    const qty = hitungQtyPesan(p);
    const est = p.hitung_status==="ok" && p.estimasi_hari_tersisa!=null ? `~${Math.round(Number(p.estimasi_hari_tersisa))} hari` : "estimasi -";
    lines.push(`${i+1}. ${p.nama_part} (${p.part_number}) @ ${p.location_id} [${p.kekritisan||"Desirable"}] — stok ${p.stok_saat_ini}/${p.stok_minimum} ${p.satuan||"pcs"}, ${est} — PESAN ${qty} ${p.satuan||"pcs"}`);
  });
  return lines.join("\n");
}

export function formatReorderCsv(list){
  return list.map(p=>({
    nama_part: p.nama_part,
    part_number: p.part_number,
    location_id: p.location_id,
    kekritisan: p.kekritisan,
    stok_saat_ini: p.stok_saat_ini,
    stok_minimum: p.stok_minimum,
    satuan: p.satuan,
    estimasi_hari_tersisa: p.estimasi_hari_tersisa ?? "",
    rata_pakai_per_hari: p.rata_pakai_per_hari ?? "",
    qty_pesan: hitungQtyPesan(p),
  }));
}
