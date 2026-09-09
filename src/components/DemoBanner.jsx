import { useAuthState } from "../hooks/useAuth.js";
import { isAdmin } from "../lib/constants.js";

export default function DemoBanner() {
  const { user } = useAuthState();
  if (!user || isAdmin(user)) return null;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 mb-4 flex items-center gap-3">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-amber-500 flex-shrink-0">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
        <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
      </svg>
      <div className="text-sm">
        <span className="font-semibold text-amber-700">Demo Mode</span>
        <span className="text-amber-600"> — Login sebagai admin untuk akses fitur lengkap.</span>
      </div>
    </div>
  );
}
