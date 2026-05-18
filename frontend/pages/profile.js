import React, { useState } from 'react';
import Link from 'next/link';

export default function Profile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false); // Track save feedback

  const handleSave = (e) => {
    e.preventDefault();
    // Simulate saving the user settings locally
    setSaveSuccess(true);
    
    // Hide the success message after 3 seconds automatically
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

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
          <Link href="/" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            💬 AI Chat Client
          </Link>
          
          <Link href="/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📊 Learning Dashboard
          </Link>

          <Link href="/materials" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📚 Learning Materials
          </Link>
          
          <Link href="/profile" style={{ color: '#ffffff', backgroundColor: '#334155', fontWeight: 'bold', textDecoration: 'none', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
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
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          
          <h1 style={{ color: '#0f172a', margin: '0 0 24px 0' }}>👤 User Profile</h1>
          
          <form onSubmit={handleSave} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '30px', backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            
            {/* Success Notification Alert */}
            {saveSuccess && (
              <div style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', textAlign: 'center' }}>
                🎉 Preferences saved successfully!
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#334155' }}>Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} 
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#334155' }}>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px' }} 
                required
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#334155' }}>Preferred Subject</label>
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', backgroundColor: 'white' }}
                required
              >
                <option value="">Select a subject</option>
                <option value="Math">Math</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
              </select>
            </div>

            <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}>
              Save Preferences
            </button>
          </form>

        </div>
      </main>

    </div>
  );
}