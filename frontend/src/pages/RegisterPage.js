import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL; // UPDATED FOR DEPLOYMENT

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const passwordRules = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        symbol: /[!@#$%^&*()]/.test(password),
    };
    const isPasswordValid = Object.values(passwordRules).every(Boolean);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (!isPasswordValid) { setError('Password does not meet all requirements.'); return; }
        try {
            await axios.post(`${API_URL}/api/register`, { username, password });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed!');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', margin: '5rem auto' }}>
            <form onSubmit={handleRegister}>
                <h1>Register</h1>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div style={{ marginBottom: '1rem' }}><label>Create Username</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '8px' }} /></div>
                <div style={{ marginBottom: '1rem' }}>
                    <label>Create Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
                    <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                        <p style={{ color: passwordRules.length ? 'green' : 'red' }}>At least 8 characters</p>
                        <p style={{ color: passwordRules.uppercase ? 'green' : 'red' }}>One uppercase letter</p>
                        <p style={{ color: passwordRules.lowercase ? 'green' : 'red' }}>One lowercase letter</p>
                        <p style={{ color: passwordRules.number ? 'green' : 'red' }}>One number</p>
                        <p style={{ color: passwordRules.symbol ? 'green' : 'red' }}>One symbol (!@#$%^&*())</p>
                    </div>
                </div>
                <button type="submit" disabled={!isPasswordValid} style={{ width: '100%', padding: '10px' }}>Register</button>
            </form>
             <p style={{ textAlign: 'center', marginTop: '1rem' }}>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
    );
}
export default RegisterPage;