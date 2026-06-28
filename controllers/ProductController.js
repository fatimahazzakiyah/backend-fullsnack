const db = require("../config/database");

class ProductController {
  async index(req, res) {
    const query = "SELECT * FROM products";
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json(results);
    });
  }

  async show(req, res) {
    const { id } = req.params;
    db.query(
      "SELECT * FROM products WHERE id_product = ?",
      [id],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0)
          return res.status(404).json({ message: "Produk tidak ditemukan." });
        res.status(200).json({ data: results[0] });
      },
    );
  }

  async store(req, res) {
    const { nama, harga, stok } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!nama || !harga || !stok) {
      return res
        .status(400)
        .json({ message: "Semua kolom (nama, harga, stok) wajib diisi." });
    }

    const query =
      "INSERT INTO products (nama, harga, stok, image) VALUES (?, ?, ?, ?)";
    db.query(query, [nama, harga, stok, image], (err, result) => {
      if (err) {
        console.error("Error DB:", err);
        return res
          .status(500)
          .json({ message: "Gagal menambahkan produk.", error: err });
      }
      res
        .status(201)
        .json({ message: "Produk berhasil ditambahkan.", id: result.insertId });
    });
  }

  async destroy(req, res) {
    const { id } = req.params;
    db.query("DELETE FROM products WHERE id_product = ?", [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json({ message: "Produk berhasil dihapus." });
    });
  }

  async update(req, res) {
    const { id } = req.params;
    const { stok } = req.body;
    db.query(
      "UPDATE products SET stok = ? WHERE id_product = ?",
      [stok, id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Stok berhasil diperbarui." });
      },
    );
  }
}

module.exports = new ProductController();
