const db = require('./src/config/db');

async function testInsert() {
    try {
        console.log('Testing Insert...');
        const [result] = await db.execute(
            'INSERT INTO KodUser (username, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
            ['test_user_' + Date.now(), 'test' + Date.now() + '@example.com', 'password123', '1234567890', 'Customer']
        );
        console.log('✅ INSERT SUCCESSful, UID:', result.insertId);

        // Clean up
        await db.execute('DELETE FROM KodUser WHERE uid = ?', [result.insertId]);
        console.log('✅ CLEANUP SUCCESSful');

    } catch (err) {
        console.error('❌ INSERT FAILED:', err.message);
        console.error('Error Code:', err.code);
    } finally {
        process.exit();
    }
}

testInsert();
