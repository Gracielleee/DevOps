import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Sidebar from "../components/Sidebar";
import useSubjects from "../hooks/useSubjects";
import apiFetch from "../utils/apiFetch";
import Layout from "../components/ResponsiveLayout";

export default function MaterialsPage({
  authHeader,
  onLogout,
  setGlobalError,
}) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const { subjectsList, loadingSubjects } = useSubjects();

  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  const [formData, setFormData] = useState({
    subject: "",
    id: null,
    title: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // READ:
  const fetchMaterials = async () => {
    if (!authHeader) return;
    setLoadingMaterials(true);
    try {
      const endpoint = subject ? `materials?subject=${subject}` : "materials";
      const response = await apiFetch(endpoint, {
        headers: { Authorization: authHeader },
        redirectOnAuthError: true,
      });

      if (response && response.data) {
        setMaterials(response.data);
      } else if (Array.isArray(response)) {
        setMaterials(response);
      }
    } catch (error) {
      console.error("Failed to pull materials database records:", error);
      if (setGlobalError)
        setGlobalError("Failed to pull materials database records.");
    } finally {
      setLoadingMaterials(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [authHeader, subject]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // CREATE & UPDATE:
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !subject) {
      if (setGlobalError)
        setGlobalError(
          "Please ensure all parameters and subject spaces are set.",
        );
      return;
    }

    try {
      if (isEditing) {
        const updatedData = await apiFetch(`materials/${formData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({
            topic: formData.title,
            content: formData.description,
            subject: subject,
          }),
          redirectOnAuthError: true,
        });

        if (updatedData) {
          fetchMaterials();
          setIsEditing(false);
        }
      } else {
        const createdData = await apiFetch("materials", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({
            topic: formData.title,
            content: formData.description,
            subject: subject,
          }),
          redirectOnAuthError: true,
        });

        if (createdData) {
          fetchMaterials();
        }
      }

      setFormData({ id: null, title: "", description: "" });
    } catch (error) {
      console.error("Failed to commit materials mutation action:", error);
      if (setGlobalError) setGlobalError("Failed to save material entry.");
    }
  };

  const handleEditSelect = (item) => {
    setFormData({
      id: item.id || item._id,
      title: item.topic,
      description: item.content,
    });
    if (item.subject) {
      setSubject(item.subject.id || item.subject._id || item.subject);
    }
    setIsEditing(true);
  };

  // DELETE: Strip asset out from live system
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this resource asset?"))
      return;

    try {
      await apiFetch(`materials/${id}`, {
        method: "DELETE",
        headers: { Authorization: authHeader },
        redirectOnAuthError: true,
      });

      setMaterials((prev) =>
        prev.filter((item) => (item.id || item._id) !== id),
      );

      if (formData.id === id) {
        setIsEditing(false);
        setFormData({ id: null, title: "", description: "" });
      }
    } catch (error) {
      console.error(
        "Failed executing target database deletion sequence:",
        error,
      );
      if (setGlobalError)
        setGlobalError("Failed executing deletion layout task.");
    }
  };

  // Inner layout markup shared between Guest and Auth views
  const renderMainContent = () => (
    <div style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
      <header
        style={{
          marginBottom: "30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 5px 0", color: "#0f172a" }}>
            📚 Learning Materials Repositories
          </h1>
          <p style={{ margin: 0, color: "#64748b" }}>
            Manage course files and curriculum notes.
          </p>
        </div>
      </header>

      {!authHeader ? (
        <div
          className="auth-fallback"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
            border: "1px solid #e2e8f0",
            marginTop: "20px",
          }}
        >
          <h4
            style={{
              margin: 0,
              color: "#1e293b",
              fontSize: "18px",
              textAlign: "center",
            }}
          >
            🔒 Please log in to save and manage your learning materials
            preferences.
          </h4>
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
      ) : (
        <div className="materials-grid">
          {/* CRUD FORM AREA */}
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                color: "#1e293b",
                borderBottom: "2px solid #f1f5f9",
                paddingBottom: "10px",
              }}
            >
              {isEditing ? "✏️ Modify Material" : "➕ Create Material Entry"}
            </h3>
            <form onSubmit={handleSave}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: "16px",
                }}
              >
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#475569",
                    marginBottom: "6px",
                  }}
                >
                  Subject Area
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
                    <option key={sub.id || sub._id} value={sub.id || sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>

                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#475569",
                    marginTop: "16px",
                    marginBottom: "6px",
                  }}
                >
                  Document Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  style={{
                    padding: "10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "15px",
                    outline: "none",
                  }}
                  placeholder="e.g., Week 3 container tuning specs"
                  required
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: "20px",
                }}
              >
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#475569",
                    marginBottom: "6px",
                  }}
                >
                  Content Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  style={{
                    padding: "10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    fontSize: "15px",
                    fontFamily: "inherit",
                    resize: "vertical",
                    outline: "none",
                  }}
                  placeholder="Provide summary context logs here..."
                  required
                ></textarea>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  style={{
                    flexGrow: 1,
                    padding: "10px",
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {isEditing ? "Update Document" : "Commit Entry"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ id: null, title: "", description: "" });
                    }}
                    style={{
                      padding: "10px",
                      background: "#94a3b8",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* CRUD CONTENT RENDER LIST */}
          <div>
            <h3 style={{ margin: "20px 0 16px 0", color: "#1e293b" }}>
              Learning Materials ({materials.length})
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {loadingMaterials ? (
                <p style={{ color: "#64748b", textAlign: "center" }}>
                  Loading resources network logs...
                </p>
              ) : materials.length === 0 ? (
                <p style={{ color: "#64748b", textAlign: "center" }}>
                  No repository materials matching criteria.
                </p>
              ) : (
                materials.map((item) => {
                  const itemId = item.id || item._id;
                  return (
                    <div
                      key={itemId}
                      style={{
                        backgroundColor: "white",
                        padding: "20px",
                        borderRadius: "12px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 8px 0",
                          color: "#1e293b",
                          fontSize: "17px",
                        }}
                      >
                        {item.topic}
                      </h4>
                      <p
                        style={{
                          margin: "0 0 16px 0",
                          color: "#475569",
                          fontSize: "14px",
                          lineHeight: "1.5",
                        }}
                      >
                        {item.content}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          onClick={() => handleEditSelect(item)}
                          style={{
                            padding: "6px 12px",
                            border: "none",
                            borderRadius: "4px",
                            background: "#eff6ff",
                            color: "#2563eb",
                            fontWeight: "bold",
                            cursor: "pointer",
                            fontSize: "13px",
                          }}
                        >
                          Modify
                        </button>
                        <button
                          onClick={() => handleDelete(itemId)}
                          style={{
                            padding: "6px 12px",
                            border: "none",
                            borderRadius: "4px",
                            background: "#fef2f2",
                            color: "#dc2626",
                            fontWeight: "bold",
                            cursor: "pointer",
                            fontSize: "13px",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Layout authHeader={authHeader} onLogout={onLogout}>
      {/* 📚 Everything inside here automatically becomes the "children" prop! */}
      <div className="materials-grid">{renderMainContent()}</div>
    </Layout>
  );
}
