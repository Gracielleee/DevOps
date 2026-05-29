import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // 🔥 FIXED: Added missing code block syntax highlighting theme style sheet

import Sidebar from "../components/Sidebar";
import formatMath from "../utils/formatMath";
import apiFetch from "../utils/apiFetch";

export default function Home({ authHeader, onLogout, setGlobalError }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messageEndRef = useRef(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_ENDPOINT = `${API_BASE_URL}messages/`;

  const fetchMessages = async () => {
    if (!authHeader) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch(API_ENDPOINT, {
        headers: { Authorization: authHeader },
        redirectOnAuthError: true,
      });

      if (data) setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (setGlobalError) setGlobalError("Failed to load conversation history.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempUserMsg = {
      _id: Date.now().toString(),
      text: newMessage,
      isUser: true,
      createdAt: new Date().toISOString(),
    };

    try {
      setIsTyping(true);
      const userMsg = newMessage;
      setNewMessage("");

      setMessages((prev) => [tempUserMsg, ...prev]);

      const requestHeaders = {};
      if (authHeader) requestHeaders["Authorization"] = authHeader;

      const responseData = await apiFetch(API_ENDPOINT, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({ text: userMsg }),
      });

      if (responseData) {
        const finalUserMsg = {
          _id: Date.now().toString() + "-user",
          text: responseData.content,
          isUser: true,
          createdAt: new Date().toISOString(),
        };

        const finalAiMsg = {
          _id: Date.now().toString() + "-ai",
          text: responseData.aiMessage,
          isUser: false,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => {
          const filtered = prev.filter((msg) => msg._id !== tempUserMsg._id);
          return [finalAiMsg, finalUserMsg, ...filtered];
        });
      }
    } catch (error) {
      console.error("Error posting message:", error);
      if (setGlobalError) setGlobalError("Unable to reach server. Please check your network.");
      setMessages((prev) => prev.filter((msg) => msg._id !== tempUserMsg._id));
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [authHeader]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      {/* Sidebar Responsive Container */}
      <div className={`sidebar-wrapper-panel ${isMobileMenuOpen ? "drawer-open" : ""}`} style={{ display: "flex", flexDirection: "column" }}>
        <Sidebar authHeader={authHeader} onLogout={onLogout} />
        {!authHeader && (
          <div style={{ padding: "12px", backgroundColor: "#fff3cd", color: "#856404", fontSize: "12px", borderTop: "1px solid #ffeeba", textAlign: "center" }}>
            🔒 Login to save user preferences.
          </div>
        )}
      </div>

      {/* Overlay backdrop dimmer */}
      {isMobileMenuOpen && (
        <div onClick={() => setIsMobileMenuOpen(false)} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.4)", zIndex: 95 }} />
      )}

      <main style={{ flex: "1", display: "flex", flexDirection: "column", padding: "20px", overflow: "hidden" }} className="main-viewport-layout">
        <h1 style={{ textAlign: "center", color: "#333" }}>BrainBytes AI Tutor</h1>

        {!authHeader && (
          <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
            You are using our service as a Guest user. Please log in to save your conversation history. All chats on guest mode are not saved on our server.
          </p>
        )}

        <div style={{ border: "1px solid #ddd", borderRadius: "12px", flex: "1", overflowY: "auto", padding: "16px", marginBottom: "20px", backgroundColor: "#f9f9f9" }}>
          {loading ? (
            <p>Loading conversation history...</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column-reverse", gap: "12px" }}>
              <div ref={messageEndRef} />
              {[...messages].reverse().map((message) => {
                const isUserMsg = message.isUser;
                return (
                  <div key={message._id || message.id} style={{ display: "flex", justifyContent: isUserMsg ? "flex-end" : "flex-start", width: "100%" }}>
                    {/* Chat bubbles restricted to 85% width */}
                    <div style={{
                      maxWidth: "85%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      backgroundColor: isUserMsg ? "#d1e7dd" : "#fff",
                      color: "#212529",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      wordBreak: "break-word"
                    }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} rehypePlugins={[rehypeKatex, rehypeHighlight]}>
                        {formatMath(message.text)}
                      </ReactMarkdown>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px" }}>
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Ask a question..." style={{ flex: "1", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }} />
          <button type="submit" disabled={isTyping} style={{ padding: "12px 24px", borderRadius: "8px", backgroundColor: "#2563eb", color: "#fff", border: "none" }}>
            {isTyping ? "Sending..." : "Send"}
          </button>
        </form>
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