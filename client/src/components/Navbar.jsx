import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="container nav-content">
                <Link to="/" className="logo">LibSys</Link>
                <div className="nav-links">
                    {user ? (
                        <>
                            <Link to="/" className="nav-link">Books</Link>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="nav-link">Manage</Link>
                            )}
                            <Link to="/my-books" className="nav-link">My Books</Link>
                            <button onClick={handleLogout} className="btn btn-outline">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="btn btn-primary">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
