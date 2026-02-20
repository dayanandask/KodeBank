const mysql = require('mysql2/promise');
require('dotenv').config();

const initDB = async () => {
    let connection;
    try {
        console.log('--- Kodbank Database Initializer ---');
        console.log(`Connecting to: ${process.env.DB_HOST}`);

        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            ssl: {
                rejectUnauthorized: false
            },
            multipleStatements: true
        });

        console.log('✅ Connected to Aiven MySQL');

        const schema = `
        CREATE TABLE IF NOT EXISTS KodUser (
            uid INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            balance DECIMAL(15, 2) DEFAULT 100000.00,
            phone VARCHAR(20),
            role ENUM('Customer', 'Manager', 'Admin') DEFAULT 'Customer'
        );

        CREATE TABLE IF NOT EXISTS UserToken (
            tid INT AUTO_INCREMENT PRIMARY KEY,
            token TEXT NOT NULL,
            uid INT NOT NULL,
            expairy DATETIME NOT NULL,
            FOREIGN KEY (uid) REFERENCES KodUser(uid) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS KodTransaction (
            id INT AUTO_INCREMENT PRIMARY KEY,
            uid INT NOT NULL,
            type ENUM('Credit', 'Debit') NOT NULL,
            amount DECIMAL(15, 2) NOT NULL,
            description VARCHAR(255),
            status ENUM('Completed', 'Pending', 'Flagged') DEFAULT 'Completed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (uid) REFERENCES KodUser(uid) ON DELETE CASCADE
        );
        `;

        console.log('🔧 Creating tables...');
        await connection.query(schema);
        console.log('✅ Tables created/verified successfully!');

    } catch (error) {
        console.error('❌ Failed to initialize database:');
        console.error(error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n💡 HINT: Check your password in server/.env. You currently have "CLICK_TO:REVEAL_PASSWORD". Replace it with your actual Aiven password.');
        }
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
};

initDB();
