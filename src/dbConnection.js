const mysql = require('mysql2/promise')
const dotenv = require('dotenv')

dotenv.config()

const connection = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || 'root',
	database: process.env.DB_NAME || 'kreasi',
	waitForConnections: true,
	connectionlimit: 10,
	queuelimit: 0,
	enablekeepalive: true,
	keepAliveInitialDelay: 0
})

module.exports = connection
