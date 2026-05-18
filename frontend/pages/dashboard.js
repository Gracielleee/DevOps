import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Nunito, sans-serif' }}>
      
      {/* Updated Link syntax for Next.js 16 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '10px' }}>
        <Link href="/" style={{ color: '#2196f3', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
          💬 Back to Chat
        </Link>
        <Link href="/profile" style={{ color: '#2196f3', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
          👤 My Profile
        </Link>
      </div>

      <h1 style={{ textAlign: 'center', color: '#333' }}>Learning Dashboard</h1>
      
      <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '24px', backgroundColor: '#f9f9f9', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ borderBottom: '2px solid #2196f3', paddingBottom: '10px', color: '#333' }}>Recent Learning Activity (Qwen AI)</h3>
        
        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>Loading your stats...</p>
        ) : (
          <div style={{ marginTop: '20px' }}>
            {messages.length === 0 ? (
              <p>No activity found yet. Ask Qwen a question to see it here!</p>
            ) : (
              <div>
                <p style={{ fontWeight: 'bold' }}>Total Q&A Sets: {Math.floor(messages.length / 2)}</p>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {messages.filter(m => m.isUser).slice(-5).reverse().map((msg) => (
                    <li key={msg._id} style={{ 
                      padding: '15px', 
                      margin: '10px 0', 
                      backgroundColor: 'white', 
                      borderRadius: '8px', 
                      borderLeft: '5px solid #2196f3',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)' 
                    }}>
                      <div style={{ fontSize: '14px', color: '#555', marginBottom: '5px' }}>
                        <strong>Question:</strong> {msg.text}
                      </div>
                      <small style={{ color: '#888' }}>
                        {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString()}
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
  );
}