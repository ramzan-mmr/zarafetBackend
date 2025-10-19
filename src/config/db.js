const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const config = require('./env');

// Create connection pool
const pool = mysql.createPool({
  host: config.db.host,
  // port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  connectionLimit: config.db.connectionLimit,
  charset: 'utf8mb4'
});

// Logging function to write to log.txt
const logToFile = (message) => {
  try {
    const logPath = path.join(__dirname, 'log.txt');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logPath, logEntry);
  } catch (logError) {
    console.error('Failed to write to log file:', logError.message);
  }
};

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    const errorMessage = `❌ Database connection failed: ${error.message}`;
    console.error(errorMessage);
    logToFile(error);
    process.exit(1);
  }
};

// Initialize connection
testConnection();

module.exports = pool;

// db = vahohytv_zarafet_db
// password = QTp^.!xVq%rX
// user = vahohytv_root

