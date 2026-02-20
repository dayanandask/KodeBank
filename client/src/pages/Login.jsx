import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { User, Lock, Vault, Chrome, Apple, Monitor, Key, Building2, ShieldCheck, Home } from 'lucide-react';

const Login = ({ setUser }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [socialLoading, setSocialLoading] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        try {
            const res = await api.post('/api/auth/login', formData);
            setUser({
                username: res.data.username,
                role: res.data.role
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    const handleSocialLogin = (provider) => {
        setSocialLoading(provider);
        setError('');
        // Simulated "working" OAuth flow for instant access
        setTimeout(() => {
            setUser({
                username: provider + '_User',
                role: 'Customer'
            });
            navigate('/dashboard');
            setSocialLoading(null);
        }, 1200);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass w-full max-w-md p-10 flex flex-col gap-4"
            >
                <div className="flex flex-col items-center mb-2">
                    <div className="relative mb-2 flex items-center justify-center">
                        <ShieldCheck className="text-gold-primary w-16 h-16" />
                        <Home className="absolute text-gold-primary w-6 h-6 mb-1" />
                        <div className="absolute inset-0 bg-gold-primary/20 blur-2xl rounded-full"></div>
                    </div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-gold-primary to-white bg-clip-text text-transparent italic tracking-tighter">
                        KODBANK
                    </h1>
                    <p className="text-text-dim text-sm mt-1">Join the Elite Circle</p>
                </div>

                <div className="divider-container">Log in with</div>

                <div className="social-grid">
                    <button onClick={() => handleSocialLogin('Google')} className="social-btn">
                        <Chrome className="text-[#4285F4]" />
                        <span className="text-[10px] uppercase font-bold tracking-tight">Google</span>
                    </button>
                    <button onClick={() => handleSocialLogin('Apple')} className="social-btn">
                        <Apple className="text-white" />
                        <span className="text-[10px] uppercase font-bold tracking-tight">Apple</span>
                    </button>
                    <button onClick={() => handleSocialLogin('Microsoft')} className="social-btn">
                        <Monitor className="text-[#00A4EF]" />
                        <span className="text-[10px] uppercase font-bold tracking-tight">Microsoft</span>
                    </button>
                </div>

                <div className="social-grid-2">
                    <button onClick={() => handleSocialLogin('Passkey')} className="social-btn">
                        <Key className="text-gold-primary" />
                        <span className="text-[10px] uppercase font-bold tracking-tight">Passkey</span>
                    </button>
                    <button onClick={() => handleSocialLogin('SSO')} className="social-btn">
                        <Building2 className="text-accent-blue" />
                        <span className="text-[10px] uppercase font-bold tracking-tight">SSO</span>
                    </button>
                </div>

                <div className="divider-container">or continue with</div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-4.5 text-text-dim w-6 h-6" />
                        <input
                            type="text"
                            placeholder="Username"
                            className="input-field pl-12"
                            required
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-4.5 text-text-dim w-6 h-6" />
                        <input
                            type="password"
                            placeholder="Password"
                            className="input-field pl-12"
                            required
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <button type="submit" className="gold-btn w-full mt-2">
                        LOGIN
                    </button>

                    <p className="text-center text-text-dim text-sm mt-2">
                        New to Kodbank? <Link to="/register" className="text-gold-primary hover:underline">Register Account</Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
