import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">R Recipe Blog</Link>
            <div>
                {user ? (
                    <>
                        <Link to="/add-recipe" style={{ color: '#333', marginRight: '1rem', textDecoration: 'none' }}>Add Recipe</Link>
                        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ff6347', cursor: 'pointer', fontSize: '1rem' }}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: '#333', marginRight: '1rem', textDecoration: 'none' }}>Login</Link>
                        <Link to="/register" style={{ color: '#333', textDecoration: 'none' }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
export default Navbar;