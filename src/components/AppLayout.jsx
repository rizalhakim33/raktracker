import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "../lib/firebase.js";
import { useAuthState } from "../hooks/useAuth.js";
import { APP_NAME } from "../lib/constants.js";

function Icon({ d, ...p }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d={d} />
    </svg>
  );
}

const NAV_ITEMS = [
  {
    label: "Menu Utama",
    items: [
      { to: "/scan", icon: "M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10", title: "Scan QR" },
      { to: "/search", icon: "M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M21 21l-4.35-4.35", title: "Cari Part" },
    ],
  },
  {
    label: "Master Data",
    items: [
      { to: "/admin/locations", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10", title: "Rak / Bin" },
      { to: "/admin/parts", icon: "M20 7H4a1 1 0 0 0-1 1v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1z M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2", title: "Spare Part" },
    ],
  },
  {
    label: "Laporan",
    items: [
      { to: "/dashboard", icon: "M18 20V10M12 20V4M6 20v-6", title: "Dashboard" },
      { to: "/reorder", icon: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83", title: "Reorder" },
      { to: "/cost", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", title: "Biaya" },
      { to: "/history", icon: "M12 8v4l3 3M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0", title: "Riwayat" },
    ],
  },
];

export default function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuthState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const isActive = (p) => pathname === p || pathname.startsWith(p + "/");

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, "parts")));
        const low = snap.docs.filter(d => {
          const data = d.data();
          return Number(data.stok_saat_ini) <= Number(data.stok_minimum);
        }).length;
        setLowStockCount(low);
      } catch {}
    })();
  }, []);

  async function handleLogout() {
    await signOut(auth);
    navigate("/");
  }

  const sidebarContent = (
    <>
      <div className="px-5 h-14 flex items-center gap-2.5 border-b border-border flex-shrink-0">
        <img src="/logo.svg" className="w-6 h-6" alt="" />
        <span className="font-bold text-[15px] tracking-tight text-text-main">{APP_NAME}</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
        {NAV_ITEMS.map((group) => (
          <div key={group.label}>
            <div className="text-[11px] font-semibold tracking-wider text-text-secondary/60 uppercase px-2 mb-1.5">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.to);
                const showBadge = item.to === "/dashboard" && lowStockCount > 0;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      active
                        ? "bg-primary-light text-primary"
                        : "text-text-secondary hover:bg-background hover:text-text-main"
                    }`}
                  >
                    <Icon d={item.icon} className="w-[18px] h-[18px] flex-shrink-0" />
                    <span className="flex-1">{item.title}</span>
                    {showBadge && (
                      <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{lowStockCount}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-border flex-shrink-0">
        {loading ? (
          <div className="px-2.5 py-2 text-[13px] text-text-secondary">Memuat...</div>
        ) : user ? (
          <div className="space-y-1">
            <div className="px-2.5 py-1.5 text-[12px] text-text-secondary truncate">{user.email}</div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-text-secondary hover:bg-background hover:text-text-main transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-text-secondary hover:bg-background hover:text-text-main transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Masuk
          </Link>
        )}
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[232px] flex-shrink-0 bg-surface border-r border-border flex-col h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b border-border flex items-center px-4 gap-3" style={{background:"#FFFFFF"}}>
        <button onClick={() => setMobileOpen(true)} className="p-1.5 -ml-1.5 rounded-lg hover:bg-background transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-5 h-5 text-text-main">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <img src="/logo.svg" className="w-5 h-5" alt="" />
          <span className="font-bold text-[14px] tracking-tight text-text-main">{APP_NAME}</span>
        </div>
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <aside className="md:hidden fixed top-0 left-0 bottom-0 w-[272px] border-r border-border flex flex-col z-50" style={{background:"#FFFFFF"}}>
          <div className="px-5 h-14 flex items-center gap-2.5 border-b border-border flex-shrink-0">
            <img src="/logo.svg" className="w-6 h-6" alt="" />
            <span className="font-bold text-[15px] tracking-tight text-text-main flex-1">{APP_NAME}</span>
            <button onClick={() => setMobileOpen(false)} className="p-1.5 -mr-1.5 rounded-lg hover:bg-background transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-4 h-4 text-text-secondary">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
            {NAV_ITEMS.map((group) => (
              <div key={group.label}>
                <div className="text-[11px] font-semibold tracking-wider text-text-secondary/60 uppercase px-2 mb-1.5">
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = isActive(item.to);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                          active
                            ? "bg-primary-light text-primary"
                            : "text-text-secondary hover:bg-background hover:text-text-main"
                        }`}
                      >
                        <Icon d={item.icon} className="w-[18px] h-[18px] flex-shrink-0" />
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="px-3 py-3 border-t border-border flex-shrink-0">
            {loading ? (
              <div className="px-2.5 py-2 text-[13px] text-text-secondary">Memuat...</div>
            ) : user ? (
              <div className="space-y-1">
                <div className="px-2.5 py-1.5 text-[12px] text-text-secondary truncate">{user.email}</div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-text-secondary hover:bg-background hover:text-text-main transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-text-secondary hover:bg-background hover:text-text-main transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] flex-shrink-0">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Masuk
              </Link>
            )}
          </div>
        </aside>
      )}

      <main className="flex-1 min-w-0 p-4 md:p-6 pt-[72px] md:pt-6">
        <Outlet />
      </main>
    </div>
  );
}
