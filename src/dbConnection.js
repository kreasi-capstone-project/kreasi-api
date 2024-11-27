const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kreasi',
    waitForConnections: true,
    connectionLimit: 10,       // Huruf "L" besar pada connectionLimit
    queueLimit: 0,             // Huruf "L" besar pada queueLimit
    enableKeepAlive: true,     // CamelCase pada enableKeepAlive
    keepAliveInitialDelay: 0   // Tetap valid
});

module.exports = connection;
