import { useState } from "react";
import { Link } from "react-router-dom";

function IcoCheck({className}){ return <svg viewBox="0 0 24 24" fill="none" className={className}><circle cx="12" cy="12" r="10" fill="#16A34A" opacity="0.15"/><path d="M8 12.5l2.5 2.5 5-5" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function IcoX({className}){ return <svg viewBox="0 0 24 24" fill="none" className={className}><circle cx="12" cy="12" r="10" fill="#DC2626" opacity="0.15"/><path d="M9 9l6 6m0-6l-6 6" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/></svg>; }
function IcoArrow({className}){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14m-7-7l7 7-7 7"/></svg>; }
function IcoQr(props){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="3" height="3"/><path d="M14 17h3v3"/><path d="M17 14h3v3"/></svg>; }
function IcoZap(props){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" {...props}><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>; }
function IcoClock(props){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>; }
function IcoCloud(props){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}><path d="M7 18a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.2-1.2A4.5 4.5 0 0 1 19 18H7z"/></svg>; }
function IcoScan(props){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" {...props}><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>; }
function IcoClockFast(props){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function IcoRefresh(props){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>; }
function IcoDollar(props){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; }
function IcoHistory(props){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }

const FEATURES = [
  { icon: IcoScan, title: "Scan Cepat", desc: "QR code, tidak perlu cari manual." },
  { icon: IcoClock, title: "Real-time", desc: "Stok selalu terupdate." },
  { icon: IcoRefresh, title: "Pembelian", desc: "Kelola kebutuhan spare part." },
  { icon: IcoZap, title: "Restock Otomatis", desc: "Notifikasi stok menipis." },
  { icon: IcoDollar, title: "Cost Control", desc: "Pantau biaya per part." },
  { icon: IcoHistory, title: "Histori Lengkap", desc: "Semua aktivitas tercatat." },
];

export default function Landing(){
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* NAV */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" className="w-7 h-7" alt=""/>
            <span className="font-bold text-[16px] tracking-tight">RakTrack</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <a href="#fitur" className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5">Fitur</a>
            <a href="#cara-kerja" className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5">Cara Kerja</a>
            <a href="#harga" className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5">Harga</a>
            <Link to="/login" className="text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-1.5">Masuk</Link>
            <Link to="/scan" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold ml-2 transition-colors">Coba Pilot →</Link>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
              {mobileOpen ? (<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>) : (<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>)}
            </svg>
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            <a href="#fitur" onClick={() => setMobileOpen(false)} className="block text-[13px] font-medium text-gray-600 hover:text-gray-900 px-3 py-2.5 rounded-lg hover:bg-gray-50">Fitur</a>
            <a href="#cara-kerja" onClick={() => setMobileOpen(false)} className="block text-[13px] font-medium text-gray-600 hover:text-gray-900 px-3 py-2.5 rounded-lg hover:bg-gray-50">Cara Kerja</a>
            <a href="#harga" onClick={() => setMobileOpen(false)} className="block text-[13px] font-medium text-gray-600 hover:text-gray-900 px-3 py-2.5 rounded-lg hover:bg-gray-50">Harga</a>
            <Link to="/scan" onClick={() => setMobileOpen(false)} className="block text-center bg-green-600 text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold mt-2">Coba Pilot →</Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="overflow-hidden" style={{background:"linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)"}}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center text-[11px] font-semibold tracking-wide bg-green-100 text-green-700 border border-green-200 rounded-full px-4 py-1.5 mb-6">
                Sistem Inventory Spare Part untuk Maintenance Pabrik
              </div>
              <h1 className="text-[32px] md:text-[44px] font-extrabold leading-[1.1] tracking-tight text-gray-900">
                Spare part ada di rak.<br/>Lokasinya ada di<br/><span className="text-green-600">RakTrack.</span>
              </h1>
              <p className="mt-5 text-[15px] leading-7 text-gray-500 max-w-[48ch]">
                RakTrack adalah sistem inventory spare part berbasis QR untuk maintenance pabrik.
                Scan, ambil, dan stok langsung tercatat. Tanpa ribet, tanpa kehilangan.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/scan" className="bg-green-600 hover:bg-green-700 text-white px-7 py-3.5 text-[14px] font-semibold rounded-lg shadow-sm hover:shadow-md transition-all">Coba Pilot <span className="ml-2">→</span></Link>
                <a href="#cara-kerja" className="bg-white border border-gray-200 text-gray-700 px-7 py-3.5 text-[14px] font-semibold rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-600"><path d="M8 5v14l11-7z"/></svg>
                  Lihat Cara Kerja
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-5 text-[13px] font-medium text-gray-500">
                <span className="flex items-center gap-2"><IcoCheck className="w-5 h-5"/> Tanpa server sendiri</span>
                <span className="flex items-center gap-2"><IcoCheck className="w-5 h-5"/> QR per bin</span>
                <span className="flex items-center gap-2"><IcoCheck className="w-5 h-5"/> Real-time</span>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img src="/images/warehouse-worker.jpg" alt="Warehouse dengan QR Code" className="w-full h-[400px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-gray-100 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <IcoQr className="w-6 h-6 text-green-600"/>
                  </div>
                  <div>
                    <div className="text-[12px] text-gray-500">Total Item</div>
                    <div className="text-[18px] font-extrabold text-gray-900">1,248</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-4 border border-gray-100 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-amber-600"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                  <div>
                    <div className="text-[12px] text-gray-500">Stok Menipis</div>
                    <div className="text-[18px] font-extrabold text-amber-600">23</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: IcoQr, label: "1 QR", sub: "untuk setiap bin" },
            { icon: IcoZap, label: "< 10 detik", sub: "untuk mencatat pengambilan" },
            { icon: IcoClock, label: "24/7", sub: "riwayat stok" },
            { icon: IcoCloud, label: "0", sub: "install server di pabrik" },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center group">
              <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 grid place-items-center text-green-600 group-hover:bg-green-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                <s.icon className="w-6 h-6"/>
              </div>
              <div className="text-[20px] font-extrabold mt-4 text-gray-900">{s.label}</div>
              <div className="text-[13px] text-gray-500 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-[11px] font-bold tracking-wider text-red-500 uppercase mb-3">Masalah di Lapangan</div>
              <h2 className="text-[24px] md:text-[28px] font-extrabold text-gray-900 leading-tight">Spare part sering hilang, stok tidak akurat, teknisi buang waktu.</h2>
              <ul className="mt-6 space-y-3">
                {["Sulit mencari lokasi spare part", "Data stok tidak real-time", "Pencatatan masih manual", "Proses maintenance jadi lebih lama"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[14px] text-gray-600">
                    <IcoX className="w-5 h-5 flex-shrink-0"/>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <div className="text-[11px] font-bold tracking-wider text-green-600 uppercase mb-3">Solusi dari RakTrack</div>
                <h3 className="text-[20px] font-extrabold text-gray-900">RakTrack mengubah rak biasa menjadi inventory yang bisa dilacak.</h3>
                <p className="mt-3 text-[14px] text-gray-500 leading-relaxed">Dengan <span className="font-semibold text-gray-700">QR code</span> dan sistem digital, setiap spare part punya lokasi, jumlah, dan riwayat yang jelas.</p>
                <a href="#fitur" className="mt-6 inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold hover:bg-green-700 transition-colors">
                  Lihat Fitur Lengkap <IcoArrow className="w-4 h-4"/>
                </a>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-green-100 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* CARA KERJA */}
      <section id="cara-kerja" className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-[24px] md:text-[28px] font-extrabold tracking-tight text-gray-900">Cara kerja — 3 langkah</h2>
            <p className="text-[14px] text-gray-500 mt-2">Mudah digunakan, langsung terasa manfaatnya.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n:"01", t:"Tempel QR pada setiap bin", d:"Gunakan label QR yang tahan lama dan mudah dibaca oleh kamera HP.", img:"/images/desk-scan.jpg" },
              { n:"02", t:"Teknisi Scan saat ambil", d:"Scan QR, pilih jumlah, langsung tercatat.", img:"/images/scan-phone.jpg" },
              { n:"03", t:"Stok otomatis tercatat", d:"Admin langsung melihat stok, lokasi, dan histori pengambilan.", img:"/images/inventory-scan.jpg" },
            ].map((s, i) => (
              <div key={i} className="group">
                <div className="relative rounded-2xl overflow-hidden shadow-md mb-5 aspect-[4/3] group-hover:shadow-xl transition-shadow">
                  <img src={s.img} alt={s.t} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-green-600 text-white grid place-items-center text-sm font-extrabold shadow-lg">{s.n}</div>
                </div>
                <h3 className="text-[15px] font-bold text-gray-900">{s.t}</h3>
                <p className="mt-2 text-[13px] leading-6 text-gray-500">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES + DASHBOARD */}
      <section id="fitur" className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-[24px] md:text-[28px] font-extrabold tracking-tight text-gray-900">Semua yang dibutuhkan teknisi maintenance.</h2>
            <p className="text-[14px] text-gray-500 mt-2">Dari scan hingga laporan, RakTrack membuat pengelolaan spare part jadi lebih mudah dan efisien.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"/>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"/>
                    <div className="w-3 h-3 rounded-full bg-green-400"/>
                  </div>
                  <div className="text-[12px] text-gray-400 ml-2 font-medium">RakTrack Dashboard</div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-[11px] text-gray-500">Total Item</div>
                      <div className="text-[18px] font-extrabold text-gray-900">1,248</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <div className="text-[11px] text-red-500">Stok Menipis</div>
                      <div className="text-[18px] font-extrabold text-red-600">23</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-[11px] text-blue-500">Pengambilan Hari Ini</div>
                      <div className="text-[18px] font-extrabold text-blue-600">12</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-[12px] font-semibold text-gray-700 mb-3">Aktivitas Terbaru</div>
                    <div className="space-y-2">
                      {[
                        {id:"EL-A-001", name:"Relay Omron", qty:5, status:"green"},
                        {id:"MK-B-002", name:"Motor 3 Phase", qty:0, status:"red"},
                        {id:"PH-C-012", name:"Bearing 6205", qty:15, status:"green"},
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-[12px] bg-white rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-${item.status}-500`}/>
                            <span className="font-mono text-gray-500">{item.id}</span>
                            <span className="text-gray-700">{item.name}</span>
                          </div>
                          <span className="font-semibold text-gray-900">{item.qty} pcs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-5">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-xl bg-green-50 border border-green-100 grid place-items-center text-green-600 flex-shrink-0 group-hover:bg-green-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                    <f.icon className="w-5 h-5"/>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-gray-900">{f.title}</h3>
                    <p className="text-[13px] text-gray-500 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-red-500"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </div>
                <h3 className="text-[18px] font-extrabold text-gray-900">Sebelum RakTrack</h3>
              </div>
              <ul className="space-y-3">
                {["Catatan manual", "Cari spare part", "Stok tidak pasti", "Tanya admin"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[14px] text-gray-600">
                    <IcoX className="w-5 h-5 flex-shrink-0"/>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl overflow-hidden">
                <img src="/images/desk-scan.jpg" alt="Sebelum RakTrack" className="w-full h-40 object-cover" loading="lazy" />
              </div>
            </div>
            <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-green-600"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <h3 className="text-[18px] font-extrabold text-gray-900">Setelah RakTrack</h3>
              </div>
              <ul className="space-y-3">
                {["Scan QR", "Lokasi langsung muncul", "Stok real-time", "Histori tercatat"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[14px] text-gray-600">
                    <IcoCheck className="w-5 h-5 flex-shrink-0"/>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl overflow-hidden">
                <img src="/images/warehouse-worker.jpg" alt="Setelah RakTrack" className="w-full h-40 object-cover" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HARGA */}
      <section id="harga" className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-[24px] md:text-[28px] font-extrabold tracking-tight text-gray-900">Paket harga</h2>
            <p className="text-[14px] text-gray-500 mt-2">Pilih paket yang sesuai dengan kebutuhan pabrik Anda.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="border border-gray-200 rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow">
              <div className="text-[13px] font-semibold text-gray-500">Starter</div>
              <div className="text-[24px] font-extrabold mt-1 text-gray-900">Rp 3 jt <span className="text-[12px] font-normal text-gray-400">/ paket</span></div>
              <ul className="mt-6 space-y-3 text-[13px] text-gray-600">
                <li className="flex gap-2.5"><span className="text-green-600 font-bold">✓</span> Hingga 20 bin (60 QR)</li>
                <li className="flex gap-2.5"><span className="text-green-600 font-bold">✓</span> Fitur dasar</li>
                <li className="flex gap-2.5"><span className="text-green-600 font-bold">✓</span> 2 user admin</li>
                <li className="flex gap-2.5"><span className="text-green-600 font-bold">✓</span> Hosting / PWA</li>
              </ul>
              <a href="https://wa.me/6280000000000" target="_blank" className="mt-6 block text-center border border-gray-200 text-gray-700 w-full py-3 rounded-lg text-[13px] font-semibold hover:bg-gray-50 transition-colors">Hubungi Kami</a>
            </div>
            <div className="border-2 border-green-600 rounded-2xl p-6 bg-white relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[11px] font-bold px-4 py-1 rounded-full">Paling Populer</div>
              <div className="text-[13px] font-semibold text-green-600">Standard</div>
              <div className="text-[24px] font-extrabold mt-1 text-gray-900">Rp 5 jt <span className="text-[12px] font-normal text-gray-400">/ paket</span></div>
              <ul className="mt-6 space-y-3 text-[13px] text-gray-600">
                <li className="flex gap-2.5"><span className="text-green-600 font-bold">✓</span> Hingga 50 bin (100 QR)</li>
                <li className="flex gap-2.5"><span className="text-green-600 font-bold">✓</span> Multi lokasi & kategori</li>
                <li className="flex gap-2.5"><span className="text-green-600 font-bold">✓</span> 2 user admin</li>
                <li className="flex gap-2.5"><span className="text-green-600 font-bold">✓</span> 1 bulan support / maintenance</li>
              </ul>
              <a href="https://wa.me/6280000000000" target="_blank" className="mt-6 block text-center bg-green-600 text-white w-full py-3 rounded-lg text-[13px] font-semibold hover:bg-green-700 transition-colors">Mulai Sekarang</a>
            </div>
            <div className="border border-gray-200 rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow">
              <div className="text-[13px] font-semibold text-gray-500">Custom</div>
              <div className="text-[24px] font-extrabold mt-1 text-gray-900">Tanya</div>
              <ul className="mt-6 space-y-3 text-[13px] text-gray-600">
                <li className="flex gap-2.5"><span className="text-green-600 font-bold">✓</span> &gt; 50 bin / multi gudang</li>
                <li className="flex gap-2.5"><span className="text-green-600 font-bold">✓</span> Integrasi sistem</li>
                <li className="flex gap-2.5"><span className="text-green-600 font-bold">✓</span> On-site training</li>
              </ul>
              <button className="mt-6 block w-full text-center border border-gray-200 text-gray-700 py-3 rounded-lg text-[13px] font-semibold hover:bg-gray-50 transition-colors">Konsultasi</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
          <div className="rounded-2xl px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6" style={{background:"linear-gradient(135deg, #166534 0%, #16A34A 100%)"}}>
            <div className="text-white text-center md:text-left">
              <div className="font-bold text-[18px]">Siap coba di rak Anda?</div>
              <div className="text-[14px] text-white/80 mt-1">Scan demo EL-A-001, rasakan langsung bagaimana RakTrack membantu tim maintenance Anda.</div>
            </div>
            <Link to="/scan" className="bg-white text-green-700 rounded-lg px-8 py-3.5 text-[14px] font-bold whitespace-nowrap hover:bg-green-50 transition-colors">Mulai Pilot <span className="ml-1">→</span></Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row gap-8 justify-between">
            <div className="flex gap-2.5 items-start">
              <img src="/logo.svg" className="w-7 h-7" alt=""/>
              <div>
                <div className="font-bold text-[15px] text-gray-900">RakTrack</div>
                <div className="text-[12px] text-gray-500 mt-1">Spare part inventory untuk maintenance yang lebih terkontrol.</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-8 text-[13px]">
              <div>
                <div className="font-semibold text-gray-900 mb-3">Product</div>
                <div className="space-y-2">
                  <a href="#fitur" className="block text-gray-500 hover:text-gray-900 transition-colors">Fitur</a>
                  <a href="#harga" className="block text-gray-500 hover:text-gray-900 transition-colors">Harga</a>
                  <a href="#cara-kerja" className="block text-gray-500 hover:text-gray-900 transition-colors">Cara Kerja</a>
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-3">Kontak</div>
                <div className="space-y-2">
                  <a href="https://wa.me/6280000000000" target="_blank" className="block text-gray-500 hover:text-gray-900 transition-colors">WhatsApp</a>
                  <a href="mailto:hello@raktrack.id" className="block text-gray-500 hover:text-gray-900 transition-colors">Email</a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row gap-4 justify-between text-[12px] text-gray-400">
            <div>© 2026 RakTrack. All rights reserved.</div>
            <div className="flex gap-4">
              <span>FR</span>
              <span>IN</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
