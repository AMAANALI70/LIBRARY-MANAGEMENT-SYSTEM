import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
  const [formData, setFormData] = useState({ title: '', author: '', isbn: '', genre: '', year: '', total_copies: '' });
  const { user } = useAuth();
  const [msg, setMsg] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:3000/admin/stats', {
        headers: { Authorization: user.token }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:3000/books',
        formData,
        { headers: { Authorization: user.token } }
      );
      setMsg('Book added successfully!');
      setFormData({ title: '', author: '', isbn: '', genre: '', year: '', total_copies: '' });
      fetchStats();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || (typeof err.response?.data === 'string' ? err.response?.data : JSON.stringify(err.response?.data)) || 'Failed to add book';
      alert(errorMessage);
    }
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>Admin Dashboard</h1>

      {stats && (
        <div className="grid" style={{ marginBottom: '3rem' }}>
          <div className="card">
            <h3 style={{ color: 'var(--text-light)' }}>Total Books</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)' }}>{stats.inventory.total_books}</p>
            <p style={{ color: 'var(--text-light)' }}>{stats.inventory.available_books} available</p>
          </div>
          <div className="card">
            <h3 style={{ color: 'var(--text-light)' }}>Active Borrows</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)' }}>{stats.active_borrows}</p>
          </div>
          <div className="card">
            <h3 style={{ color: 'var(--text-light)' }}>Overdue</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--danger)' }}>{stats.overdue}</p>
          </div>
        </div>
      )}

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 className="card-title">Add New Book</h2>
        {msg && <div className="badge badge-success" style={{ marginBottom: '1rem', display: 'block' }}>{msg}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Author</label>
              <input
                className="form-input"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">ISBN</label>
              <input
                className="form-input"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Genre</label>
              <input
                className="form-input"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <input
                type="number"
                className="form-input"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Copies</label>
              <input
                type="number"
                className="form-input"
                value={formData.total_copies}
                onChange={(e) => setFormData({ ...formData, total_copies: e.target.value })}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Add Book</button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
