const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");

dotenv.config();

//membuat server express
const app = express();

app.use(cors());
//supaya dapat membaca json di request body
app.use(express.json());

// Agar file gambar di folder uploads bisa diakses melalui URL
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({
    message: "S1TI Library API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

//agar connect ke MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });