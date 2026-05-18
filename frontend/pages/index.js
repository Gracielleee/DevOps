import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

  // Function to format math expressions in the response text
  const formatMath = (text) => {
    return text
      .replace(/\\\[|(?<=\n)\[(?=.*\])/g, '$$$')
      .replace(/\\\]|(?<=.*\[)\](?=\n|$)/g, '$$$')
      .replace(/\\\(|(?<=\s)\((?=[a-zA-Z0-9\s]{1,3}\))/g, '$')
      .replace(/\\\)|(?<=\$[a-zA-Z0-9\s]{1,3})\)/g, '$');
  };

  // Fetch messages from the API
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

  // Submit a new message
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
        createdAt: new Date().toISOString()
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
      setMessages(prev => [...prev, {
        _id: Date.now().toString(),
        text: "Sorry, I couldn't process your request. Please try again later.",
        isUser: false,
        createdAt: new Date().toISOString()
      }]);
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

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          <Link href="/" style={{ color: '#ffffff', backgroundColor: '#334155', fontWeight: 'bold', textDecoration: 'none', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            💬 AI Chat Client
          </Link>
          
          <Link href="/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📊 Learning Dashboard
          </Link>

          <Link href="/materials" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📚 Learning Materials
          </Link>
          
          <Link href="/profile" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            👤 My Profile
          </Link>
        </nav>

        <div style={{ borderTop: '1px solid #334155', paddingTop: '16px' }}>
          <Link href="/auth" style={{ 
            color: '#f87171', 
            textDecoration: 'none', 
            padding: '12px 16px', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            border: '1px solid #f87171',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            🚪 Exit / Log Out
          </Link>
        </div>
      </aside>

      {/* ================= MAIN DISPLAY CONTENT VIEWPORT ================= */}
      <main style={{ flexGrow: 1, overflowY: 'auto', padding: '40px' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          
          <h1 style={{ color: '#0f172a', margin: '0 0 20px 0' }}>💬 BrainBytes AI Tutor</h1>
          
          <div 
            style={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: '12px', 
              height: 'calc(100vh - 210px)', 
              minHeight: '400px',
              overflowY: 'auto',
              padding: '20px',
              marginBottom: '20px',
              backgroundColor: 'white',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <p>Loading conversation history...</p>
              </div>
            ) : (
              <div>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#475569' }}>
                    <h3 style={{ fontSize: '20px', margin: '0 0 10px 0' }}>Welcome to BrainBytes AI Tutor!</h3>
                    <p style={{ color: '#64748b', margin: 0 }}>Ask me any question about math, science, or history.</p>
                  </div>
                ) : (
                  <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                    {messages.map((message) => (
                      <li 
                        key={message._id} 
                        style={{ 
                          padding: '12px 16px', 
                          margin: '12px 0', 
                          backgroundColor: message.isUser ? '#e3f2fd' : '#f1f5f9',
                          color: '#1e293b',
                          borderRadius: '12px',
                          maxWidth: '75%',
                          wordBreak: 'break-word',
                          marginLeft: message.isUser ? 'auto' : '0',
                          marginRight: message.isUser ? '0' : 'auto',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ margin: '0 0 6px 0', lineHeight: '1.6' }}>
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}>
                            {formatMath(message.text)}
                          </ReactMarkdown>
                        </div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#94a3b8',
                          textAlign: message.isUser ? 'right' : 'left'
                        }}>
                          {message.isUser ? 'You' : 'AI Tutor'} • {new Date(message.createdAt).toLocaleTimeString()}
                        </div>
                      </li>
                    ))}
                    {isTyping && (
                      <li 
                        style={{ 
                          padding: '12px 16px', 
                          margin: '12px 0', 
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                          borderRadius: '12px',
                          maxWidth: '75%',
                          marginLeft: '0',
                          marginRight: 'auto',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ margin: '0', fontStyle: 'italic' }}>AI tutor is typing...</div>
                      </li>
                    )}
                    <div ref={messageEndRef} />
                  </ul>
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

    </div>
  );
}