const db = require("../config/database");

const OrderController = {
  index: (req, res) => {
    const id_user = req.user.id;

    const query = `
      SELECT * FROM orders
      WHERE id_user = ?
      ORDER BY created_at DESC
    `;

    db.query(query, [id_user], (err, results) => {
      if (err) {
        console.error("Gagal ambil riwayat:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    });
  },
};

module.exports = OrderController;
