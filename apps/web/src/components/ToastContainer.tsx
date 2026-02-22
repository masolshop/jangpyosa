"use client";

import { useEffect, useState } from "react";

export interface Toast {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  duration?: number;
}

let toastIdCounter = 0;

export const toastManager = {
  listeners: new Set<(toast: Toast) => void>(),
  
  show(toast: Omit<Toast, "id">) {
    const id = `toast-${++toastIdCounter}`;
    const fullToast: Toast = { ...toast, id };
    
    this.listeners.forEach((listener) => listener(fullToast));
    
    return id;
  },
  
  info(title: string, message: string, duration?: number) {
    return this.show({ type: "info", title, message, duration });
  },
  
  success(title: string, message: string, duration?: number) {
    return this.show({ type: "success", title, message, duration });
  },
  
  warning(title: string, message: string, duration?: number) {
    return this.show({ type: "warning", title, message, duration });
  },
  
  error(title: string, message: string, duration?: number) {
    return this.show({ type: "error", title, message, duration });
  },
  
  subscribe(listener: (toast: Toast) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe((toast) => {
      setToasts((prev) => [...prev, toast]);

      // 자동 제거
      const duration = toast.duration || 5000;
      setTimeout(() => {
        removeToast(toast.id);
      }, duration);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function getToastStyle(type: Toast["type"]) {
    switch (type) {
      case "success":
        return {
          background: "#d1fae5",
          borderColor: "#10b981",
          color: "#065f46",
          icon: "✅",
        };
      case "error":
        return {
          background: "#fee2e2",
          borderColor: "#ef4444",
          color: "#991b1b",
          icon: "❌",
        };
      case "warning":
        return {
          background: "#fef3c7",
          borderColor: "#f59e0b",
          color: "#92400e",
          icon: "⚠️",
        };
      case "info":
      default:
        return {
          background: "#dbeafe",
          borderColor: "#3b82f6",
          color: "#1e40af",
          icon: "ℹ️",
        };
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        maxWidth: 400,
      }}
    >
      {toasts.map((toast) => {
        const style = getToastStyle(toast.type);
        
        return (
          <div
            key={toast.id}
            style={{
              background: style.background,
              border: `2px solid ${style.borderColor}`,
              color: style.color,
              borderRadius: 12,
              padding: "16px 20px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "start",
              gap: 12,
              animation: "slideIn 0.3s ease-out",
            }}
          >
            {/* 아이콘 */}
            <div style={{ fontSize: 24, flexShrink: 0 }}>
              {style.icon}
            </div>

            {/* 내용 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: "700",
                  marginBottom: 4,
                }}
              >
                {toast.title}
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.5,
                  opacity: 0.9,
                }}
              >
                {toast.message}
              </p>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: "transparent",
                border: "none",
                color: style.color,
                cursor: "pointer",
                fontSize: 18,
                padding: 4,
                flexShrink: 0,
                opacity: 0.7,
              }}
              title="닫기"
            >
              ✕
            </button>
          </div>
        );
      })}

      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
