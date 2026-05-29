import '../styles/globals.css';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';
import { useState, useEffect } from 'react';
import Toast from '../components/Toast'; // Uses your repo's exact Toast component

export default function App({ Component, pageProps }) {
  const [authHeader, setAuthHeader] = useState(null);
  const [globalError, setGlobalError] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token"); 
    if (storedToken) {
      setAuthHeader(`Bearer ${storedToken}`);
    }
  }, []);

  const handleLoginSuccess = (rawToken) => {
    localStorage.setItem("token", rawToken);
    setAuthHeader(`Bearer ${rawToken}`); 
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthHeader(null);
  };

  const triggerGlobalError = (msg) => {
    setGlobalError(msg);
  };

  return (
    <>
      {/* Global Toast listening to state changes */}
      {globalError && (
        <Toast 
          message={globalError} 
          type="error" 
          onClose={() => setGlobalError("")} 
        />
      )}
      
      <Component 
        {...pageProps} 
        authHeader={authHeader} 
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        setGlobalError={triggerGlobalError}
      />
    </>
  );
}