import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

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

  // !!!CURRENTLY DOES NOT WORK. Function to format math expressions in the response text
  const formatMath = (text) => {
    return text
      // 1. Handle Block Math: \[ ... \] or [ ... ] (on its own line)
    .replace(/\\\[|(?<=\\n)\[(?=.*\\])/g, '$$$')
    .replace(/\\\]|(?<=.*\[)\](?=\\n|$)/g, '$$$')
    // 2. Handle Inline Math: \( ... \) or ( F ) 
    .replace(/\(|(?<=\s)\((?=[a-zA-Z0-9\s]{1,3}\))/g, '$')
    .replace(/\)|(?<=\$[a-zA-Z0-9\s]{1,3})\)/g, '$');
  };

  // Fetch messages from the API
  const fetchMessages = async () => {
    if (!authHeader) return; // Don't fetch if no auth
    try {
      const response = await axios.get(`${API_BASE_URL}/api/messages`, {
        headers: {
          'Authorization': authHeader
        }
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

  // Submit a new message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !authHeader) return; // Don't submit if no message or no auth
    
    try {
      setIsTyping(true); // Show typing indicator
      const userMsg = newMessage;
      setNewMessage('');
      
      // Optimistically add user message to UI
      const tempUserMsg = {
        _id: Date.now().toString(),
        text: userMsg,
        isUser: true,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempUserMsg]);
      
      // Send to backend and get AI response
      const response = await axios.post(`${API_BASE_URL}/api/messages`, { text: userMsg }, {
        headers: {
          'Authorization': authHeader
        }
      });
      
      // Replace the temporary message with the actual one and add AI response
      setMessages(prev => {
        // Filter out the temporary message
        const filteredMessages = prev.filter(msg => msg._id !== tempUserMsg._id);
        // Add the real messages from the API
        return [...filteredMessages, response.data.userMessage, response.data.aiMessage];
      });
    } catch (error) {
      console.error('Error posting message:', error);
      if (error.response && error.response.status === 401) {
        alert('Authentication failed. Please refresh and try again.');
      }
      // Show error in chat
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

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages on component mount
  useEffect(() => {
    if (authHeader) { // Only fetch messages if authHeader is set
      fetchMessages();
    }
  }, [authHeader]);

  if (!authHeader) {
    return <LoginForm onLogin={handleLogin} error={authError} />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Nunito, sans-serif' }}>
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
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Loading conversation history...</p>
          </div>
        ) : (
          <div>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <h3>Welcome to BrainBytes AI Tutor!</h3>
                <p>Ask me any question about math, science, or history.</p>
              </div>
            ) : (
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {messages.map((message) => (
                  <li 
                    key={message._id} 
                    style={{ 
                      padding: '12px 16px', 
                      margin: '8px 0', 
                      backgroundColor: message.isUser ? '#e3f2fd' : '#e8f5e9',
                      color: '#333',
                      borderRadius: '12px',
                      maxWidth: '80%',
                      wordBreak: 'break-word',
                      marginLeft: message.isUser ? 'auto' : '0',
                      marginRight: message.isUser ? '0' : 'auto',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ margin: '0 0 5px 0', lineHeight: '1.5' }}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}>
                      {formatMath(message.text)}
                    </ReactMarkdown></div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#666',
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
                      margin: '8px 0', 
                      backgroundColor: '#e8f5e9',
                      color: '#333',
                      borderRadius: '12px',
                      maxWidth: '80%',
                      marginLeft: '0',
                      marginRight: 'auto',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ margin: '0' }}>AI tutor is typing...</div>
                  </li>
                )}
                <div ref={messageEndRef} />
              </ul>
            )}
          </div>
        )}
      </div>
      
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
          {isTyping ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
