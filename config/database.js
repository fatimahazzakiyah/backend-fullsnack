const mysql = require("mysql2");

const connectionUrl = process.env.MYSQL_PUBLIC_URL;

let db;

if (connectionUrl) {
  db = mysql.createConnection(connectionUrl);
} else {
  db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "db_fullsnack",
    port: process.env.DB_PORT || 3306,
  });
}

db.connect((err) => {
  if (err) {
    console.error("Gagal koneksi ke database: " + err.message);
    return;
  }
  console.log("Terhubung ke Database.");
});

module.exports = db;
