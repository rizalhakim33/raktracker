import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, isFirebaseConfigured } from "../lib/firebase.js";
import { useAuthState } from "../hooks/useAuth.js";
import { useToast } from "../components/Toast.jsx";
import { isAdmin } from "../lib/constants.js";

export default function Login() {
  const { user, loading } = useAuthState();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setErr("");
    if (!isFirebaseConfigured()) { setErr("Firebase belum dikonfigurasi. Isi variabel env lalu restart."); return; }
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      toast.success("Login berhasil");
      navigate("/dashboard", { replace: true });
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  }

  async function handleLogout() {
    await signOut(auth);
    toast.info("Logout berhasil");
    navigate("/", { replace: true });
  }

  if (loading) return <div className="max-w-sm mx-auto py-20 text-center text-sm text-text-secondary">Memuat...</div>;

  if (user) {
    return (
      <div className="max-w-sm mx-auto space-y-4">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-card text-center space-y-3">
          <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6 text-primary"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" /></svg>
          </div>
          <div className="text-sm text-text-main">Login sebagai <span className="font-semibold">{user.email}</span></div>
          {isAdmin(user) ? (
            <div className="text-xs text-success bg-success/10 border border-success/20 rounded-lg p-2">Admin - Full Akses</div>
          ) : (
            <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">Demo Mode - Fitur terbatas</div>
          )}
          <button onClick={handleLogout} className="btn-secondary w-full">Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <div>
        <h1 className="label-lg text-text-main">Login</h1>
        <p className="caption text-text-secondary mt-0.5">Masuk untuk mengakses admin & transaksi.</p>
      </div>
      <form onSubmit={handleLogin} className="bg-surface border border-border rounded-xl p-5 shadow-card space-y-4">
        {!isFirebaseConfigured() && <div className="text-xs text-warning bg-warning/10 border border-warning/20 rounded-lg p-2">Firebase belum dikonfigurasi.</div>}
        <label className="block">
          <span className="text-sm font-medium text-text-main">Email</span>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-text-main">Password</span>
          <input value={pass} onChange={(e)=>setPass(e.target.value)} type="password" required
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 mt-1.5 text-sm text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
        </label>
        {err && <div className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg p-2">{err}</div>}
        <button disabled={busy} className="w-full btn-primary py-3 disabled:opacity-50">{busy?"Memproses...":"Login"}</button>
      </form>
      <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
        <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Akun Demo</div>
        <div className="text-sm text-text-secondary space-y-1">
          <p>Gunakan akun apapun untuk mode demo (fitur terbatas).</p>
          <p className="text-primary font-medium">Login sebagai admin@pabrik.com untuk full akses.</p>
        </div>
      </div>
    </div>
  );
}
