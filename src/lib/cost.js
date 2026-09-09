

export function formatRupiah(n){
  if (n == null || !isFinite(Number(n))) return "—";
  try { return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n)); }
  catch { return `Rp ${Number(n).toLocaleString("id-ID")}`; }
}

export function hitungNilaiStok(part){
  const stok = Number(part?.stok_saat_ini ?? 0);
  const harga = Number(part?.harga_satuan ?? 0);
  if (!harga || stok===0) return 0;
  return stok * harga;
}

// total nilai stok untuk list parts
export function totalNilaiStok(parts){
  return parts.reduce((s,p)=> s + hitungNilaiStok(p), 0);
}

// hitung total biaya konsumsi dari history yang sudah ada snapshot
// fallback ke harga_satuan part saat ini jika snapshot null (untuk data lama)
export function hitungTotalBiaya(historyRows, partsById){
  let total = 0;
  for(const h of historyRows){
    if(h.tipe !== "keluar") continue;
    const snap = h.harga_satuan_snapshot != null ? Number(h.harga_satuan_snapshot) : null;
    let harga = snap;
    if(harga == null){
      const p = partsById?.[h.part_id];
      harga = p?.harga_satuan != null ? Number(p.harga_satuan) : 0;
    }
    if(!harga) continue;
    total += Number(h.jumlah||0) * harga;
  }
  return total;
}

// biaya per mesin: jika kompatibel_mesin ada banyak, biaya dibagi rata per mesin (hindari double count)
export function biayaPerMesin(historyRows, partsById){
  const map = {}; // mesin -> total
  for(const h of historyRows){
    if(h.tipe !== "keluar") continue;
    const p = partsById?.[h.part_id];
    const mesinList = (h.mesin_snapshot && h.mesin_snapshot.length) ? h.mesin_snapshot : (p?.kompatibel_mesin || []);
    if(!mesinList.length){
      map["(Tanpa Mesin)"] = (map["(Tanpa Mesin)"]||0) + (Number(h.total_biaya ?? (Number(h.jumlah||0)*(h.harga_satuan_snapshot ?? p?.harga_satuan ?? 0))) || 0);
      continue;
    }
    const snap = h.harga_satuan_snapshot != null ? Number(h.harga_satuan_snapshot) : (p?.harga_satuan != null ? Number(p.harga_satuan) : 0);
    const total = h.total_biaya != null ? Number(h.total_biaya) : Number(h.jumlah||0)*snap;
    if(!total) continue;
    const perMesin = total / mesinList.length;
    for(const m of mesinList){
      map[m] = (map[m]||0) + perMesin;
    }
  }
  return map;
}

export function biayaPerKategori(historyRows, partsById){
  const map = {};
  for(const h of historyRows){
    if(h.tipe !== "keluar") continue;
    const p = partsById?.[h.part_id];
    const kat = p?.kategori || "(Tanpa Kategori)";
    const snap = h.harga_satuan_snapshot != null ? Number(h.harga_satuan_snapshot) : (p?.harga_satuan != null ? Number(p.harga_satuan) : 0);
    const total = h.total_biaya != null ? Number(h.total_biaya) : Number(h.jumlah||0)*snap;
    if(!total) continue;
    map[kat] = (map[kat]||0) + total;
  }
  return map;
}
