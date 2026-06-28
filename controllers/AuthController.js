const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../middleware/authMiddleware");

const AuthController = {
  register: async (req, res) => {
    try {
      const { nama, email, password } = req.body;

      if (!nama || !email || !password) {
        return res.status(400).json({ message: "Semua kolom wajib diisi." });
      }

      const checkQuery = "SELECT * FROM users WHERE email = ?";
      db.query(checkQuery, [email.trim()], async (err, results) => {
        if (err) {
          console.error("Error cek email:", err);
          return res.status(500).json({ message: "Gagal mengecek database." });
        }

        if (results.length > 0) {
          return res.status(400).json({ message: "Email sudah terdaftar." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const insertQuery =
          "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)";

        db.query(
          insertQuery,
          [nama, email.trim(), hashedPassword, "user"],
          (err, result) => {
            if (err) {
              console.error("Error simpan user:", err);
              return res.status(500).json({ message: "Gagal menyimpan user." });
            }
            return res.status(201).json({
              message: "Registrasi berhasil.",
              userId: result.insertId,
            });
          },
        );
      });
    } catch (error) {
      console.error("Register Error:", error);
      return res.status(500).json({ message: "Internal Server Error." });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email dan password wajib diisi." });
      }

      const query = "SELECT * FROM users WHERE email = ?";
      db.query(query, [email.trim()], async (err, results) => {
        if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ message: "Database error." });
        }

        if (results.length === 0) {
          return res
            .status(401)
            .json({ message: "Email atau password salah." });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res
            .status(401)
            .json({ message: "Email atau password salah." });
        }

        const token = jwt.sign(
          {
            id: user.id_user,
            nama: user.nama,
            email: user.email,
            role: user.role,
          },
          SECRET_KEY,
          { expiresIn: "8h" },
        );

        return res.status(200).json({
          message: `Selamat datang kembali, ${user.nama}.`,
          token: token,
          user: {
            id: user.id_user,
            nama: user.nama,
            email: user.email,
            role: user.role,
          },
        });
      });
    } catch (error) {
      console.error("Login Error:", error);
      return res.status(500).json({ message: "Terjadi kesalahan sistem." });
    }
  },
};

module.exports = AuthController;
