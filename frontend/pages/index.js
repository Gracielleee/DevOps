import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import Link from "next/link";

import LoginForm from "../components/LoginForm";
import Sidebar from "../components/Sidebar";
import formatMath from "../utils/formatMath";
import apiFetch from "../utils/apiFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home({ authHeader, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("General");
  const messageEndRef = useRef(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const API_ENDPOINT = `${API_BASE_URL}messages/`;

  // Fetch Messages function with support for anonymous users (no auth header)
  const fetchMessages = async () => {
    // Load empty array if no auth header is found
    if (!authHeader) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch(API_ENDPOINT, {
        headers: {
          Authorization: authHeader,
        },
        redirectOnAuthError: true,
      });

      if (data) {
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
    {
      setLoading(false);
    }
  };

  // Handle submit function with support for anonymous users (no auth header)
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

      // Prepend user's message to the chat immediately for instant UI feedback
      setMessages((prev) => [tempUserMsg, ...prev]);

      const requestHeaders = {};
      if (authHeader) {
        requestHeaders["Authorization"] = authHeader;
      }

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

        // Remove the temporary message and slot in the clean server ones
        setMessages((prev) => {
          const filtered = prev.filter((msg) => msg._id !== tempUserMsg._id);
          return [finalAiMsg, finalUserMsg, ...filtered];
        });
      }
    } catch (error) {
      console.error("Error posting message:", error);

      setMessages((prev) => {
        return [
          {
            _id: Date.now().toString() + "-error",
            text: "Sorry, I couldn't process your request. Please try again later.",
            isUser: false,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ];
      });
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

      <main
        style={{
          flex: "1",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          overflow: "hidden",
        }}
      >
        <h1 style={{ textAlign: "center", color: "#333" }}>
          BrainBytes AI Tutor
        </h1>

        {/* Show guest user heads up if no auth header is present */}
        {!authHeader && (
          <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>  You are using our service as a Guest user. Please log in to save your conversation history. All chats on guest mode are not saved on our server.</p>
        )}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            flex: "1",
            overflowY: "auto",
            padding: "16px",
            marginBottom: "20px",
            backgroundColor: "#f9f9f9",
          }}
        >
          {loading ? (
            <p>Loading conversation history...</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {/* Copy and reverse the array to put oldest at the top, newest at the bottom */}
              {[...messages].reverse().map((message) => (
                <li
                  key={message._id || message.id}
                  style={{
                    marginBottom: "10px",
                    padding: "10px",
                    borderRadius: "8px",
                    backgroundColor: message.isUser ? "#d1e7dd" : "#fff",
                  }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
                    rehypePlugins={[rehypeKatex, rehypeHighlight]}
                  >
                    {formatMath(message.text)}
                  </ReactMarkdown>
                </li>
              ))}
              <div ref={messageEndRef} />
            </ul>
          )}
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask a question..."
            style={{
              flex: "1",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          />
          <button
            type="submit"
            disabled={isTyping}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              backgroundColor: "#2563eb",
              color: "#fff",
              border: "none",
            }}
          >
            {isTyping ? "Sending..." : "Send"}
          </button>
        </form>
      </main>
    </div>
  );
}
