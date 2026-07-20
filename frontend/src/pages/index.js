import Head from 'next/head';
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";

import Layout from "../components/ResponsiveLayout";
import useSubjects from "../hooks/useSubjects";
import formatMath from "../utils/formatMath";
import apiFetch from "../utils/apiFetch";
import log from "../utils/logger";
import { parseApiError } from "../utils/errorParser";

// Create a targeted tracker for this specific file
const logger = log.getLogger("ChatContainer");

export default function Home({ authHeader, onLogout, setGlobalError }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const { subjectsList, loadingSubjects } = useSubjects();
  const messageEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const shouldScrollToBottomRef = useRef(false);

  const MESSAGES_PAGE_SIZE = 20;

  // Fetch Messages function with support for anonymous users (no auth header)
  const fetchMessages = async (page = 1, append = false) => {
    if (!authHeader) {
      logger.debug("Anonymous user: skipping fetchMessages");
      setMessages([]);
      setHasNextPage(false);
      setCurrentPage(1);
      setLoading(false);
      return;
    }

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      logger.debug(`Fetching messages page=${page} append=${append}`);
      const data = await apiFetch(
        `messages/?page=${page}&limit=${MESSAGES_PAGE_SIZE}`,
        {
          headers: {
            Authorization: authHeader,
          },
          redirectOnAuthError: true,
        },
      );

      if (data) {
        const pageMessages = data.messages || [];
        if (append) {
          const container = chatContainerRef.current;
          const prevScrollHeight = container?.scrollHeight ?? 0;

          setMessages((prev) => [...prev, ...pageMessages]);

          requestAnimationFrame(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight;
              container.scrollTop += newScrollHeight - prevScrollHeight;
            }
          });
        } else {
          setMessages(pageMessages);
          shouldScrollToBottomRef.current = true;
        }
        setCurrentPage(data.currentPage ?? page);
        setHasNextPage(data.hasNextPage ?? false);
      }
    } catch (error) {
      logger.error("Error fetching messages", error);
      if (!append) {
        setMessages([]);
        setHasNextPage(false);
        setCurrentPage(1);
      }
      if (setGlobalError) {
        const errorMessage = parseApiError(error);
        setGlobalError("Failed to fetch messages: " + errorMessage.summary);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreMessages = () => {
    if (!hasNextPage || loadingMore || loading) return;
    logger.debug("User triggered pagination flow");
    fetchMessages(currentPage + 1, true);
  };

  // Handle submit function with support for anonymous users (no auth header)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSubject) {
      logger.debug("Submit blocked: missing message or subject");
      return;
    }

    const tempUserMsg = {
      _id: Date.now().toString(),
      text: newMessage,
      isUser: true,
      createdAt: new Date().toISOString(),
    };

    try {
      logger.trace("Submitting user message to backend...");
      setIsTyping(true);
      const userMsg = newMessage;
      setNewMessage("");

      // Prepend user's message to the chat immediately for instant UI feedback
      setMessages((prev) => [tempUserMsg, ...prev]);
      shouldScrollToBottomRef.current = true;

      const requestHeaders = {};
      if (authHeader) {
        requestHeaders["Authorization"] = authHeader;
      }

      const responseData = await apiFetch("messages/", {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({ text: userMsg, subject: selectedSubject }),
        redirectOnAuthError: !!authHeader,
        allowAnonymous: true,
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
        shouldScrollToBottomRef.current = true;
        logger.trace("Message submission successful, updated chat with server response");
      }
    } catch (error) {
      logger.error("Error posting message", error);
      if (setGlobalError) {
        const errorMessage = parseApiError(error);
        setGlobalError("Failed to post message: " + errorMessage.summary);
      }

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
    if (!authHeader) return;

    const fetchPreferredSubject = async () => {
      try {
        logger.trace("Fetching user's preferred subject...");
        const data = await apiFetch("profile", {
          headers: { Authorization: authHeader },
          redirectOnAuthError: true,
        });
        if (data?.data?.preferredSubject) {
          const prefId =
            data.data.preferredSubject.id ||
            data.data.preferredSubject._id ||
            data.data.preferredSubject;
          logger.debug(`User's preferred subject ID: ${prefId}`);
          setSelectedSubject(prefId);
        }
      } catch (error) {
        logger.error("Error fetching preferred subject", error);
      }
    };

    fetchPreferredSubject();
  }, [authHeader]);

  useEffect(() => {
    if (selectedSubject || loadingSubjects || subjectsList.length === 0) return;
    const general = subjectsList.find((s) => s.name === "General");
    setSelectedSubject(general?.id || subjectsList[0].id);
  }, [selectedSubject, loadingSubjects, subjectsList]);

  useEffect(() => {
    if (shouldScrollToBottomRef.current) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      shouldScrollToBottomRef.current = false;
    }
  }, [messages]);

  return (
    <>
      <Head>
        <title>BrainBytes AI Tutor</title>
      </Head>
      <Layout authHeader={authHeader} onLogout={onLogout}>
      <h1 style={{ textAlign: "center", color: "#4521f8" }}>
        BrainBytes AI Tutor
      </h1>

      {/* Show guest user heads up if no auth header is present */}
      {!authHeader && (
        <p style={{ textAlign: "center", color: "#666", marginBottom: "20px" }}>
          {" "}
          You are using our service as a Guest user. Please log in to save your
          conversation history. All chats on guest mode are not saved on our
          server.
        </p>
      )}
      <div
        ref={chatContainerRef}
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
          <>
            {authHeader && hasNextPage && (
              <div style={{ textAlign: "center", marginBottom: "12px" }}>
                <button
                  type="button"
                  onClick={loadMoreMessages}
                  disabled={loadingMore}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#fff",
                    color: "#334155",
                    cursor: loadingMore ? "not-allowed" : "pointer",
                    fontSize: "14px",
                  }}
                >
                  {loadingMore ? "Loading older messages..." : "Load more"}
                </button>
              </div>
            )}
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
          </>
        )}
      </div>
      <div style={{ marginBottom: "12px" }}>
        <label
          htmlFor="chat-subject"
          style={{
            display: "block",
            marginBottom: "6px",
            fontWeight: "bold",
            color: "#334155",
            fontSize: "14px",
          }}
        >
          Subject
        </label>
        <select
          id="chat-subject"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          disabled={loadingSubjects || isTyping}
          style={{
            width: "100%",
            maxWidth: "320px",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            backgroundColor: "white",
            fontSize: "14px",
          }}
        >
          <option value="" disabled>
            {loadingSubjects ? "Loading subjects..." : "-- Select a Subject --"}
          </option>
          {subjectsList.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
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
          disabled={isTyping || !selectedSubject}
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
      </Layout>
    </>
  );
}
