"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { Check, X, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    if (duration > 0)
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        duration,
      );
  }, []);

  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = {
    success: <Check size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
  };
  const colors = { success: "#22C55E", error: "#EF4444", info: "#3B82F6" };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div
        style={{
          position: "fixed",
          top: 80,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast"
            style={{
              borderLeft: `4px solid ${colors[t.type]}`,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ color: colors[t.type] }}>{icons[t.type]}</span>
            <span
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              {t.message}
            </span>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                padding: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
