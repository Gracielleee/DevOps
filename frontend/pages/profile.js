import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import useSubjects from "../hooks/useSubjects";
import apiFetch from "../utils/apiFetch";

export default function Profile({ authHeader, onLogout }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { subjectsList, loadingSubjects } = useSubjects();

  const fetchProfile = async () => {
    if (!authHeader) return;
    try {
      const data = await apiFetch("profile", {
        headers: { Authorization: authHeader },
        redirectOnAuthError: true,
      });

      if (data) {
        setName(data.data.name || "");
        setEmail(data.data.email || "");
        if (data.data.preferredSubject) {
          setSubject(data.data.preferredSubject.id || data.data.preferredSubject);
        }
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [authHeader]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!authHeader) return;
    try {
      const data = await apiFetch("profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: authHeader },
        body: JSON.stringify({ name, email, preferredSubject: subject }),
        redirectOnAuthError: true,
      });
      if (data) {
        setName(data.name || "");
        setEmail(data.email || "");
        if (data.preferredSubject) {
          setSubject(data.preferredSubject.id || data.preferredSubject);
        }
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile data:", error);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", fontFamily: "Nunito, sans-serif", backgroundColor: "#f4f6f8", position: "relative" }}>
      
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
          display: "none"
        }}
        className="mobile-hamburger-trigger"
      >
        <div style={{ width: "100%", height: "2px", backgroundColor: "#333" }}></div>
        <div style={{ width: "100%", height: "2px", backgroundColor: "#333" }}></div>
        <div style={{ width: "100%", height: "2px", backgroundColor: "#333" }}></div>
      </button>

      {/* Sidebar Responsive Shell */}
      <div className={`sidebar-wrapper-panel ${isMobileMenuOpen ? "drawer-open" : ""}`} style={{ display: "flex", flexDirection: "column" }}>
        <Sidebar authHeader={authHeader} onLogout={onLogout}/>
        {!authHeader && (
          <div style={{ padding: "12px", backgroundColor: "#fff3cd", color: "#856404", fontSize: "12px", borderTop: "1px solid #ffeeba", textAlign: "center" }}>
            🔒 Login to save user preferences.
          </div>
        )}
      </div>

      {/* Backdrop overlay */}
      {isMobileMenuOpen && (
        <div onClick={() => setIsMobileMenuOpen(false)} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.4)", zIndex: 95 }} />
      )}

      <main style={{ flexGrow: 1, overflowY: "auto", padding: "40px" }} className="main-viewport-layout">
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h1 style={{ color: "#0f172a", margin: "0 0 24px 0" }}>👤 User Profile</h1>

          {/* Notice Banner displayed if unauthenticated */}
          {!authHeader && (
            <div style={{ backgroundColor: "#f8d7da", color: "#721c24", padding: "16px 20px", borderRadius: "12px", border: "1px solid #f5c6cb", marginBottom: "24px", fontSize: "15px", fontWeight: "500" }}>
              🔒 <strong>Notice:</strong> Login to save user preferences & workspace changes.
            </div>
          )}

          <form onSubmit={handleSave} style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "30px", backgroundColor: "white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            {saveSuccess && (
              <div style={{ backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: "bold", textAlign: "center" }}>
                🎉 Profile saved successfully!
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#334155" }}>Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={!authHeader} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: !authHeader ? "#f1f5f9" : "#fff" }} required={!!authHeader} />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#334155" }}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!authHeader} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: !authHeader ? "#f1f5f9" : "#fff" }} required={!!authHeader} />
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#334155" }}>Preferred Subject</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} disabled={loadingSubjects || !authHeader} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: !authHeader ? "#f1f5f9" : "white" }} required={!!authHeader}>
                <option value="" disabled>{loadingSubjects ? "Loading subjects..." : "-- Select a Subject --"}</option>
                {subjectsList.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
              </select>
            </div>

            <button type="submit" disabled={!authHeader} style={{ width: "100%", padding: "14px", backgroundColor: !authHeader ? "#94a3b8" : "#2196f3", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: !authHeader ? "not-allowed" : "pointer" }}>
              {!authHeader ? "Login to Update Settings" : "Save Profile"}
            </button>
          </form>
        </div>
      </main>

      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-hamburger-trigger { display: flex !important; }
          .sidebar-wrapper-panel {
            position: fixed !important; top: 0 !important; left: 0 !important; height: 100vh !important;
            transform: translateX(-100%) !important; transition: transform 0.3s ease-in-out !important; z-index: 100 !important;
          }
          .sidebar-wrapper-panel.drawer-open { transform: translateX(0) !important; }
          .main-viewport-layout { padding: 70px 15px 15px 15px !important; }
        }
      `}</style>
    </div>
  );
}