import "dotenv/config";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, serverTimestamp, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function main(){
  console.log("Login admin@pabrik.com...");
  await signInWithEmailAndPassword(auth, "admin@pabrik.com", "Admin123!");
  console.log("Login OK, uid", auth.currentUser.uid);

  // pastikan locations EL-A-B01 ada (sudah ada dari screenshot)
  const demoParts = [
    { nama_part:"Kontaktor Schneider LC1D09", location_id:"EL-A-B01", kategori:"Elektrikal & Kontrol", brand:"Schneider", part_number:"LC1D09M7", part_number_alternatif:["LC1D09BD"], kompatibel_mesin:["Wrapping 1"], satuan:"pcs", stok_saat_ini:4, stok_minimum:2, no_induk:"001" },
    { nama_part:"Relay Omron MY4N", location_id:"EL-A-B01", kategori:"Elektrikal & Kontrol", brand:"Omron", part_number:"MY4N-GS", part_number_alternatif:[], kompatibel_mesin:["Filler 2"], satuan:"pcs", stok_saat_ini:1, stok_minimum:2, no_induk:"002" },
    { nama_part:"Fuse 10A", location_id:"EL-A-B01", kategori:"Elektrikal & Kontrol", brand:"Bussmann", part_number:"F10A", part_number_alternatif:["F10A-ALT"], kompatibel_mesin:["Panel MCC"], satuan:"pcs", stok_saat_ini:12, stok_minimum:5, no_induk:"003" },
  ];

  for(const p of demoParts){
    const ref = doc(collection(db,"parts"));
    await setDoc(ref, { ...p, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    console.log("Created part", ref.id, p.nama_part);

    // buat 1 history masuk awal untuk tiap part (biar collection stock_history muncul)
    const hRef = doc(collection(db,"stock_history"));
    await setDoc(hRef, {
      part_id: ref.id,
      location_id: p.location_id,
      tipe: "masuk",
      jumlah: p.stok_saat_ini,
      timestamp: serverTimestamp(),
      nama_pengambil: "Admin Seed",
      keperluan: "Restock",
      catatan: "Seed awal",
      stok_sesudah: p.stok_saat_ini,
      stok_sebelum: 0,
    });
    console.log(" -> history", hRef.id);
  }
  console.log("Seed selesai. Cek console: parts & stock_history akan muncul.");
  process.exit(0);
}
main().catch(e=>{ console.error(e); process.exit(1); });
