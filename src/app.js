
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Untuk menjalankan backend secara lokal.
// Di Vercel, express.static tidak digunakan untuk menyajikan file.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Selamat datang di KulinerHub API!",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      users: "/api/users",
      categories: "/api/categories",
      stores: "/api/stores",
      products: "/api/products",
      orders: "/api/orders",
    },
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const db = require("./config/database");
    await db.query("SELECT 1");

    res.json({
      success: true,
      message: "API dan database berjalan.",
      data: { status: "ok" },
    });
  } catch (err) {
    console.error("Health check gagal:", err.message);

    res.status(503).json({
      success: false,
      message: "Database tidak tersedia.",
      data: { status: "unavailable" },
    });
  }
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/stores", require("./routes/storeRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// Route tidak ditemukan
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan.",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(400).json({
    success: false,
    message: err.message || "Terjadi kesalahan.",
  });
});

// Export untuk Vercel
module.exports = app;
