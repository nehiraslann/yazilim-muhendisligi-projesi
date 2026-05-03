import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import authRoutes from "./src/routes/authRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import outfitRoutes from "./src/routes/outfitRoutes.js";
import recommendationRoutes from "./src/routes/recommendationRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import { errorHandler } from "./src/middlewares/errorMiddleware.js";
import { initializeDatabase } from "./src/config/initDatabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "src/data/images")));

app.use(
  "/images_2",
  (req, res, next) => {
    const decodePath = decodeURI(req.path);
    const exactPath = path.join(__dirname, "src/data/images_2", decodePath);

    if (!fs.existsSync(exactPath) && exactPath.endsWith(".jpg") && fs.existsSync(`${exactPath}.jpg`)) {
      return res.sendFile(`${exactPath}.jpg`);
    }

    next();
  },
  express.static(path.join(__dirname, "src/data/images_2")),
);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/outfits", outfitRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("StyleAI Backend is running!");
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Veritabani baglantisi veya hazirligi basarisiz oldugu icin uygulama baslatilamadi.");
    console.error(error);
    process.exit(1);
  }
};

startServer();
