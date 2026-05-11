import React, { useState } from 'react';
import Link from 'next/link'; // For navigation

export default function Profile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Nunito, sans-serif' }}>
      <Link href="/">
        <button style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#2196f3', cursor: 'pointer', fontWeight: 'bold' }}>
          ← Back to Chat
        </button>
      </Link>
      
      <h1 style={{ textAlign: 'center', color: '#333' }}>User Profile</h1>
      
      <div style={{ border: '1px solid #ddd', borderRadius: '12px', padding: '30px', backgroundColor: '#f9f9f9', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} 
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} 
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Preferred Subject</label>
          <select 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          >
            <option value="">Select a subject</option>
            <option value="Math">Math</option>
            <option value="Science">Science</option>
            <option value="History">History</option>
          </select>
        </div>

        <button style={{ width: '100%', padding: '14px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', cursor: 'pointer' }}>
          Save Preferences
        </button>
      </div>
    </div>
  );
}