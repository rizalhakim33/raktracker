import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = "info", duration = 3000) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const toast = {
    success: (msg, dur) => add(msg, "success", dur),
    error: (msg, dur) => add(msg, "error", dur || 4000),
    info: (msg, dur) => add(msg, "info", dur),
    warning: (msg, dur) => add(msg, "warning", dur || 4000),
  };

  function remove(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  const colors = {
    success: "bg-success text-white",
    error: "bg-danger text-white",
    warning: "bg-warning text-white",
    info: "bg-text-main text-white",
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => remove(t.id)}
            className={`pointer-events-auto px-4 py-3 rounded-lg text-[13px] font-medium shadow-soft cursor-pointer animate-[slideIn_0.2s_ease-out] ${colors[t.type]}`}
          >
            {t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
