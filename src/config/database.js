
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const caPath = path.join(__dirname, "../../certs/ca.pem");

let caCertificate = process.env.DB_SSL_CA;

if (caCertificate) {
  caCertificate = caCertificate.replace(/\\n/g, "\n");
} else if (fs.existsSync(caPath)) {
  caCertificate = fs.readFileSync(caPath, "utf8");
}

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "kulinerhub_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

if (caCertificate) {
  dbConfig.ssl = {
    ca: caCertificate,
    rejectUnauthorized: true,
  };
}

const pool = mysql.createPool(dbConfig);

module.exports = pool;
