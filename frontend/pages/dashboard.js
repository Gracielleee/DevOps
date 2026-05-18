import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchMessages = async () => {
    try {
      // Connecting to backend port 3000 as seen in your logs
      const response = await axios.get('http://axios:3000/api/messages'); 
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: 'Nunito, sans-serif', backgroundColor: '#f4f6f8' }}>
      
      {/* ================= TASK 3: REORGANIZED SIDEBAR NAVIGATION ================= */}
      <aside style={{
        width: '260px',
        backgroundColor: '#1e293b',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        boxShadow: '2px 0 5px rgba(0,0,0,0.05)'
      }}>
        <div style={{ marginBottom: '40px', paddingLeft: '8px' }}>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#fff', letterSpacing: '0.5px' }}>🧠 BrainBytes</h2>
          <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>DevOps Platform</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          <Link href="/" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}>
            💬 AI Chat Client
          </Link>
          
          <Link href="/dashboard" style={{ color: '#ffffff', backgroundColor: '#334155', fontWeight: 'bold', textDecoration: 'none', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📊 Learning Dashboard
          </Link>

          {/* New route for CRUD */}
          <Link href="/materials" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📚 Learning Materials
          </Link>
          
          <Link href="/profile" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            👤 My Profile
          </Link>
        </nav>

        {/* New item for Auth UI */}
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
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <header style={{ marginBottom: '30px' }}>
            <h1 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>Welcome Back!</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Here is a summary of your recent interactions with the Qwen AI pipeline.</p>
          </header>
          
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '28px', backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ borderBottom: '2px solid #2196f3', paddingBottom: '12px', marginTop: 0, color: '#1e293b' }}>
              Recent Learning Activity Logs
            </h3>
            
            {loading ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading your telemetry runtime data...</p>
            ) : (
              <div style={{ marginTop: '20px' }}>
                {messages.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No activity found yet. Ask Qwen a question to see it here!</p>
                ) : (
                  <div>
                    <div style={{ display: 'inline-block', backgroundColor: '#eff6ff', color: '#1e40af', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', marginBottom: '20px' }}>
                      📈 Total Q&A Sets Saved: {Math.floor(messages.length / 2)}
                    </div>
                    
                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                      {messages.filter(m => m.isUser).slice(-5).reverse().map((msg) => (
                        <li key={msg._id} style={{ 
                          padding: '16px', 
                          margin: '12px 0', 
                          backgroundColor: '#f8fafc', 
                          borderRadius: '8px', 
                          borderLeft: '5px solid #2196f3',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)' 
                        }}>
                          <div style={{ fontSize: '15px', color: '#334155', marginBottom: '8px', lineHeight: '1.5' }}>
                            <strong>Question prompt passed:</strong> {msg.text}
                          </div>
                          <small style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            📅 {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString()}
                          </small>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </main>

    </div>
  );
}