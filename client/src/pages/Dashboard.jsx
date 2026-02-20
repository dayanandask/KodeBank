import React, { useState } from 'react';
import api from '../services/api';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, LogOut, TrendingUp, ShieldCheck, Home,
    ArrowUpRight, ArrowDownLeft, History, Settings,
    Key, Phone, Mail, User, ShieldAlert, Lock
} from 'lucide-react';

const Dashboard = ({ user }) => {
    const [balance, setBalance] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ledgerLoading, setLedgerLoading] = useState(true);
    const [error, setError] = useState('');
    const [showSecurity, setShowSecurity] = useState(false);
    const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '' });
    const [pwdStatus, setPwdStatus] = useState({ type: '', msg: '' });

    const fetchTransactions = async () => {
        setLedgerLoading(true);
        try {
            const res = await api.get('/api/bank/transactions');
            setTransactions(res.data);
        } catch (err) {
            console.error('Failed to fetch transactions');
        } finally {
            setLedgerLoading(false);
        }
    };

    React.useEffect(() => {
        fetchTransactions();
    }, []);

    const checkBalance = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/api/bank/balance');
            setBalance(res.data.balance);

            // Refresh ledger to show the new "Security Verification" entry
            await fetchTransactions();
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

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPwdStatus({ type: 'loading', msg: 'Updating vault credentials...' });
        try {
            await api.post('/api/auth/change-password', pwdData);
            setPwdStatus({ type: 'success', msg: 'Security key rotated successfully!' });
            setPwdData({ currentPassword: '', newPassword: '' });
            setTimeout(() => setPwdStatus({ type: '', msg: '' }), 3000);
        } catch (err) {
            setPwdStatus({ type: 'error', msg: err.response?.data?.error || 'Update failed' });
        }
    };

    const handleLogout = async () => {
        await api.post('/api/auth/logout');
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
                    className="flex items-center gap-2 text-red-400 hover:text-white bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 hover:border-red-500/50 transition-all font-bold shadow-lg shadow-red-500/5"
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

            {/* Path 2: Transaction Ledger */}
            <div className="mt-12">
                <div className="flex items-center gap-3 mb-6">
                    <History className="text-gold-primary" />
                    <h2 className="text-2xl font-bold italic">Recent Activity</h2>
                </div>

                <div className="glass overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gold-primary text-xs uppercase tracking-widest font-bold">
                                <tr>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transactions.length > 0 ? (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${tx.type === 'Credit' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                        {tx.type === 'Credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                                    </div>
                                                    <span className="font-medium">{tx.type}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-text-dim group-hover:text-white transition-colors">{tx.description}</td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 rounded-full bg-gold-primary/10 text-gold-primary text-[10px] font-bold uppercase">
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className={`p-4 text-right font-bold ${tx.type === 'Credit' ? 'text-green-400' : 'text-white'}`}>
                                                {tx.type === 'Credit' ? '+' : '-'}${Number(tx.amount).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="p-10 text-center text-text-dim italic">
                                            {ledgerLoading ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-gold-primary border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Initializing secure ledger...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 py-4">
                                                    <ShieldCheck className="opacity-20 w-8 h-8 mb-2" />
                                                    <span className="text-gold-primary/50 text-sm">No recent activity detected in your vault.</span>
                                                    <span className="text-[10px] uppercase tracking-widest opacity-30 mt-1">Registry is currently empty</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Path 3: Advanced Security Sub-Panel */}
            <div className="mt-12 mb-12">
                <button
                    onClick={() => setShowSecurity(!showSecurity)}
                    className="flex items-center gap-3 bg-gradient-to-r from-black/60 to-gold-primary/30 border border-gold-primary/50 px-8 py-4 rounded-full text-gold-primary hover:text-white hover:scale-105 transition-all font-black uppercase tracking-tighter group shadow-2xl shadow-gold-primary/20"
                >
                    <Settings className={`transition-transform duration-700 ${showSecurity ? 'rotate-180' : 'group-hover:rotate-90'}`} />
                    <span>{showSecurity ? 'Seal Security Vault' : 'Access Specialized Security Vault'}</span>
                </button>

                <AnimatePresence>
                    {showSecurity && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="glass p-8 border-l-4 border-l-gold-primary">
                                    <div className="flex items-center gap-3 mb-6 font-bold uppercase tracking-tighter text-gold-primary">
                                        <ShieldAlert size={20} />
                                        <span>Authentication Profile</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 text-text-dim text-sm">
                                            <User size={16} className="text-gold-primary/50" />
                                            <span>UID: ELITE-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-text-dim text-sm">
                                            <Mail size={16} className="text-gold-primary/50" />
                                            <span>{user.email || 'Encrypted'}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-text-dim text-sm">
                                            <Phone size={16} className="text-gold-primary/50" />
                                            <span>{user.phone || 'Private'}</span>
                                        </div>
                                        <button className="gold-btn w-full mt-4 text-sm py-3 opacity-50 cursor-not-allowed">
                                            Request Data Export
                                        </button>
                                    </div>
                                </div>

                                <div className="glass p-8 border-l-4 border-l-gold-primary">
                                    <div className="flex items-center gap-3 mb-6 font-bold uppercase tracking-tighter text-gold-primary">
                                        <Key size={20} />
                                        <span>Security Protocol Upgrade</span>
                                    </div>
                                    <form onSubmit={handlePasswordChange} className="space-y-4">
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3.5 text-text-dim w-4 h-4" />
                                            <input
                                                type="password"
                                                placeholder="Current Password"
                                                className="input-field pl-10 text-sm py-3"
                                                required
                                                value={pwdData.currentPassword}
                                                onChange={(e) => setPwdData({ ...pwdData, currentPassword: e.target.value })}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Key size={16} className="absolute left-3 top-3.5 text-text-dim w-4 h-4" />
                                            <input
                                                type="password"
                                                placeholder="New Security Key"
                                                className="input-field pl-10 text-sm py-3"
                                                required
                                                value={pwdData.newPassword}
                                                onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                                            />
                                        </div>

                                        {pwdStatus.msg && (
                                            <p className={`text-xs text-center font-bold uppercase tracking-widest ${pwdStatus.type === 'success' ? 'text-green-400' :
                                                pwdStatus.type === 'error' ? 'text-red-400' : 'text-gold-primary'
                                                }`}>
                                                {pwdStatus.msg}
                                            </p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={pwdStatus.type === 'loading'}
                                            className="gold-btn w-full text-sm py-3"
                                        >
                                            {pwdStatus.type === 'loading' ? 'Encrypting...' : 'Rotate Security Key'}
                                        </button>
                                    </form>
                                    <div className="mt-6 pt-4 border-t border-white/5">
                                        <div className="flex justify-between items-center text-[10px] tracking-widest font-bold opacity-50">
                                            <span>2FA PROTOCOL</span>
                                            <span className="text-green-400">ACTIVE</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Background elements */}
            <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-gold-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-primary/2 rounded-full blur-[120px] pointer-events-none" />
        </div>
    );
};

export default Dashboard;
