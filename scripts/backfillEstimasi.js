import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { updateEstimasiDiPart } from "../src/lib/restock.js";

const firebaseConfig = {
  apiKey: "AIzaSyCXMble3QQIuYbhqx45857cIYy5Q-4m_lY",
  authDomain: "part-tracker-ed51e.firebaseapp.com",
  projectId: "part-tracker-ed51e",
  storageBucket: "part-tracker-ed51e.firebasestorage.app",
  messagingSenderId: "965049994135",
  appId: "1:965049994135:web:f6b108f62811e4d5b0d2d2",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function main(){
  await signInWithEmailAndPassword(auth, "admin@pabrik.com", "Admin123!");
  console.log("Login OK", auth.currentUser.uid);
  const snap = await getDocs(collection(db, "parts"));
  console.log(`Parts: ${snap.size}`);
  for(const d of snap.docs){
    const p = d.data();
    const stok = Number(p.stok_saat_ini ?? 0);
    // dynamic import sudah, tapi kita import di atas
    const est = await updateEstimasiDiPart(d.id, stok);
    console.log(`${d.id} ${p.nama_part} stok ${stok} -> status ${est?.status} rata ${est?.rata?.toFixed(2)} hari ${est?.hari?.toFixed(1)}`);
  }
  console.log("Backfill selesai");
  process.exit(0);
}
main().catch(e=>{ console.error(e); process.exit(1); });
