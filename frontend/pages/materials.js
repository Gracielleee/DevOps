import { useState } from 'react';
import Link from 'next/link';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState([
    { id: 1, title: 'Week 1: Introduction to Docker Isolation', description: 'Core principles of container namespaces and cgroups.' },
    { id: 2, title: 'Week 2: Multi-Container Docker Compose', description: 'Orchestrating isolated frontend, backend, and database networks.' }
  ]);

  const [formData, setFormData] = useState({ id: null, title: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    if (isEditing) {
      setMaterials(materials.map(item => item.id === formData.id ? formData : item));
      setIsEditing(false);
    } else {
      const newItem = { id: Date.now(), title: formData.title, description: formData.description };
      setMaterials([...materials, newItem]);
    }
    setFormData({ id: null, title: '', description: '' });
  };

  const handleEditSelect = (item) => {
    setFormData(item);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this resource asset?')) {
      setMaterials(materials.filter(item => item.id !== id));
    }
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

          <Link href="/materials" style={{ color: '#ffffff', backgroundColor: '#334155', fontWeight: 'bold', textDecoration: 'none', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
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
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <header style={{ marginBottom: '30px' }}>
            <h1 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>📚 Learning Materials Repositories</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Perform administrative CRUD actions on baseline course files and curriculum notes.</p>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px', alignItems: 'start' }}>
            
            {/* CRUD FORM AREA */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
                {isEditing ? '✏️ Modify Resource Settings' : '➕ Create Resource Entry'}
              </h3>
              <form onSubmit={handleSave}>
                <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>Document Title</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px', outline: 'none' }} placeholder="e.g., Week 3 container tuning specs" required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px' }}>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>Content Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }} placeholder="Provide summary context logs here..." required></textarea>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ flexGrow: 1, padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {isEditing ? 'Update Document' : 'Commit Entry'}
                  </button>
                  {isEditing && (
                    <button type="button" onClick={() => { setIsEditing(false); setFormData({ id: null, title: '', description: '' }); }} style={{ padding: '10px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                  )}
                </div>
              </form>
            </div>

            {/* CRUD CONTENT RENDER LIST */}
            <div>
              <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Active Core Registries ({materials.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {materials.map(item => (
                  <div key={item.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '17px' }}>{item.title}</h4>
                    <p style={{ margin: '0 0 16px 0', color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>{item.description}</p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEditSelect(item)} style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', background: '#eff6ff', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Modify</button>
                      <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', background: '#fef2f2', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}