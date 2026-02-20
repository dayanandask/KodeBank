const mysql = require('mysql2/promise');
require('dotenv').config();

const test = async () => {
    try {
        console.log('Testing connection with:');
        console.log('Host:', process.env.DB_HOST);
        console.log('User:', process.env.DB_USER);
        // Don't log full password, just first and last char
        const pwd = process.env.DB_PASSWORD;
        console.log('Password length:', pwd ? pwd.length : 'null');

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            ssl: {
                rejectUnauthorized: false
            }
        });
        console.log('SUCCESS: Connected to database');
        await connection.end();
    } catch (err) {
        console.error('ERROR:', err);
    }
};

test();
