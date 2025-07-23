import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function RegisterPage() {
    const [step, setStep] = useState(1);
    const [mobile, setMobile] = useState('');
    const [username, setUsername] = useState(''); // NEW: State for username
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const passwordRules = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        symbol: /[!@#$%^&*()]/.test(password),
    };
    const isPasswordValid = Object.values(passwordRules).every(Boolean);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('Sending OTP...');
        try {
            await axios.post('http://127.0.0.1:5000/api/register/send-otp', { mobile });
            setMessage('OTP sent! Check your backend console.');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP.');
            setMessage('');
        }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (!isPasswordValid) {
            setError('Password does not meet all requirements.');
            return;
        }
        try {
            // UPDATED: Send username in the request
            await axios.post('http://127.0.0.1:5000/api/register/verify', { mobile, otp, password, username });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed!');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', margin: '5rem auto' }}>
            <h1>Register</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}

            {step === 1 && (
                <form onSubmit={handleSendOtp}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Mobile Number</label>
                        <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '10px' }}>Send OTP</button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleVerifyAndRegister}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Enter OTP</label>
                        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
                    </div>
                     {/* NEW: Username input field */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Create Username</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
                    </div>
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
            )}

            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
}
export default RegisterPage;