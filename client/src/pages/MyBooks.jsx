import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MyBooks = () => {
    const [borrowed, setBorrowed] = useState([]);
    const { user } = useAuth();
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetchBorrowed();
    }, []);

    const fetchBorrowed = async () => {
        try {
            const res = await axios.get('http://localhost:3000/borrowed', {
                headers: { Authorization: user.token }
            });
            setBorrowed(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReturn = async (bookId) => {
        try {
            await axios.post(
                'http://localhost:3000/return',
                { book_id: bookId },
                { headers: { Authorization: user.token } }
            );
            setMsg('Book returned successfully!');
            fetchBorrowed();
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            const errorMessage = err.response?.data?.error || (typeof err.response?.data === 'string' ? err.response?.data : JSON.stringify(err.response?.data)) || 'Return failed';
            alert(errorMessage);
        }
    };

    return (
        <div className="container">
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>My Borrowed Books</h1>
            {msg && <div className="badge badge-success" style={{ marginBottom: '1rem', display: 'block' }}>{msg}</div>}

            <div className="card table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Borrowed</th>
                            <th>Due</th>
                            <th>Returned</th>
                            <th>Fine</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {borrowed.map((record, idx) => (
                            <tr key={idx}>
                                <td>{record.title}</td>
                                <td>{record.author}</td>
                                <td>{new Date(record.borrow_date).toLocaleDateString()}</td>
                                <td>{record.due_date ? new Date(record.due_date).toLocaleDateString() : 'N/A'}</td>
                                <td>{record.return_date ? new Date(record.return_date).toLocaleDateString() : '-'}</td>
                                <td>
                                    {record.fine_amount > 0 ? (
                                        <span className="badge badge-danger">${record.fine_amount}</span>
                                    ) : (
                                        '-'
                                    )}
                                </td>
                                <td>
                                    {!record.return_date && (
                                        <button
                                            onClick={() => handleReturn(record.book_id)}
                                            className="btn btn-outline"
                                            style={{ fontSize: '0.875rem', padding: '0.4rem 0.8rem' }}
                                        >
                                            Return
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {borrowed.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-light)' }}>No borrowed books</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyBooks;
