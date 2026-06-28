const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/AuthController");
const ProductController = require("../controllers/ProductController");
const CartController = require("../controllers/CartController");
const OrderController = require("../controllers/OrderController");

const {
  verifyToken,
  isAdmin,
  isUser,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const validateFile = require("../middleware/fileValidation");

// Auth
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Products
router.get("/products", ProductController.index);
router.get("/products/:id", ProductController.show);
router.post(
  "/products",
  verifyToken,
  isAdmin,
  upload.single("image"),
  validateFile,
  ProductController.store,
);
router.delete("/products/:id", verifyToken, isAdmin, ProductController.destroy);
router.put("/products/:id", verifyToken, isAdmin, ProductController.update);

// Cart
router.get("/cart", verifyToken, isUser, CartController.index);
router.post("/cart", verifyToken, isUser, CartController.store);
router.delete("/cart/:id", verifyToken, isUser, CartController.destroy);
router.post("/cart/checkout", verifyToken, isUser, CartController.checkout);

// Orders
router.get("/orders", verifyToken, isUser, OrderController.index);

module.exports = router;
