import "dotenv/config";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};
const PERIODE = 90, MIN_TX=3, MIN_HARI=30;

async function hitung(db, partId, stok){
  const since = new Date(); since.setDate(since.getDate()-PERIODE);
  const snap = await getDocs(query(collection(db,"stock_history"), where("part_id","==",partId), where("tipe","==","keluar")));
  const rows = snap.docs.map(d=>d.data()).filter(d=>{
    const t = d.timestamp?.toDate ? d.timestamp.toDate() : new Date(d.timestamp);
    return t >= since;
  });
  const total = rows.reduce((s,r)=>s+Number(r.jumlah||0),0);
  const count = rows.length;
  let minDate=null,maxDate=null;
  rows.forEach(r=>{ const t=r.timestamp?.toDate? r.timestamp.toDate(): new Date(r.timestamp); if(!minDate||t<minDate) minDate=t; if(!maxDate||t>maxDate) maxDate=t; });
  const rentang = (minDate&&maxDate)? Math.max(1, Math.ceil((maxDate-minDate)/(1000*60*60*24))+1):0;
  let status="ok", rata=0, hari=null, tanggal=null;
  if(total===0) status="tidak_ada_pakai";
  else if(count < MIN_TX || rentang < MIN_HARI) status="data_tipis";
  else {
    rata = total/PERIODE;
    if(rata>0){ hari = Number(stok)/rata; const d=new Date(); d.setDate(d.getDate()+Math.floor(hari)); tanggal=d; }
    else status="tidak_ada_pakai";
  }
  return { status, rata, hari, tanggal, total, count, rentang };
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

await signInWithEmailAndPassword(auth, "admin@pabrik.com", "Admin123!");
console.log("Login OK", auth.currentUser.uid);
const snap = await getDocs(collection(db,"parts"));
console.log(`Parts: ${snap.size}`);
for(const d of snap.docs){
  const p=d.data(); const stok=Number(p.stok_saat_ini??0);
  const est=await hitung(db,d.id,stok);
  await updateDoc(doc(db,"parts",d.id), {
    rata_pakai_per_hari: est.rata,
    estimasi_hari_tersisa: est.hari,
    estimasi_tanggal_habis: est.tanggal,
    last_estimasi_at: serverTimestamp(),
    total_keluar_90h: est.total,
    hitung_status: est.status,
    hitung_count_90h: est.count,
  });
  console.log(`${d.id.slice(0,6)} ${p.nama_part} stok ${stok} -> ${est.status} rata ${est.rata.toFixed(2)} hari ${est.hari?.toFixed(1) ?? "-"}`);
}
console.log("Backfill selesai");
process.exit(0);
