import '../styles/globals.css';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { setSessionExpiredHandler } from '../utils/apiFetch';

export default function App({ Component, pageProps }) {
  const [authHeader, setAuthHeader] = useState(null);
  const router = useRouter();

  const handleSessionExpired = useCallback(() => {
    localStorage.removeItem("token");
    setAuthHeader(null);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    setSessionExpiredHandler(handleSessionExpired);
  }, [handleSessionExpired]);

  // On initial load, grab the raw token out of local storage
  useEffect(() => {
    const storedToken = localStorage.getItem("token"); 
    if (storedToken) {
      setAuthHeader(`Bearer ${storedToken}`);
    }
  }, []);

  // Custom function passed down to children to trigger state changes upon active login
  const handleLoginSuccess = (rawToken) => {
    localStorage.setItem("token", rawToken);
    setAuthHeader(`Bearer ${rawToken}`); 
  };

  //Custom function to handle user sign out
  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthHeader(null);
  };
  
  // Pass down the authHeader state and control handlers to every route page view
  return (
    <Component 
      {...pageProps} 
      authHeader={authHeader} 
      onLoginSuccess={handleLoginSuccess}
      onLogout={handleLogout}
    />
  );
}