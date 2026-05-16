import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Normalize common LaTeX delimiters to remark-math ($ / $$).
 * Keeps existing **bold**, `code`, and markdown lists intact.
 */
const formatMath = (text) => {
  if (!text || typeof text !== 'string') return text || '';
  let s = text;
  s = s.replace(/\\\[([\s\S]*?)\\\]/g, (_, inner) => `$$\n${inner.trim()}\n$$`);
  s = s.replace(/\\\(([\s\S]*?)\\\)/g, (_, inner) => `$${inner.trim()}$`);
  return s;
};

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('General');
  const messageEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/messages`);
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setIsTyping(true);
      const userMsg = newMessage;
      setNewMessage('');

      const tempUserMsg = {
        _id: Date.now().toString(),
        text: userMsg,
        isUser: true,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      const response = await axios.post(`${API_URL}/messages`, {
        text: userMsg,
        subject: selectedSubject,
      });

      setMessages((prev) => {
        const filteredMessages = prev.filter((msg) => msg._id !== tempUserMsg._id);
        return [...filteredMessages, response.data.userMessage, response.data.aiMessage];
      });
    } catch (error) {
      console.error('Error posting message:', error);
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString(),
          text: "Sorry, I couldn't process your request. Please try again later.",
          isUser: false,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="chat-page">
      <div className="chat-nav">
        <Link href="/profile">👤 My Profile</Link>
        <Link href="/dashboard">📊 Dashboard</Link>
      </div>

      <h1>BrainBytes AI Tutor</h1>

      <div className="chat-container">
        {loading ? (
          <div className="chat-loading">
            <p>Loading conversation history...</p>
          </div>
        ) : (
          <div>
            {messages.length === 0 ? (
              <div className="chat-empty">
                <h3>Welcome to BrainBytes AI Tutor!</h3>
                <p>Ask me any question about math, science, or history.</p>
              </div>
            ) : (
              <ul className="message-list">
                {messages.map((message) => (
                  <li
                    key={message._id}
                    className={`message-bubble ${message.isUser ? 'message-bubble--user' : 'message-bubble--ai'}`}
                  >
                    <div className="message-body">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
                        rehypePlugins={[rehypeKatex, rehypeHighlight]}
                      >
                        {formatMath(message.text)}
                      </ReactMarkdown>
                    </div>
                    <div
                      className={`message-meta ${message.isUser ? 'message-meta--user' : 'message-meta--ai'}`}
                    >
                      {message.isUser ? 'You' : 'AI Tutor'} •{' '}
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                  </li>
                ))}
                {isTyping && (
                  <li className="message-bubble message-bubble--typing">
                    <div>AI tutor is typing...</div>
                  </li>
                )}
                <div ref={messageEndRef} />
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="chat-subject-row">
        <span className="chat-subject-label">Current Subject:</span>
        <select
          className="chat-subject-select"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="General">General</option>
          <option value="Math">Math</option>
          <option value="Science">Science</option>
          <option value="History">History</option>
        </select>
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <div className="chat-input-row">
          <input
            className="chat-input"
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask a question..."
            autoComplete="off"
            disabled={isTyping}
          />
          <button className="chat-send" type="submit" disabled={isTyping}>
            {isTyping ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
