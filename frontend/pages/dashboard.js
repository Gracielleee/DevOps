import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import AuthPage from "../components/AuthForm";
import Sidebar from "../components/Sidebar";

export default function Dashboard({ authHeader, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const data = await response.json();
      setMessages(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [authHeader]);


  // LAYOUT

  // If guest user, show login prompt in dashboard
  if (!authHeader) {
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
        <Sidebar authHeader={authHeader} onLogout={onLogout} />

        {/* ================= MAIN DISPLAY CONTENT VIEWPORT ================= */}
        <main style={{ flexGrow: 1, overflowY: "auto", padding: "40px" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <header style={{ marginBottom: "30px" }}>
              <h1 style={{ margin: "0 0 5px 0", color: "#0f172a" }}>
                Welcome Back!
              </h1>
              <p style={{ margin: 0, color: "#64748b" }}>
                Here is a summary of your recent interactions with the BrainBytes AI Tutor.
              </p>
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
              <div className="auth-fallback"
                style={{
                  display: "flex",            
                  flexDirection: "column",
                  justifyContent: "center",  
                  alignItems: "center",       
                  flexGrow: 1,          
                  padding: "10px"}}>
                <h4>No activity found. Please log in to save your progress</h4>
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
            </div>
          </div>
        </main>
      </div>
    );
  }


// If authenticated user, show dashboard
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
      <Sidebar authHeader={authHeader} onLogout={onLogout} />

      {/* ================= MAIN DISPLAY CONTENT VIEWPORT ================= */}
      <main style={{ flexGrow: 1, overflowY: "auto", padding: "40px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <header style={{ marginBottom: "30px" }}>
            <h1 style={{ margin: "0 0 5px 0", color: "#0f172a" }}>
              Welcome Back!
            </h1>
            <p style={{ margin: 0, color: "#64748b" }}>
              Here is a summary of your recent interactions with the BrainBytes AI Tutor.
            </p>
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

            {loading ? (
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
                    No activity found yet. Ask BrainBytes AI a question to see
                    it here!
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

                    <ul
                      style={{ listStyleType: "none", padding: 0, margin: 0 }}
                    >
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
                            <div
                              style={{
                                fontSize: "15px",
                                color: "#334155",
                                marginBottom: "8px",
                                lineHeight: "1.5",
                              }}
                            >
                              <strong>Question prompt passed:</strong>{" "}
                              {msg.text}
                            </div>
                            <small
                              style={{
                                color: "#94a3b8",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              📅 {new Date(msg.createdAt).toLocaleDateString()}{" "}
                              at {new Date(msg.createdAt).toLocaleTimeString()}
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
    </div>
  );
}
