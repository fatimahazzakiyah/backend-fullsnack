const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_fullsnack",
});

db.connect((err) => {
  if (err) {
    console.error("Gagal koneksi ke database: " + err.message);
    return;
  }
  console.log("Terhubung ke Database db_fullsnack.");
});

module.exports = db;
