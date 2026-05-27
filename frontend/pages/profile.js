import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import useSubjects from "../hooks/useSubjects";
import apiFetch from "../utils/apiFetch";

export default function Profile({ authHeader, onLogout }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false); // Track save feedback

  const { subjectsList, loadingSubjects } = useSubjects();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const PROFILE_ENDPOINT = `${API_BASE_URL}profile`;

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
          setSubject(
            data.data.preferredSubject.id || data.data.preferredSubject,
          );
        }
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [authHeader]);

  const handleSave = async () => {
    if (!authHeader) return;
      try {
        const data = await apiFetch("profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
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

        // Hide the success message after 3 seconds automatically
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } catch (error) {
        console.error("Error saving profile data:", error);
      }
  };

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
      <Sidebar authHeader={authHeader} onLogout={onLogout}/>

      {/* ================= MAIN DISPLAY CONTENT VIEWPORT ================= */}
      <main style={{ flexGrow: 1, overflowY: "auto", padding: "40px" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h1 style={{ color: "#0f172a", margin: "0 0 24px 0" }}>
            👤 User Profile
          </h1>

          <form
            onSubmit={handleSave}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "30px",
              backgroundColor: "white",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            }}
          >
            {/* Success Notification Alert */}
            {saveSuccess && (
              <div
                style={{
                  backgroundColor: "#ecfdf5",
                  color: "#047857",
                  border: "1px solid #a7f3d0",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  fontWeight: "bold",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                🎉 Profile saved successfully!
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                  color: "#334155",
                }}
              >
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  outline: "none",
                  fontSize: "15px",
                }}
                required
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                  color: "#334155",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  outline: "none",
                  fontSize: "15px",
                }}
                required
              />
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                  color: "#334155",
                }}
              >
                Preferred Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={loadingSubjects}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "white",
                }}
                required
              >
                <option value="" disabled>
                  {loadingSubjects
                    ? "Loading subjects..."
                    : "-- Select a Subject --"}
                </option>
                {subjectsList.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}{" "}
                    {/* Shows name string in UI, but holds id string as value */}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#2196f3",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
            >
              Save Profile
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
