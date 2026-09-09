import Papa from "papaparse";

export function exportLocationsCsv(locations) {
  const rows = locations.map((l) => ({
    location_id: l.location_id,
    kode_kategori: l.kode_kategori,
    kategori: l.kategori,
    section_rak: l.section_rak,
    kode_bin: l.kode_bin,
    bin_group_id: l.bin_group_id,
    deskripsi_lokasi: l.deskripsi_lokasi || "",
  }));
  const csv = Papa.unparse(rows, { header: true });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `locations_export_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (res) => resolve(res.data),
      error: reject,
    });
  });
}

export const CSV_TEMPLATE = `kode_kategori,section_rak,kode_bin,deskripsi_lokasi
EL,A,B01,Rak A Bin 1 - atas
EL,A,B02,Rak A Bin 2
MK,B,C01,Section B Bin 1 mekanikal
`;

export function downloadCsvTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "template_import_locations.csv";
  a.click();
  URL.revokeObjectURL(url);
}
