const mysql = require('mysql2');
require('dotenv').config();

console.log(`[DB CONFIG]: Attempting connection to ${process.env.DB_HOST} as ${process.env.DB_USER}`);

const fs = require('fs');
const path = require('path');

const sslConfig = {
    rejectUnauthorized: false // Safer for cloud environments like Render
};

// Only try to read the CA file if it exists to prevent crashing
const caPath = path.join(__dirname, '../../ca.pem');
if (fs.existsSync(caPath)) {
    sslConfig.ca = fs.readFileSync(caPath);
    sslConfig.rejectUnauthorized = true;
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: sslConfig
});

module.exports = pool.promise();
