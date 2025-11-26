import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [books, setBooks] = useState([]);
    const { user } = useAuth();
    const [msg, setMsg] = useState('');
    const [filters, setFilters] = useState({ search: '', genre: '', year: '' });

    useEffect(() => {
        fetchBooks();
    }, [filters]);

    const fetchBooks = async () => {
        try {
            const params = new URLSearchParams(filters);
            const res = await axios.get(`http://localhost:3000/books?${params}`);
            setBooks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBorrow = async (bookId) => {
        if (!user) return alert('Please login to borrow books');
        try {
            await axios.post(
                'http://localhost:3000/borrow',
                { book_id: bookId },
                { headers: { Authorization: user.token } }
            );
            setMsg('Book borrowed successfully!');
            fetchBooks();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            const errorMessage = err.response?.data?.error || (typeof err.response?.data === 'string' ? err.response?.data : JSON.stringify(err.response?.data)) || 'Borrow failed';
            alert(errorMessage);
        }
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Library Books</h1>
                {msg && <div className="badge badge-success">{msg}</div>}
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                    <input
                        className="form-input"
                        placeholder="Search title, author, ISBN..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                    <input
                        className="form-input"
                        placeholder="Genre"
                        value={filters.genre}
                        onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                    />
                    <input
                        className="form-input"
                        placeholder="Year"
                        value={filters.year}
                        onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid">
                {books.map((book) => (
                    <div key={book.id} className="card">
                        <div style={{ height: '150px', background: '#f1f5f9', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            {book.isbn || 'Book Cover'}
                        </div>
                        <h3 className="card-title">{book.title}</h3>
                        <p style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>by {book.author}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                            <span className="badge" style={{ background: '#f1f5f9' }}>{book.genre}</span>
                            <span style={{ fontSize: '0.875rem', color: book.available_copies > 0 ? 'var(--success)' : 'var(--danger)' }}>
                                {book.available_copies} / {book.total_copies} available
                            </span>
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            {book.available_copies > 0 ? (
                                <button onClick={() => handleBorrow(book.id)} className="btn btn-primary" style={{ width: '100%' }}>Borrow</button>
                            ) : (
                                <button disabled className="btn btn-outline" style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }}>Out of Stock</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
