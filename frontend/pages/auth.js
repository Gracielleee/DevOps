import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulates successful entry and routes the user to the chat client
    router.push('/');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: '#0f172a', fontFamily: 'Nunito, sans-serif' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ margin: '0 0 6px 0', color: '#1e293b', textAlign: 'center' }}>{isLogin ? 'Welcome Back!' : 'Get Started'}</h2>
        <p style={{ textAlign: 'center', color: '#64748b', margin: '0 0 28px 0', fontSize: '14px' }}>BrainBytes Cognitive Architecture Platform</p>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
              <label style={{ marginBottom: '6px', fontWeight: 'bold', color: '#334155', fontSize: '13px' }}>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px', outline: 'none' }} required />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
            <label style={{ marginBottom: '6px', fontWeight: 'bold', color: '#334155', fontSize: '13px' }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px', outline: 'none' }} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
            <label style={{ marginBottom: '6px', fontWeight: 'bold', color: '#334155', fontSize: '13px' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px', outline: 'none' }} required />
          </div>
          
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}>
            {isLogin ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
          {isLogin ? "New to BrainBytes? " : "Already registered? "}
          <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
            {isLogin ? 'Create account' : 'Sign in instead'}
          </span>
        </p>
      </div>
    </div>
  );
}