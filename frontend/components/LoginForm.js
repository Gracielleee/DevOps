export default function LoginForm({ onLogin, error }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      onLogin(null, "Please enter both username and password.");
      return;
    }
    onLogin({ username: username.trim(), password: password.trim() });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f7fb",
        padding: "24px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#fff",
          padding: "28px",
          borderRadius: "16px",
          boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{ marginBottom: "20px", textAlign: "center", color: "#222" }}
        >
          Login to BrainBytes AI Tutor
        </h2>
        <label
          style={{ display: "block", marginBottom: "12px", color: "#444" }}
        >
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              marginTop: "6px",
              borderRadius: "10px",
              border: "1px solid #ccc",
            }}
          />
        </label>
        <label
          style={{ display: "block", marginBottom: "18px", color: "#444" }}
        >
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              marginTop: "6px",
              borderRadius: "10px",
              border: "1px solid #ccc",
            }}
          />
        </label>
        {error && (
          <div style={{ marginBottom: "16px", color: "#d32f2f" }}>{error}</div>
        )}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
