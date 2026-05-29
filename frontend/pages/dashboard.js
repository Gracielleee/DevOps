import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import AuthPage from "../components/AuthForm";
import Sidebar from "../components/Sidebar";

export default function Dashboard({ authHeader, onLogout, setGlobalError }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_ENDPOINT = `${API_BASE_URL}messages/`;

  const fetchMessages = async () => {
    if (!authHeader) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(API_ENDPOINT, {
        headers: { Authorization: authHeader },
      });
      if (!response.ok) throw new Error("Server communication fault");
      const data = await response.json();
      setMessages(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (setGlobalError) setGlobalError("Failed to safely access live activity logs.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [authHeader]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        fontFamily: "Nunito, sans-serif",
        backgroundColor: "#f4f6f8",
      }}
    >
      {/* Mobile Drawer Backdrop Mask */}
      {isMobileMenuOpen && (
        <div 
          className="drawer-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Slide-out Sidebar Layout Element */}
      <div className={`sidebar-wrapper ${isMobileMenuOpen ? "drawer-open" : ""}`}>
        <Sidebar authHeader={authHeader} onLogout={onLogout} />
      </div>

      {/* ================= MAIN DISPLAY CONTENT VIEWPORT ================= */}
      <main style={{ flexGrow: 1, overflowY: "auto", padding: "40px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <header style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ margin: "0 0 5px 0", color: "#0f172a" }}>
                Welcome Back!
              </h1>
              <p style={{ margin: 0, color: "#64748b" }}>
                Here is a summary of your recent interactions with the BrainBytes AI Tutor.
              </p>
            </div>
            <button 
              className="hamburger-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              ☰
            </button>
          </header>

          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "28px",
              backgroundColor: "white",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            }}
          >
            <h3
              style={{
                borderBottom: "2px solid #2196f3",
                paddingBottom: "12px",
                marginTop: 0,
                color: "#1e293b",
              }}
            >
              Recent Learning Activity Logs
            </h3>

            {!authHeader ? (
              /* If guest user, show login prompt in dashboard */
              <div 
                className="auth-fallback"
                style={{
                  display: "flex",         
                  flexDirection: "column",
                  justifyContent: "center",  
                  alignItems: "center",      
                  flexGrow: 1,          
                  padding: "10px"
                }}
              >
                <h4 style={{ textAlign: "center" }}>🔒 No activity found. Please log in to save your learning metrics and progress.</h4>
                <button
                  onClick={() => router.push("/login")}
                  style={{
                    marginTop: "20px",
                    backgroundColor: "#2196f3",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Go to Login
                </button>
              </div>
            ) : loading ? (
              <p
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#64748b",
                }}
              >
                Loading your telemetry runtime data...
              </p>
            ) : (
              <div style={{ marginTop: "20px" }}>
                {messages.length === 0 ? (
                  <p
                    style={{
                      color: "#64748b",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    No activity found yet. Ask BrainBytes AI a question to see it here!
                  </p>
                ) : (
                  <div>
                    <div
                      style={{
                        display: "inline-block",
                        backgroundColor: "#eff6ff",
                        color: "#1e40af",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        marginBottom: "20px",
                      }}
                    >
                      📈 Total Q&A Sets Saved: {Math.floor(messages.length / 2)}
                    </div>

                    <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                      {messages
                        .filter((m) => m.isUser)
                        .slice(-5)
                        .reverse()
                        .map((msg) => (
                          <li
                            key={msg._id}
                            style={{
                              padding: "16px",
                              margin: "12px 0",
                              backgroundColor: "#f8fafc",
                              borderRadius: "8px",
                              borderLeft: "5px solid #2196f3",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                            }}
                          >
                            <div style={{ fontSize: "15px", color: "#334155", marginBottom: "8px", lineHeight: "1.5" }}>
                              <strong>Question prompt passed:</strong> {msg.text}
                            </div>
                            <small style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                              📅 {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString()}
                            </small>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .sidebar-wrapper {
          display: block;
          height: 100%;
        }
        .hamburger-btn {
          display: none;
          font-size: 24px;
          background: none;
          border: none;
          color: #0f172a;
          cursor: pointer;
          padding: 8px;
        }
        @media (max-width: 768px) {
          .hamburger-btn {
            display: block;
          }
          .sidebar-wrapper {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 999;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .sidebar-wrapper.drawer-open {
            transform: translateX(0);
          }
          .drawer-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(2px);
            z-index: 998;
          }
        }
      `}</style>
    </div>
  );
}