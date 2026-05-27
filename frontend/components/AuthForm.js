import { useState } from "react";
import { useRouter } from "next/router";
import Toast from "./Toast";

export default function AuthPage({ mode, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const LOGIN_ENDPOINT = `${API_BASE_URL}login`;
  const REGISTER_ENDPOINT = `${API_BASE_URL}register`;

  const handleSubmit = (e) => {
    e.preventDefault();
    setToastMsg("");

    if (mode === "login") {
      login();
    } else {
      register();
    }
  };

  async function login() {
    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong during login");
      }

      console.log("Login successful! Token payload:", data.token);
      setToastMsg("Login successful! Redirecting to chat page...");

      onLoginSuccess(data.token);

      setTimeout(() => {
        router.push("/"); 
      }, 2000);

    } catch (error) {
      console.error("Login failed:", error.message);
      setToastMsg(error.message);
    }
    
  };

  async function register() {
    try {

      const response = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong during registration");
      }

      console.log("Registration successful! User email:", data.email);
      setToastMsg("Registration successful! Please log in.");
      
      setTimeout(() => {
        router.push("/login"); 
      }, 2000); //

    } catch (error) {
      console.error("Registration failed:", error.message);
      setToastMsg(error.message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#0f172a",
        fontFamily: "Nunito, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2
          style={{ margin: "0 0 6px 0", color: "#1e293b", textAlign: "center" }}
        >
          {mode === "login" ? "Welcome Back!" : "Get Started"}
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            margin: "0 0 28px 0",
            fontSize: "14px",
          }}
        >
          BrainBytes Cognitive Architecture Platform
        </p>

        <form onSubmit={handleSubmit}>
          { mode==="register" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "16px",
              }}
            >
              <label
                style={{
                  marginBottom: "6px",
                  fontWeight: "bold",
                  color: "#334155",
                  fontSize: "13px",
                }}
              >
                Username
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  padding: "10px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "15px",
                  outline: "none",
                }}
                required
              />
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: "16px",
            }}
          >
            <label
              style={{
                marginBottom: "6px",
                fontWeight: "bold",
                color: "#334155",
                fontSize: "13px",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "10px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "15px",
                outline: "none",
              }}
              required
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: "24px",
            }}
          >
            <label
              style={{
                marginBottom: "6px",
                fontWeight: "bold",
                color: "#334155",
                fontSize: "13px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "10px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "15px",
                outline: "none",
              }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
          >
            {mode === "login" ? "Sign In" : "Register Account"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontSize: "14px",
            color: "#64748b",
          }}
        >
          {mode === "login" ? "New to BrainBytes? " : "Already registered? "}
          <span
            onClick={() => {
              router.push(mode === "login" ? "/register" : "/login");
            }}
            style={{
              color: "#2563eb",
              cursor: "pointer",
              fontWeight: "bold",
              textDecoration: "underline",
            }}
          >
            {mode === "login" ? "Create account" : "Sign in instead"}
          </span>
        </p>
      </div>
      {toastMsg && (
        <Toast message={toastMsg} onClose={() => setToastMsg("")} />
      )}
    </div>
  );
}
