import { useEffect } from "react";

export default function Toast({ message, type = "info", onClose }) {

  // Auto-hide the toast after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  // Toast Type 
  const typeConfigs = {
    success: {
      backgroundColor: "#10b981",
      icon: "✅",
    },
    error: {
      backgroundColor: "#ef4444", 
      icon: "⚠️",
    },
    info: {
      backgroundColor: "#3b82f6", 
      icon: "ℹ️",
    },
  };

  // Fallback to 'info' config if an invalid type is passed
  const currentConfig = typeConfigs[type] || typeConfigs.info;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        backgroundColor: currentConfig.backgroundColor, // Dynamic color
        color: "white",
        padding: "12px 24px",
        borderRadius: "8px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
        zIndex: 1000,
        fontFamily: "Nunito, sans-serif",
        fontSize: "14px",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        transition: "all 0.2s ease-in-out",
      }}
    >
      <span>{currentConfig.icon} {message}</span> {/* Dynamic icon */}
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "16px",
          opacity: 0.8,
        }}
      >
        ×
      </button>
    </div>
  );
}