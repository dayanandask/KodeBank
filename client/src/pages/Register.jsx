import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Lock, Mail, Phone, ShieldCheck, Home, ArrowRight, ArrowLeft, CheckCircle2, Chrome, Apple, Monitor } from 'lucide-react';

const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        if (e) e.preventDefault();
        setError('');
        try {
            await api.post('/api/auth/register', formData);
            navigate('/login');
        } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
            setError(msg);
            console.error('Registration error:', err.response?.data);
        }
    };

    const handleSocialAuth = (provider) => {
        alert(`Kodbank Secure Gateway: Initializing sign-up via ${provider}...`);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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

                <div className="divider-container">Sign up with</div>

                <div className="social-grid">
                    <button onClick={() => handleSocialAuth('Google')} className="social-btn">
                        <Chrome className="text-[#4285F4]" />
                        <span className="text-[10px] uppercase font-bold tracking-tight">Google</span>
                    </button>
                    <button onClick={() => handleSocialAuth('Apple')} className="social-btn">
                        <Apple className="text-white" />
                        <span className="text-[10px] uppercase font-bold tracking-tight">Apple</span>
                    </button>
                    <button onClick={() => handleSocialAuth('Microsoft')} className="social-btn">
                        <Monitor className="text-[#00A4EF]" />
                        <span className="text-[10px] uppercase font-bold tracking-tight">Microsoft</span>
                    </button>
                </div>

                <div className="divider-container">or continue with email</div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="relative">
                        <UserPlus className="absolute left-3 top-4.5 text-text-dim w-6 h-6" />
                        <input
                            type="text"
                            placeholder="Username"
                            className="input-field pl-12"
                            required
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-4.5 text-text-dim w-6 h-6" />
                        <input
                            type="email"
                            placeholder="E-mail"
                            className="input-field pl-12"
                            required
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <Phone className="absolute left-3 top-4.5 text-text-dim w-6 h-6" />
                        <input
                            type="text"
                            placeholder="Phone Number"
                            className="input-field pl-12"
                            required
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                        Open Account
                    </button>

                    <p className="text-center text-text-dim text-sm mt-4">
                        Already have an account? <Link to="/login" className="text-gold-primary hover:underline">Login here</Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default Register;
