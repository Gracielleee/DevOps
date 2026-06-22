import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children, authHeader, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        fontFamily: "Nunito, sans-serif",
        backgroundColor: "#f4f6f8",
        position: "relative",
      }}
    >
      {/* Mobile Hamburger Trigger */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          position: "absolute",
          top: "15px",
          left: "15px",
          zIndex: 110,
          flexDirection: "column",
          justifyContent: "space-around",
          width: "35px",
          height: "30px",
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: "6px",
          cursor: "pointer",
          padding: "6px",
          display: "none", // Managed by global media queries below
        }}
        className="mobile-hamburger-trigger"
      >
        <div style={{ width: "100%", height: "2px", backgroundColor: "#333" }}></div>
        <div style={{ width: "100%", height: "2px", backgroundColor: "#333" }}></div>
        <div style={{ width: "100%", height: "2px", backgroundColor: "#333" }}></div>
      </button>

      {/* Sidebar Responsive */}
      <div
        className={`sidebar-wrapper-panel ${isMobileMenuOpen ? "drawer-open" : ""}`}
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <Sidebar authHeader={authHeader} onLogout={onLogout} />
        {!authHeader && (
          <div
            style={{
              padding: "12px",
              backgroundColor: "#fff3cd",
              color: "#856404",
              fontSize: "12px",
              borderTop: "1px solid #ffeeba",
              textAlign: "center",
            }}
          >
            🔒 Login to save user preferences.
          </div>
        )}
      </div>

      {/* Backdrop overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 95,
          }}
        />
      )}

      {/* Main Content Area */}
      <main
        style={{ flexGrow: 1, overflowY: "auto", padding: "40px" }}
        className="main-viewport-layout"
      >
        {children}
      </main>

      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-hamburger-trigger {
            display: flex !important;
          }
          .sidebar-wrapper-panel {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            height: 100vh !important;
            transform: translateX(-100%) !important;
            transition: transform 0.3s ease-in-out !important;
            z-index: 100 !important;
          }
          .sidebar-wrapper-panel.drawer-open {
            transform: translateX(0) !important;
          }
          .main-viewport-layout {
            padding: 70px 15px 15px 15px !important;
          }
        }
      `}</style>
    </div>
  );
}