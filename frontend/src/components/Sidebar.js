import Link from "next/link";
import { useRouter } from "next/router";

export default function Sidebar({ authHeader, onLogout }) {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <aside
      style={{
        width: "260px",
        height: "100%",
        backgroundColor: "#1e293b",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        boxShadow: "2px 0 5px rgba(0,0,0,0.05)",
        flexShrink: 0,
      }}
    >
      <div style={{ marginBottom: "40px", paddingLeft: "8px" }}>
        <h2
          style={{
            margin: 0,
            marginTop: "20px",
            fontSize: "22px",
            color: "#fff",
            letterSpacing: "0.5px",
          }}
        >
          🧠 BrainBytes
        </h2>
        <span
          style={{
            fontSize: "11px",
            color: "#94a3b8",
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        >
          DevOps Platform
        </span>
      </div>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flexGrow: 1,
        }}
      >
        <Link
          href="/"
          style={{
            color: "#cbd5e1",
            backgroundColor:
              currentPath === "/" ? "#334155" : "transparent",
            fontWeight: currentPath === "/" ? "bold" : "normal",
            textDecoration: "none",
            padding: "12px 16px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          💬 AI Chat Client
        </Link>

        <Link
          href="/dashboard"
          style={{
            color: "#cbd5e1",
            backgroundColor:
              currentPath === "/dashboard" ? "#334155" : "transparent",
            fontWeight: currentPath === "/dashboard" ? "bold" : "normal",
            textDecoration: "none",
            padding: "12px 16px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          📊 Learning Dashboard
        </Link>

        <Link
          href="/materials"
          style={{
            color: "#cbd5e1",
            backgroundColor:
              currentPath === "/materials" ? "#334155" : "transparent",
            fontWeight: currentPath === "/materials" ? "bold" : "normal",
            textDecoration: "none",
            padding: "12px 16px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          📚 Learning Materials
        </Link>

        <Link
          href="/profile"
          style={{
            color: "#cbd5e1",
            backgroundColor:
              currentPath === "/profile" ? "#334155" : "transparent",
            fontWeight: currentPath === "/profile" ? "bold" : "normal",
            textDecoration: "none",
            padding: "12px 16px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          👤 My Profile
        </Link>
      </nav>

      <div style={{ borderTop: "1px solid #334155", paddingTop: "16px" }}>
        {authHeader ? (
          <button
            onClick={onLogout}
            style={{
              width: "100%",
              backgroundColor: "transparent",
              color: "#f87171",
              padding: "12px 16px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              border: "1px solid #f87171",
              justifyContent: "center",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🚪 Log Out
          </button>
        ) : (
          <Link
            href="/login"
            style={{
              color: "#38bdf8",
              textDecoration: "none",
              padding: "12px 16px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              border: "1px solid #38bdf8",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            🔑 Log In
          </Link>
        )}
      </div>
    </aside>
  );
}
