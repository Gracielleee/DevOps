import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

function LoginForm({ onLogin, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      onLogin(null, 'Please enter both username and password.');
      return;
    }
    onLogin({ username: username.trim(), password: password.trim() });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7fb', padding: '24px' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '420px', background: '#fff', padding: '28px', borderRadius: '16px', boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center', color: '#222' }}>Login to BrainBytes AI Tutor</h2>
        <label style={{ display: 'block', marginBottom: '12px', color: '#444' }}>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '12px 14px', marginTop: '6px', borderRadius: '10px', border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '18px', color: '#444' }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px 14px', marginTop: '6px', borderRadius: '10px', border: '1px solid #ccc' }}
          />
        </label>
        {error && <div style={{ marginBottom: '16px', color: '#d32f2f' }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#1976d2', color: '#fff', border: 'none', fontSize: '16px', cursor: 'pointer' }}>
          Sign In
        </button>
      </form>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('General');
  const messageEndRef = useRef(null);
  const [authHeader, setAuthHeader] = useState('');
  const [authError, setAuthError] = useState('');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  const handleLogin = ({ username, password }, errorMessage = '') => {
    if (!username || !password) {
      setAuthError(errorMessage || 'Authentication failed.');
      return;
    }

    const encoded = btoa(`${username}:${password}`);
    setAuthHeader(`Basic ${encoded}`);
    setAuthError('');
  };

  const formatMath = (text) => {
    return text
      .replace(/\\\[|(?<=\\n)\[(?=.*\\])/g, '$$$')
      .replace(/\\\]|(?<=.*\[)\](?=\\n|$)/g, '$$$')
      .replace(/\(|(?<=\s)\((?=[a-zA-Z0-9\s]{1,3}\))/g, '$')
      .replace(/\)|(?<=\$[a-zA-Z0-9\s]{1,3})\)/g, '$');
  };

  const fetchMessages = async () => {
    if (!authHeader) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/messages`, {
        headers: { 'Authorization': authHeader }
      });
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (error.response && error.response.status === 401) {
        alert('Authentication failed. Please refresh and try again.');
      }
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !authHeader) return;
    
    try {
      setIsTyping(true);
      const userMsg = newMessage;
      setNewMessage('');
      const tempUserMsg = { _id: Date.now().toString(), text: userMsg, isUser: true, createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, tempUserMsg]);
      
      const response = await axios.post(`${API_BASE_URL}/api/messages`, { text: userMsg }, {
        headers: { 'Authorization': authHeader }
      });
      
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => msg._id !== tempUserMsg._id);
        return [...filteredMessages, response.data.userMessage, response.data.aiMessage];
      });
    } catch (error) {
      console.error('Error posting message:', error);
      if (error.response && error.response.status === 401) {
        alert('Authentication failed. Please refresh and try again.');
      }
      setMessages(prev => [...prev, { _id: Date.now().toString(), text: "Sorry, I couldn't process your request. Please try again later.", isUser: false, createdAt: new Date().toISOString() }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (authHeader) fetchMessages();
  }, [authHeader]);

  if (!authHeader) {
    return <LoginForm onLogin={handleLogin} error={authError} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: 'Nunito, sans-serif', backgroundColor: '#f4f6f8' }}>
      <aside style={{ width: '260px', backgroundColor: '#1e293b', color: '#ffffff', display: 'flex', flexDirection: 'column', padding: '24px 16px', boxShadow: '2px 0 5px rgba(0,0,0,0.05)', flexShrink: 0 }}>
        <div style={{ marginBottom: '40px', paddingLeft: '8px' }}>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#fff' }}>🧠 BrainBytes</h2>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>DevOps Platform</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <Link href="/profile" style={{ color: '#fff', textDecoration: 'none' }}>👤 My Profile</Link>
          <Link href="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>📊 Dashboard</Link>
        </nav>
      </aside>
      <main style={{ flex: '1', display: 'flex', flexDirection: 'column', padding: '20px', overflow: 'hidden' }}>
        <h1 style={{ textAlign: 'center', color: '#333' }}>BrainBytes AI Tutor</h1>
        <div style={{ border: '1px solid #ddd', borderRadius: '12px', flex: '1', overflowY: 'auto', padding: '16px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
          {loading ? <p>Loading conversation history...</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {messages.map((message) => (
                <li key={message._id} style={{ marginBottom: '10px', padding: '10px', borderRadius: '8px', backgroundColor: message.isUser ? '#d1e7dd' : '#fff' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]} rehypePlugins={[rehypeKatex, rehypeHighlight]}>
                    {formatMath(message.text)}
                  </ReactMarkdown>
                </li>
              ))}
              <div ref={messageEndRef} />
            </ul>
          )}
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Ask a question..." style={{ flex: '1', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <button type="submit" disabled={isTyping} style={{ padding: '12px 24px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none' }}>
            {isTyping ? 'Sending...' : 'Send'}
          </button>
        </form>
      </main>
    </div>
  );
}