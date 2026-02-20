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
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));

const JWT_SECRET = process.env.JWT_SECRET || 'kodbank_secret_key_2026';

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
app.get('/api/bank/balance', async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        // Verify JWT
        const decoded = jwt.verify(token, JWT_SECRET);

        // Fetch balance from KodUser using username (subject) from token
        const [users] = await db.execute('SELECT balance FROM KodUser WHERE username = ?', [decoded.sub]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ balance: users[0].balance });
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
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
