const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

const dbConfig = {
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'secret',
    database: process.env.DB_NAME || 'project2'
};

const pool = mysql.createPool(dbConfig);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Create table if not exists
const initDB = async () => {
    try {
        const connection = await pool.getConnection();
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                login_time DATETIME NOT NULL
            )
        `);
        connection.release();
    } catch (error) {
        console.error('Database initialization error:', error);
    }
};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/login', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('INSERT INTO users SET ?', {
            username: req.body.username,
            login_time: new Date()
        });
        connection.release();
        res.redirect('/welcome');
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Database error: ' + error.message);
    }
});

app.get('/welcome', (req, res) => {
    res.sendFile(__dirname + '/public/welcome.html');
});

// Initialize database on startup
initDB().then(() => {
    app.listen(3000, '0.0.0.0', () => {
        console.log('Server running on port 3000');
    });    
});