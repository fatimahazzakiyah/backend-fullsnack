const jwt = require("jsonwebtoken");

const SECRET_KEY = "fullsnack_secret_key";

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Silakan login terlebih dahulu." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Token tidak valid atau sudah expired." });
  }
}

function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Akses ditolak. Hanya admin yang diizinkan." });
  }
  next();
}

function isUser(req, res, next) {
  if (!req.user || req.user.role !== "user") {
    return res
      .status(403)
      .json({ message: "Akses ditolak. Hanya user yang diizinkan." });
  }
  next();
}

module.exports = { verifyToken, isAdmin, isUser, SECRET_KEY };
