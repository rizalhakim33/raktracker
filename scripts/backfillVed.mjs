import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

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

await signInWithEmailAndPassword(auth, "admin@pabrik.com", "Admin123!");
console.log("Login OK", auth.currentUser.uid);

// set default Desirable jika belum ada, lalu set 1 Vital sebagai contoh (Relay yang low)
const snap = await getDocs(collection(db,"parts"));
console.log(`Parts: ${snap.size}`);
for(const d of snap.docs){
  const p=d.data();
  if(!p.kekritisan){
    // Relay Omron yang stok 1 jadi Vital, sisanya Desirable (contoh)
    const ved = p.nama_part?.includes("Relay") ? "Vital" : (p.nama_part?.includes("Kontaktor") ? "Essential" : "Desirable");
    await updateDoc(doc(db,"parts",d.id), { kekritisan: ved });
    console.log(`${d.id.slice(0,6)} ${p.nama_part} -> ${ved}`);
  } else {
    console.log(`${d.id.slice(0,6)} ${p.nama_part} sudah ${p.kekritisan}`);
  }
}
console.log("Backfill VED selesai");
process.exit(0);
