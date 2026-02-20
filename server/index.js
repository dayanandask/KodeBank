const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./src/config/db');

const app = express();

// --- Security Audit Logging ---
const logSecurityEvent = async (event, uid, details) => {
    console.log(`[SECURITY EVENT]: ${event} | UID: ${uid || 'N/A'} | Time: ${new Date().toISOString()} | Info: ${details}`);
    // In production, this would write to a 'SecurityAudit' table
};

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

const JWT_SECRET = process.env.JWT_SECRET || 'kodbank_secret_key_2026';

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

// --- Auth Routes ---

// 1. Register
app.post('/api/auth/register', async (req, res) => {
    // Safety check for placeholder password
    if (process.env.DB_PASSWORD === 'CLICK_TO:REVEAL_PASSWORD') {
        return res.status(500).json({ error: 'Config Error: Please enter your real Aiven password in server/.env' });
    }
    try {
        const { username, email, password, phone } = req.body;

        // As per image: role should be restricted to Customer for registration
        const role = 'Customer';
        const initialBalance = 100000.00;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            'INSERT INTO KodUser (username, email, password, phone, balance, role) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, hashedPassword, phone, initialBalance, role]
        );

        await logSecurityEvent('USER_REGISTRATION', result.insertId, `Username: ${username}`);

        // Seed initial transactions for 'Elite Circle' feel
        const initialTransactions = [
            ['Credit', 100000.00, 'Initial Vault Loading', result.insertId],
            ['Debit', 500.00, 'Elite Membership Activation', result.insertId],
            ['Credit', 1200.50, 'Dividends - Global Tech Fund', result.insertId]
        ];

        for (const tx of initialTransactions) {
            await db.execute(
                'INSERT INTO KodTransaction (type, amount, description, uid) VALUES (?, ?, ?, ?)',
                tx
            );
        }

        res.status(201).json({ message: 'Registration successful', uid: result.insertId });
    } catch (error) {
        console.error('--- REGISTRATION ERROR DETAILS ---');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
        console.error('Stack:', error.stack);

        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            return res.status(500).json({ error: 'Database Access Denied. Check server/.env password.' });
        }
        if (error.code === 'ECONNREFUSED' || error.message.includes('protocol')) {
            return res.status(500).json({ error: 'Database connection failed. Is the password correct?' });
        }
        res.status(500).json({ error: 'Registration failed. Username/Email might exist or DB is unconfigured.' });
    }
});

// 2. Login
app.post('/api/auth/login', async (req, res) => {
    // Safety check for placeholder password
    if (process.env.DB_PASSWORD === 'CLICK_TO:REVEAL_PASSWORD') {
        return res.status(500).json({ error: 'Config Error: Please enter your real Aiven password in server/.env' });
    }
    try {
        const { username, password } = req.body;

        const [users] = await db.execute('SELECT * FROM KodUser WHERE username = ?', [username]);

        if (users.length === 0) {
            await logSecurityEvent('LOGIN_FAILURE', null, `Unknown username: ${username}`);
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            await logSecurityEvent('LOGIN_FAILURE_WRONG_PASSWORD', user.uid, `Username: ${username}`);
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Generate JWT (Subject: username, Claim: role)
        const token = jwt.sign(
            { role: user.role },
            JWT_SECRET,
            { subject: user.username, expiresIn: '1h' }
        );

        // Store token in DB table (UserToken)
        const expairy = new Date(Date.now() + 3600000); // 1 hour from now
        await db.execute(
            'INSERT INTO UserToken (token, uid, expairy) VALUES (?, ?, ?)',
            [token, user.uid, expairy]
        );

        // Add token as cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            sameSite: 'lax',
            maxAge: 3600000
        });

        await logSecurityEvent('LOGIN_SUCCESS', user.uid, `Role: ${user.role}`);

        res.json({ message: 'Login successful', role: user.role, username: user.username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// 3. Check Balance (Protected)
app.get('/api/bank/balance', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.execute('SELECT uid, balance FROM KodUser WHERE username = ?', [req.user.sub]);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });

        const uid = users[0].uid;

        // Log the security event
        await logSecurityEvent('BALANCE_CHECK', uid, `Username: ${req.user.sub}`);

        // Record this in the transaction ledger for the UI
        await db.execute(
            'INSERT INTO KodTransaction (type, amount, description, uid, status) VALUES (?, ?, ?, ?, ?)',
            ['Credit', 0.00, 'Security Verification: Vault Value Checked', uid, 'Completed']
        );

        res.json({ balance: users[0].balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
});

// 4. Transactions (Protected)
app.get('/api/bank/transactions', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.execute('SELECT uid FROM KodUser WHERE username = ?', [req.user.sub]);
        if (users.length === 0) return res.json([]); // Return empty if user not in DB (social mock)

        const [transactions] = await db.execute(
            'SELECT * FROM KodTransaction WHERE uid = ? ORDER BY created_at DESC LIMIT 10',
            [users[0].uid]
        );
        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// 5. User Profile (Protected)
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT username, email, phone, role, balance, (SELECT COUNT(*) FROM KodTransaction WHERE uid = u.uid) as tx_count FROM KodUser u WHERE username = ?',
            [req.user.sub]
        );
        if (users.length === 0) {
            return res.json({ username: req.user.sub, role: 'Guest', balance: 0 });
        }
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// 6. Change Password (Protected)
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const [users] = await db.execute('SELECT * FROM KodUser WHERE username = ?', [req.user.sub]);
        const user = users[0];

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: 'Invalid current password' });

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await db.execute('UPDATE KodUser SET password = ? WHERE uid = ?', [hashedNewPassword, user.uid]);

        await logSecurityEvent('PASSWORD_CHANGE_SUCCESS', user.uid, `Username: ${user.username}`);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Password update failed' });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

// Test DB Connection on startup
db.query('SELECT 1').then(() => {
    console.log('✅ Database connection verified successfully');
}).catch(err => {
    console.error('❌ Database connection failed at startup:', err.message);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
