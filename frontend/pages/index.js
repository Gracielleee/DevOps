import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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
      setMessages(prev => [...prev, tempUserMsg]);
      
      const response = await axios.post(`${API_URL}/messages`, { 
        text: userMsg,
        subject: selectedSubject 
      });
      
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => msg._id !== tempUserMsg._id);
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

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: 'Nunito, sans-serif', backgroundColor: '#f4f6f8' }}>
      
      {/* ================= TASK 4: REORGANIZED SIDEBAR NAVIGATION ================= */}
      <aside style={{
        width: '260px',
        backgroundColor: '#1e293b',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
        flexShrink: 0
      }}>
        <div style={{ marginBottom: '40px', paddingLeft: '8px' }}>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#fff', letterSpacing: '0.5px' }}>🧠 BrainBytes</h2>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>DevOps Platform</span>
        </div>

      <h1 style={{ textAlign: 'center', color: '#333' }}>BrainBytes AI Tutor</h1>
      
      <div 
        style={{ 
          border: '1px solid #ddd', 
          borderRadius: '12px', 
          height: '500px', 
          overflowY: 'auto',
          padding: '16px',
          marginBottom: '20px',
          backgroundColor: '#f9f9f9',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
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
              </div>
            )}
          </div>
          
          {/* Subject Filter Dropdown Area */}
          <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#64748b' }}>Current Subject:</span>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', outline: 'none', color: '#334155', fontWeight: '600' }}
            >
              <option value="General">General</option>
              <option value="Math">Math</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
            </select>
          </div>

          {/* Prompt Form Input Area */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask a question..."
              style={{ 
                flex: '1', 
                padding: '14px 16px',
                borderRadius: '12px 0 0 12px',
                border: '1px solid #cbd5e1',
                borderRight: 'none',
                fontSize: '16px',
                outline: 'none',
                color: '#334155'
              }}
              disabled={isTyping}
            />
            <button 
              type="submit" 
              style={{ 
                padding: '14px 28px',
                backgroundColor: isTyping ? '#93c5fd' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0 12px 12px 0',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isTyping ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              disabled={isTyping}
            />
          </form>

        </div>
      </main>

      <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ask a question..."
          style={{ 
            flex: '1', 
            padding: '14px 16px',
            borderRadius: '12px 0 0 12px',
            border: '1px solid #ddd',
            fontSize: '16px',
            outline: 'none'
          }}
          disabled={isTyping}
        />
        <button 
          type="submit" 
          style={{ 
            padding: '14px 24px',
            backgroundColor: isTyping ? '#90caf9' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '0 12px 12px 0',
            fontSize: '16px',
            cursor: isTyping ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
          disabled={isTyping}
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