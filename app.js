require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const apiRoutes = require("./routes/api");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("<h1>Backend FullSnack Berhasil Berjalan</h1>");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server FULLSNACK berjalan di http://localhost:${PORT}`);
});
