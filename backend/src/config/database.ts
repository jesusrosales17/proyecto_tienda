import mysql from "mysql2/promise";
import config from "./config.js";

const pool = mysql.createPool({
  host: config.dbHost,
  port: config.dbPort,
  user: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
  waitForConnections: true,
  // Keep the pool below typical shared-host limits (e.g. max_user_connections = 5).
  connectionLimit: Math.max(1, Math.min(config.dbConnectionLimit, 4)),
  queueLimit: 0,
});

export default pool;
