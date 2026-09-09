import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { validateLocationId } from "../lib/generateLocationId.js";

export default function Scan() {
  const nav = useNavigate();
  const [manual, setManual] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const qrRef = useRef(null);
  const scannerRef = useRef(null);

  function go(idRaw) {
    const id = String(idRaw || manual).trim().toUpperCase();
    if (!id) return;
    if (!validateLocationId(id)) {
      setError(`Format salah. Harus EL-A-B01. Dapat: ${id}`);
      return;
    }
    stop();
    nav(`/location/${id}`);
  }

  async function start() {
    setError("");
    if (!window.isSecureContext) {
      setError("Kamera butuh HTTPS atau localhost. Pakai input manual.");
    }
    try {
      setScanning(true);
      await new Promise((r) => setTimeout(r, 50));
      const qr = new Html5Qrcode("reader");
      scannerRef.current = qr;
      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          const id = String(decoded).trim().toUpperCase();
          if (validateLocationId(id)) {
            try { qr.stop(); } catch {}
            setScanning(false);
            nav(`/location/${id}`);
          } else {
            setError(`QR terbaca "${decoded}" tapi format bukan EL-A-B01`);
          }
        },
        () => {}
      );
    } catch (e) {
      setError(e?.message || String(e));
      setScanning(false);
    }
  }

  async function stop() {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      }
    } catch {}
    setScanning(false);
  }

  useEffect(() => () => { stop(); }, []);

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div>
        <h1 className="label-lg text-text-main flex items-center gap-2">
          <img src="/logo.svg" alt="" className="w-5 h-5" />
          Scan QR Rak
        </h1>
        <p className="caption text-text-secondary mt-0.5">Arahkan kamera ke QR code pada rak/bin. Pastikan pencahayaan cukup dan QR terlihat jelas.</p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-5 shadow-card space-y-4">
        {!scanning ? (
          <button onClick={start} className="w-full btn-primary py-3 text-[15px]">Buka Kamera</button>
        ) : (
          <button onClick={stop} className="w-full btn-secondary py-3 text-[15px]">Tutup Kamera</button>
        )}

        <div className="relative">
          <div id="reader" ref={qrRef} className={`rounded-xl overflow-hidden border ${scanning ? "border-primary" : "hidden"} bg-background min-h-[260px]`} />
          {scanning && (
            <>
              <span className="pointer-events-none absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-primary opacity-30 rounded-tl-lg" />
              <span className="pointer-events-none absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-primary opacity-30 rounded-tr-lg" />
              <span className="pointer-events-none absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-primary opacity-30 rounded-bl-lg" />
              <span className="pointer-events-none absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-primary opacity-30 rounded-br-lg" />
            </>
          )}
        </div>

        {error && <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg p-3">{error}</div>}
      </div>

      <div className="bg-surface rounded-xl border border-border p-5 shadow-card space-y-3">
        <div className="label-md text-text-main">Input Manual</div>
        <div className="flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value.toUpperCase())}
            placeholder="EL-A-B01"
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-main placeholder:text-text-secondary"
          />
          <button onClick={() => go()} className="btn-primary px-5">Buka</button>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>nav("/location/EL-A-B01")} className="flex-1 bg-primary-light border border-border text-text-main px-3 py-2 rounded-lg text-xs hover:bg-background">Contoh: EL-A-B01</button>
          <button onClick={()=>nav("/location/MK-B-C01")} className="flex-1 bg-surface border border-border text-text-secondary px-3 py-2 rounded-lg text-xs hover:bg-background">MK-B-C01</button>
        </div>
      </div>
    </div>
  );
}
