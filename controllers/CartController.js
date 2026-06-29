const db = require("../config/database");

const CartController = {
  index: (req, res) => {
    const id_user = req.user.id;

    const query = `
      SELECT
        cart.id_cart,
        products.nama,
        products.harga,
        products.stok,
        cart.quantity,
        cart.status,
        products.id_product
      FROM cart
      INNER JOIN products
        ON cart.product_id = products.id_product
      WHERE cart.id_user = ? AND cart.status = 'aktif'
    `;

    db.query(query, [id_user], (err, results) => {
      if (err) {
        console.error("Gagal ambil data keranjang:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    });
  },

  store: (req, res) => {
    const id_user = req.user.id;
    const { id_product, quantity } = req.body;
    const jumlahItem = quantity || 1;

    if (!id_product) {
      return res
        .status(400)
        .json({ message: "Properti id_product wajib dikirimkan." });
    }

    db.query(
      "SELECT * FROM products WHERE id_product = ?",
      [id_product],
      (err, results) => {
        if (err || results.length === 0) {
          return res.status(404).json({ message: "Produk tidak ditemukan." });
        }

        const product = results[0];

        if (product.stok < jumlahItem) {
          return res
            .status(400)
            .json({
              message: `Stok tidak cukup. Stok tersedia: ${product.stok}`,
            });
        }

        db.query(
          "SELECT * FROM cart WHERE product_id = ? AND id_user = ? AND status = 'aktif'",
          [id_product, id_user],
          (err, cartItems) => {
            if (err) return res.status(500).json({ error: err.message });

            if (cartItems.length > 0) {
              const newQty = cartItems[0].quantity + jumlahItem;
              if (newQty > product.stok) {
                return res
                  .status(400)
                  .json({
                    message: `Stok tidak cukup. Stok tersedia: ${product.stok}`,
                  });
              }
              db.query(
                "UPDATE cart SET quantity = quantity + ? WHERE product_id = ? AND id_user = ? AND status = 'aktif'",
                [jumlahItem, id_product, id_user],
                (err) => {
                  if (err) return res.status(500).json({ error: err.message });
                  res.json({
                    message: "Jumlah produk di keranjang berhasil diperbarui.",
                  });
                },
              );
            } else {
              db.query(
                "INSERT INTO cart (id_user, product_id, quantity, status) VALUES (?, ?, ?, 'aktif')",
                [id_user, id_product, jumlahItem],
                (err) => {
                  if (err) return res.status(500).json({ error: err.message });
                  res.json({
                    message: "Produk berhasil ditambahkan ke keranjang.",
                  });
                },
              );
            }
          },
        );
      },
    );
  },

  destroy: (req, res) => {
    const id_user = req.user.id;
    const id_cart = req.params.id;

    db.query(
      "DELETE FROM cart WHERE id_cart = ? AND id_user = ?",
      [id_cart, id_user],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Item berhasil dihapus dari keranjang." });
      },
    );
  },

  checkout: (req, res) => {
    const id_user = req.user.id;
    const { total_harga, alamat } = req.body;

    // Ambil semua item keranjang user
    const getCartQuery = `
      SELECT cart.product_id, cart.quantity, products.stok, products.nama
      FROM cart
      INNER JOIN products ON cart.product_id = products.id_product
      WHERE cart.id_user = ? AND cart.status = 'aktif'
    `;

    db.query(getCartQuery, [id_user], (err, cartItems) => {
      if (err) return res.status(500).json({ error: err.message });

      // Cek apakah stok cukup untuk semua item
      for (const item of cartItems) {
        if (item.quantity > item.stok) {
          return res.status(400).json({
            message: `Stok ${item.nama} tidak cukup. Stok tersedia: ${item.stok}`,
          });
        }
      }

      // Buat order
      const queryOrder =
        "INSERT INTO orders (id_user, total_harga, alamat, status) VALUES (?, ?, ?, 'selesai')";

      db.query(queryOrder, [id_user, total_harga, alamat], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Kurangi stok setiap produk
        const updateStokPromises = cartItems.map((item) => {
          return new Promise((resolve, reject) => {
            db.query(
              "UPDATE products SET stok = stok - ? WHERE id_product = ?",
              [item.quantity, item.product_id],
              (err) => {
                if (err) reject(err);
                else resolve();
              },
            );
          });
        });

        Promise.all(updateStokPromises)
          .then(() => {
            // Update status cart jadi checkout
            db.query(
              "UPDATE cart SET status = 'checkout' WHERE id_user = ? AND status = 'aktif'",
              [id_user],
              (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(200).json({ message: "Checkout berhasil." });
              },
            );
          })
          .catch((err) => {
            res.status(500).json({ error: err.message });
          });
      });
    });
  },
};

module.exports = CartController;
