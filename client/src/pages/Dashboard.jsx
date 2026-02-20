import React, { useState } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, LogOut, TrendingUp, ShieldCheck, Home } from 'lucide-react';

const Dashboard = ({ user }) => {
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const checkBalance = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('http://localhost:5000/api/bank/balance');
            setBalance(res.data.balance);

            // Trigger the "Wonderful background animation" (Party Popper)
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                // since particles fall down, start a bit higher than random
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

        } catch (err) {
            setError('Verification failed');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await axios.post('http://localhost:5000/api/auth/logout');
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen p-8 max-w-6xl mx-auto">
            {/* Header */}
            <header className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                    <div className="relative flex items-center justify-center">
                        <ShieldCheck className="text-gold-primary w-12 h-12" />
                        <Home className="absolute text-gold-primary w-4 h-4 mb-0.5" />
                        <div className="absolute inset-0 bg-gold-primary/20 blur-xl rounded-full"></div>
                    </div>
                    <div>
                        <h2 className="text-gold-primary text-xs font-bold tracking-widest uppercase">Member Dashboard</h2>
                        <h1 className="text-4xl font-extrabold italic">Welcome, {user.username}</h1>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-text-dim hover:text-white transition-colors"
                >
                    <LogOut size={20} />
                    <span>Secure Exit</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Balance Card */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="glass md:col-span-2 p-10 flex flex-col justify-between relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Wallet size={120} className="text-gold-primary" />
                    </div>

                    <div>
                        <div className="flex items-center gap-2 text-gold-primary mb-4">
                            <ShieldCheck size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest">Secured Account</span>
                        </div>
                        <h3 className="text-text-dim mb-2">Vault Value</h3>

                        <AnimatePresence mode="wait">
                            {balance !== null ? (
                                <motion.div
                                    key="balance"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex flex-col gap-2"
                                >
                                    <span className="text-6xl font-black font-outfit tracking-tighter">
                                        ${Number(balance).toLocaleString()}
                                    </span>
                                    <p className="text-green-400 text-sm font-medium">your balance is : ${Number(balance).toLocaleString()}</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="placeholder"
                                    className="text-6xl font-black font-outfit opacity-20 tracking-tighter"
                                >
                                    $ ••••••••
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-12 flex items-center gap-4">
                        <button
                            onClick={checkBalance}
                            disabled={loading}
                            className="gold-btn px-10 py-4 text-lg"
                        >
                            {loading ? 'Verifying...' : 'Check Balance'}
                        </button>
                        {error && <span className="text-red-400 text-sm">{error}</span>}
                    </div>
                </motion.div>

                {/* Info Card */}
                <div className="glass p-8 flex flex-col gap-6">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <TrendingUp className="text-gold-primary mb-2" />
                        <h4 className="font-bold">Market Update</h4>
                        <p className="text-text-dim text-sm">Your assets have increased by 2.4% this week.</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="w-12 h-12 rounded-full border-2 border-gold-primary flex items-center justify-center mb-2 font-bold text-gold-primary">
                            98
                        </div>
                        <h4 className="font-bold">Trust Score</h4>
                        <p className="text-text-dim text-sm">High reliability status confirmed.</p>
                    </div>
                </div>
            </div>

            {/* Background elements */}
            <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-primary/2 rounded-full blur-[120px] pointer-events-none" />
        </div>
    );
};

export default Dashboard;
