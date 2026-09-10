// Mapping kategori fixed 5 -> kode 2 huruf untuk location_id 3 segmen EL-A-B01
export const CATEGORIES = [
  { label: "Elektrikal & Kontrol", code: "EL" },
  { label: "Mekanikal", code: "MK" },
  { label: "Pneumatik & Hidraulik", code: "PH" },
  { label: "Drive & Motor", code: "DR" },
  { label: "Consumable/Fast-moving", code: "CS" },
];

export const CATEGORY_CODES = Object.fromEntries(CATEGORIES.map((c) => [c.label, c.code]));
export const CODE_TO_CATEGORY = Object.fromEntries(CATEGORIES.map((c) => [c.code, c.label]));

export const LOCATION_REGEX = /^[A-Z]{2}-[A-Z]-[A-Z][0-9]{2,3}$/; // EL-A-B01
export const SECTION_REGEX = /^[A-Z]$/;
export const BIN_REGEX = /^[A-Z][0-9]{2,3}$/;

export const KEPERLUAN_OPTIONS = ["Breakdown", "Preventive", "Restock", "Pinjam", "Transfer", "Lainnya"];

export const APP_NAME = "RakTrack";
export const APP_SHORT_NAME = "RakTrack";
export const NAMA_PERUSAHAAN = "PT. Indonesia Manufacturing";

// Role system - only this email gets full admin access
export const ADMIN_EMAIL = "admin@pabrik.com";
export const isAdmin = (user) => user?.email === ADMIN_EMAIL;

// Estimasi restock — rata pakai 90 hari terakhir
export const RESTOCK_PERIODE_HARI = 90;
export const RESTOCK_MIN_TRANSAKSI = 3;
export const RESTOCK_MIN_HARI_DATA = 30;
export const RESTOCK_WARN_HARI = 14; // badge amber jika estimasi < 14 hari

// VED Kekritisan
export const VED_OPTIONS = ["Vital", "Essential", "Desirable"];
export const VED_WEIGHT = { Vital: 3, Essential: 2, Desirable: 1 };
export const VED_COLOR = { Vital: "red", Essential: "amber", Desirable: "zinc" };
