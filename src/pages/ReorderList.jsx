import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Papa from "papaparse";
import { fetchReorderCandidates, formatReorderText, formatReorderCsv, hitungQtyPesan } from "../lib/reorder.js";
import VedBadge from "../components/VedBadge.jsx";
import { SkeletonTable } from "../components/Skeleton.jsx";

export default function ReorderList(){
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function load(){
    setLoading(true);
    setError("");
    try {
      const data = await fetchReorderCandidates();
      setRows(data);
    } catch(e) { console.error(e); setError("Gagal memuat data reorder: " + e.message); }
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  function copyText(){
    const txt = formatReorderText(rows);
    navigator.clipboard.writeText(txt).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  }
  function exportCsv(){
    const csv = Papa.unparse(formatReorderCsv(rows));
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`reorder_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }
  function copyWhatsApp(){
    // format ringkas untuk WA
    const txt = rows.map((p,i)=> `${i+1}. ${p.nama_part} (${p.part_number}) @${p.location_id} [${p.kekritisan}] — pesan ${hitungQtyPesan(p)} ${p.satuan||"pcs"}`).join("\n");
    navigator.clipboard.writeText(`Reorder List ${new Date().toLocaleDateString("id-ID")} (${rows.length} item)\n` + txt).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div>
        <h1 className="label-lg text-text-main">Reorder List</h1>
        <p className="caption text-text-secondary mt-0.5">
          Daftar part yang stoknya di bawah minimum dan perlu segera dipesan.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={copyText} className="btn-primary text-xs py-1.5 px-3">{copied?"Copied!":"Copy Teks"}</button>
        <button onClick={copyWhatsApp} className="btn-secondary text-xs py-1.5 px-3">Copy WhatsApp</button>
        <button onClick={exportCsv} className="btn-secondary text-xs py-1.5 px-3">Export CSV</button>
        <button onClick={load} className="btn-secondary text-xs py-1.5 px-3">Refresh</button>
        <Link to="/dashboard" className="text-xs text-text-secondary hover:text-primary ml-auto self-center">← Dashboard</Link>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
        {loading ? <div className="p-4"><SkeletonTable rows={5} cols={8} /></div> : (
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="p-3 text-center caption font-semibold text-text-secondary">#</th>
              <th className="p-3 text-left caption font-semibold text-text-secondary">Part</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">VED</th>
              <th className="p-3 text-left caption font-semibold text-text-secondary">Lokasi</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">Stok</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">Est.</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">Qty Pesan</th>
              <th className="p-3 text-center caption font-semibold text-text-secondary">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p,i)=>{
              const qty = hitungQtyPesan(p);
              const est = p.hitung_status==="ok" && p.estimasi_hari_tersisa!=null ? `${Math.round(Number(p.estimasi_hari_tersisa))}h` : "—";
              const vital = p.kekritisan==="Vital";
              return (
                <tr key={p.part_id} className={`border-t border-border hover:bg-background/50 ${vital ? "bg-danger/5" : p.kekritisan==="Essential" ? "bg-warning/5" : ""}`}>
                  <td className="p-3 text-center text-xs text-text-secondary">{i+1}</td>
                  <td className="p-3">
                    <Link to={`/part/${p.part_id}`} className="font-medium text-text-main hover:text-primary">{p.nama_part}</Link>
                    <div className="text-[11px] text-text-secondary">{p.part_number} · {p.brand}</div>
                  </td>
                  <td className="p-3 text-center"><VedBadge value={p.kekritisan} /></td>
                  <td className="p-3 font-mono text-xs"><Link to={`/location/${p.location_id}`} className="text-text-secondary hover:text-primary">{p.location_id}</Link></td>
                  <td className="p-3 text-center"><span className="font-bold text-danger">{p.stok_saat_ini}</span> <span className="text-xs text-text-secondary">/{p.stok_minimum} {p.satuan}</span></td>
                  <td className="p-3 text-center text-xs font-mono text-text-secondary">{est}</td>
                  <td className="p-3 text-center font-bold text-text-main">{qty} {p.satuan}</td>
                  <td className="p-3 text-center"><Link to={`/part/${p.part_id}/transaction?type=masuk`} className="text-xs border border-border rounded-lg px-2.5 py-1 text-text-main hover:bg-background">Restock</Link></td>
                </tr>
              );
            })}
            {!loading && rows.length===0 && <tr><td colSpan={8} className="p-6 text-center text-sm text-text-secondary">Semua stok aman</td></tr>}
          </tbody>
        </table>
        </div>
        )}
      </div>
    </div>
  );
}
