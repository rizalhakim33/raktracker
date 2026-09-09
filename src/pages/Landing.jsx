import { useState } from "react";
import { Link } from "react-router-dom";

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl bg-background overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-[14px] font-semibold text-text-main pr-4">{question}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-5 h-5 text-text-secondary flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 text-[13px] leading-6 text-text-secondary">
          {answer}
        </div>
      )}
    </div>
  );
}

function IcoQr(props){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="3" height="3"/><path d="M14 17h3v3"/><path d="M17 14h3v3"/></svg>; }
function IcoZap(props){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" {...props}><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>; }
function IcoClock(props){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>; }
function IcoCloud(props){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}><path d="M7 18a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.2-1.2A4.5 4.5 0 0 1 19 18H7z"/></svg>; }
function IcoScan(props){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" {...props}><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>; }
function IcoShield(props){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function IcoTrending(props){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>; }
function IcoTag(props){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" {...props}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>; }
function IcoDollar(props){ return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; }
function IcoCheckFill({color="#256B8C", ...p}){ return <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="10" fill={color} opacity="0.12"/><path d="M8.5 12.2l2.2 2.3 4.8-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>; }

const FEATURES = [
  {
    icon: IcoScan,
    title: "Identifikasi Cepat via QR",
    desc: "Lacak pergerakan spare part dalam hitungan detik. Satu kali scan pada kode QR, seluruh informasi barang dan lokasi fisiknya langsung tersaji di layar HP Anda.",
  },
  {
    icon: IcoQr,
    title: "Scan Praktis dari Layar HP",
    desc: "Tidak perlu scanner mahal atau install aplikasi tambahan. Cukup buka browser di HP untuk scan via kamera, lengkap dengan fitur input manual sebagai cadangan.",
  },
  {
    icon: IcoShield,
    title: "Stok Real-Time Anti-Minus",
    desc: "Data barang keluar-masuk diperbarui detik itu juga tanpa risiko stok menjadi minus. Sistem dijamin tetap sinkron meskipun banyak teknisi mengaksesnya bersamaan.",
  },
  {
    icon: IcoTrending,
    title: "Prediksi Restock Cerdas",
    desc: "Cegah mesin mati gara-gara kehabisan part. Sistem menganalisis tren pemakaian 90 hari terakhir untuk memprediksi kapan barang habis, sehingga Anda bisa reorder tepat waktu.",
  },
  {
    icon: IcoTag,
    title: "Prioritas Pembelian (Sistem VED)",
    desc: "Amankan operasional pabrik dengan anggaran yang efisien. Sistem memilah tingkat kekritisan komponen (Vital, Essential, Desirable) agar Anda tahu persis barang mana yang wajib dibeli duluan.",
  },
  {
    icon: IcoDollar,
    title: "Pantau Biaya per Mesin",
    desc: "Tinggalkan rekap manual yang merepotkan. Sistem otomatis melacak total nilai aset gudang dan menyajikan laporan riwayat biaya maintenance untuk masing-masing mesin setiap bulannya.",
  },
];

export default function Landing(){
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text-main">
      {/* NAV */}
      <nav className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" className="w-6 h-6" alt=""/>
            <span className="font-bold text-[15px] tracking-tight">RakTrack</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <a href="#fitur" className="text-[13px] font-medium text-text-secondary hover:text-text-main transition-colors px-3 py-1.5">Fitur</a>
            <a href="#cara-kerja" className="text-[13px] font-medium text-text-secondary hover:text-text-main transition-colors px-3 py-1.5">Cara Kerja</a>
            <a href="#harga" className="text-[13px] font-medium text-text-secondary hover:text-text-main transition-colors px-3 py-1.5">Harga</a>
            <Link to="/scan" className="btn-primary px-4 py-2 text-[13px] ml-2">Coba Sekarang</Link>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-1.5 -mr-1.5 rounded-lg hover:bg-background transition-colors">
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-5 h-5 text-text-main">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-5 h-5 text-text-main">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-surface px-4 py-3 space-y-1">
            <a href="#fitur" onClick={() => setMobileOpen(false)} className="block text-[13px] font-medium text-text-secondary hover:text-text-main px-3 py-2 rounded-lg hover:bg-background">Fitur</a>
            <a href="#cara-kerja" onClick={() => setMobileOpen(false)} className="block text-[13px] font-medium text-text-secondary hover:text-text-main px-3 py-2 rounded-lg hover:bg-background">Cara Kerja</a>
            <a href="#harga" onClick={() => setMobileOpen(false)} className="block text-[13px] font-medium text-text-secondary hover:text-text-main px-3 py-2 rounded-lg hover:bg-background">Harga</a>
            <Link to="/scan" onClick={() => setMobileOpen(false)} className="block text-center btn-primary px-4 py-2.5 text-[13px] mt-2">Coba Sekarang</Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border" style={{background:"linear-gradient(165deg, #FFFFFF 0%, #E8F3F7 40%, #D6EBF0 100%)"}}>
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23256B8C' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center text-[11px] font-semibold tracking-wide bg-white/80 text-primary border border-[#CDE3EC] rounded-full px-4 py-1.5 mb-6 shadow-card backdrop-blur-sm">
                Sistem Inventory Spare Part untuk Maintenance Pabrik
              </div>
              <h1 className="text-[36px] md:text-[52px] font-extrabold leading-[1.05] tracking-[-0.03em] text-text-main">
                Spare part ada di rak.<br/>Lokasinya ada di<br/><span className="text-primary">RakTrack.</span>
              </h1>
              <p className="mt-5 text-[16px] leading-7 text-text-secondary max-w-[52ch] md:mx-0 mx-auto">
                RakTrack adalah sistem inventory spare part berbasis QR untuk maintenance pabrik.
                Scan, ambil, dan stok langsung tercatat. Tanpa ribet, tanpa kehilangan.
              </p>
              <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
                <Link to="/scan" className="btn-primary px-7 py-3 text-[14px] shadow-soft hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">Coba Sekarang <span className="ml-2">→</span></Link>
                <a href="#fitur" className="btn-secondary px-7 py-3 text-[14px] hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200">Lihat Fitur</a>
              </div>
              <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-6 text-[13px] font-medium text-text-secondary">
                <span className="flex items-center gap-2"><IcoCheckFill className="w-5 h-5"/> Tanpa server sendiri</span>
                <span className="flex items-center gap-2"><IcoCheckFill className="w-5 h-5"/> QR per bin</span>
                <span className="flex items-center gap-2"><IcoCheckFill className="w-5 h-5"/> Real-time</span>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img src="/images/warehouse-worker.jpg" alt="Warehouse dengan QR Code" className="w-full h-[420px] object-cover" loading="lazy" />
              </div>
              <div className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-xl p-4 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                    <IcoQr className="w-6 h-6 text-primary"/>
                  </div>
                  <div>
                    <div className="text-[12px] text-text-secondary">Total Item</div>
                    <div className="text-[18px] font-extrabold text-text-main">1,248</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS + SOCIAL PROOF */}
      <section className="bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-10">
            {[
              { icon: IcoQr, label: "1 QR", sub: "untuk setiap bin" },
              { icon: IcoZap, label: "< 10 detik", sub: "untuk mencatat pengambilan" },
              { icon: IcoClock, label: "24/7", sub: "riwayat stok" },
              { icon: IcoCloud, label: "0", sub: "install server di pabrik" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center group">
                <div className="w-11 h-11 rounded-full bg-surface border border-border grid place-items-center text-primary shadow-card group-hover:shadow-soft group-hover:-translate-y-0.5 transition-all duration-200">
                  <s.icon className="w-5 h-5"/>
                </div>
                <div className="text-[17px] font-extrabold mt-3">{s.label}</div>
                <div className="text-[13px] text-text-secondary mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-[14px] text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Sedang dipakai tim maintenance di pabrik manufaktur — mengganti pencatatan manual yang sering bikin stok hilang jejak dan part telat dibeli.
            </p>
          </div>
        </div>
      </section>

      {/* IMAGE GALLERY */}
      <section className="bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative rounded-2xl overflow-hidden shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-300 aspect-square">
              <img src="/images/scan-phone.jpg" alt="Scan QR Code dengan HP" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white text-[12px] font-medium">Scan langsung dari kamera HP</div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-300 aspect-square">
              <img src="/images/warehouse-worker.jpg" alt="Worker scan QR di gudang" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white text-[12px] font-medium">Di rak gudang manapun</div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-300 aspect-square">
              <img src="/images/desk-scan.jpg" alt="Scan QR di meja kerja" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white text-[12px] font-medium">Cocok untuk area kerja</div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-300 aspect-square">
              <img src="/images/inventory-scan.jpg" alt="Inventory scan di warehouse" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white text-[12px] font-medium">Tim maintenance siap pakai</div>
            </div>
          </div>
        </div>
      </section>

      {/* FITUR — 6 Cards */}
      <section id="fitur" className="max-w-6xl mx-auto px-4 md:px-6 py-14">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-[24px] md:text-[28px] font-extrabold tracking-tight">Fitur yang dirancang untuk pabrik.</h2>
          <p className="text-[14px] text-text-secondary mt-2">Dari scan hingga laporan biaya, semua yang dibutuhkan tim maintenance dalam satu platform.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i} className="group bg-surface border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-soft hover:-translate-y-1 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-primary-light border border-[#CDE3EC] grid place-items-center text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300">
                <f.icon className="w-5 h-5"/>
              </div>
              <h3 className="mt-4 text-[15px] font-bold leading-snug">{f.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-text-secondary">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/scan" className="inline-flex items-center gap-2 text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors">
            Coba Sekarang <span>→</span>
          </Link>
        </div>
      </section>

      {/* CARA KERJA */}
      <section id="cara-kerja" className="bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-14">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-[24px] md:text-[28px] font-extrabold tracking-tight">Cara kerja — 3 langkah</h2>
            <p className="text-[14px] text-text-secondary mt-2">Mudah digunakan, langsung terasa manfaatnya.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n:"01", t:"Tempel QR pada bin", d:"Gunakan label QR yang tahan lama dan mudah dibaca oleh kamera HP.", img:"/images/desk-scan.jpg" },
              { n:"02", t:"Teknisi scan saat ambil", d:"Buka browser, scan QR, pilih jumlah — langsung tercatat tanpa install apapun.", img:"/images/scan-phone.jpg" },
              { n:"03", t:"Stok otomatis tercatat", d:"Admin langsung melihat stok, lokasi, dan histori pengambilan secara real-time.", img:"/images/inventory-scan.jpg" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="relative rounded-2xl overflow-hidden shadow-card mb-5 aspect-video">
                  <img src={s.img} alt={s.t} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-primary text-white grid place-items-center text-sm font-extrabold shadow-card">{s.n}</div>
                </div>
                <h3 className="text-[15px] font-bold">{s.t}</h3>
                <p className="mt-2 text-[13px] leading-6 text-text-secondary max-w-[32ch] mx-auto">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/scan" className="inline-flex items-center gap-2 text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors">
              Coba Sekarang <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* HARGA */}
      <section id="harga" className="max-w-6xl mx-auto px-4 md:px-6 py-14">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-[24px] md:text-[28px] font-extrabold tracking-tight">Paket harga</h2>
          <p className="text-[14px] text-text-secondary mt-2">Pilih paket yang sesuai dengan kebutuhan pabrik Anda.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          <div className="border border-border rounded-2xl p-6 bg-surface shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-300">
            <div className="text-[13px] font-semibold text-text-secondary">Starter</div>
            <div className="text-[22px] font-extrabold mt-1">Rp 3 jt <span className="text-[12px] font-normal text-text-secondary">/ paket</span></div>
            <ul className="mt-5 space-y-2.5 text-[13px] text-text-secondary">
              <li className="flex gap-2.5"><span className="text-success font-bold">✓</span> Hingga 20 bin (20 QR)</li>
              <li className="flex gap-2.5"><span className="text-success font-bold">✓</span> Scan & catat keluar/masuk stok</li>
              <li className="flex gap-2.5"><span className="text-success font-bold">✓</span> Dashboard stok rendah</li>
              <li className="flex gap-2.5"><span className="text-success font-bold">✓</span> 2 user admin</li>
              <li className="flex gap-2.5"><span className="text-success font-bold">✓</span> Hosting / PWA</li>
            </ul>
            <a href="https://wa.me/6280000000000" target="_blank" className="mt-6 block text-center btn-secondary w-full text-[13px]">Hubungi Kami</a>
          </div>
          <div className="border-2 border-primary rounded-2xl p-6 bg-surface relative shadow-soft hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[11px] font-bold px-3.5 py-1 rounded-full shadow-card">Paling Populer</div>
            <div className="text-[13px] font-semibold text-primary">Standard</div>
            <div className="text-[22px] font-extrabold mt-1">Rp 5 jt <span className="text-[12px] font-normal text-text-secondary">/ paket</span></div>
            <ul className="mt-5 space-y-2.5 text-[13px] text-text-secondary">
              <li className="flex gap-2.5"><span className="text-primary font-bold">✓</span> Hingga 50 bin (50 QR)</li>
              <li className="flex gap-2.5"><span className="text-primary font-bold">✓</span> Scan & catat keluar/masuk stok</li>
              <li className="flex gap-2.5"><span className="text-primary font-bold">✓</span> Dashboard stok rendah</li>
              <li className="flex gap-2.5"><span className="text-primary font-bold">✓</span> Multi lokasi & kategori</li>
              <li className="flex gap-2.5"><span className="text-primary font-bold">✓</span> Kekritisan part (Vital / Essential / Desirable)</li>
              <li className="flex gap-2.5"><span className="text-primary font-bold">✓</span> Estimasi kapan stok habis</li>
              <li className="flex gap-2.5"><span className="text-primary font-bold">✓</span> Reorder list otomatis</li>
              <li className="flex gap-2.5"><span className="text-primary font-bold">✓</span> 2 user admin</li>
              <li className="flex gap-2.5"><span className="text-primary font-bold">✓</span> 1 bulan support</li>
            </ul>
            <a href="https://wa.me/6280000000000" target="_blank" className="mt-6 block text-center btn-primary w-full text-[13px]">Coba Sekarang</a>
          </div>
          <div className="border border-border rounded-2xl p-6 bg-surface shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-300">
            <div className="text-[13px] font-semibold text-text-secondary">Custom</div>
            <div className="text-[22px] font-extrabold mt-1">Tanya</div>
            <ul className="mt-5 space-y-2.5 text-[13px] text-text-secondary">
              <li className="flex gap-2.5"><span className="text-success font-bold">✓</span> &gt; 50 bin / multi gudang</li>
              <li className="flex gap-2.5"><span className="text-success font-bold">✓</span> Integrasi sistem</li>
              <li className="flex gap-2.5"><span className="text-success font-bold">✓</span> On-site training</li>
            </ul>
            <button className="mt-6 block w-full text-center btn-secondary text-[13px]">Konsultasi</button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-14">
          <div className="text-center mb-10">
            <h2 className="text-[24px] md:text-[28px] font-extrabold tracking-tight">Pertanyaan yang sering ditanyakan</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: "Data pabrik kami aman nggak?", a: "Data disimpan terpisah per pabrik, tidak dicampur dengan pabrik lain. Bisa export semua data ke CSV kapan saja, tidak ada vendor lock-in." },
              { q: "Kalau internet di pabrik mati, gimana?", a: "RakTrack butuh koneksi internet untuk scan dan update stok real-time. Kalau internet pabrik cukup stabil (WiFi kantor biasa), ini tidak jadi masalah harian." },
              { q: "Bisa custom kategori part sendiri nggak?", a: "Bisa. Kategori, kode lokasi, dan struktur bin disesuaikan dengan tata letak rak pabrik masing-masing saat setup awal." },
              { q: "Berapa lama proses setup-nya?", a: "Tergantung paket. Starter biasanya selesai dalam hitungan hari (generate QR, training 1 jam), Standard butuh sedikit lebih lama karena input part lebih banyak." },
              { q: "Kalau nanti mau nambah bin/part di luar paket, gimana?", a: "Bisa upgrade paket kapan saja, atau tambah kuota bin secara terpisah, tidak perlu ganti paket semua dari awal." },
              { q: "Perlu install aplikasi khusus di HP?", a: "Tidak. Semua bisa langsung dipakai dari browser HP, tanpa install dari toko aplikasi apa pun." },
            ].map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-[13px] text-text-secondary mb-3">Masih ada pertanyaan lain? Coba langsung atau hubungi kami.</p>
            <Link to="/scan" className="inline-flex items-center gap-2 text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors">
              Coba Sekarang <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pb-10">
        <div className="rounded-2xl px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-5" style={{background:"linear-gradient(135deg, #174A61 0%, #256B8C 100%)"}}>
          <div className="text-white text-center md:text-left">
            <div className="font-bold text-[16px]">Siap coba di rak Anda?</div>
            <div className="text-[13px] text-white/70 mt-1">Scan demo EL-A-001, rasakan langsung bagaimana RakTrack membantu tim maintenance Anda.</div>
          </div>
          <Link to="/scan" className="bg-white text-primary-dark rounded-lg px-7 py-3 text-[13px] font-bold whitespace-nowrap hover:bg-primary-light hover:shadow-soft transition-all duration-200">Coba Sekarang <span className="ml-1">→</span></Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row gap-4 justify-between text-[12px] text-text-secondary">
          <div className="flex gap-2.5 items-start">
            <img src="/logo.svg" className="w-6 h-6" alt=""/>
            <div>
              <div className="font-bold text-text-main">RakTrack</div>
              <div>© 2026 RakTrack — Aplikasi tracker spare part & inventory maintenance berbasis QR untuk pabrik di Indonesia</div>
            </div>
          </div>
          <div className="flex gap-6">
            <a href="#fitur" className="hover:text-text-main font-medium transition-colors">Fitur</a>
            <a href="#cara-kerja" className="hover:text-text-main font-medium transition-colors">Cara Kerja</a>
            <a href="#harga" className="hover:text-text-main font-medium transition-colors">Harga</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
