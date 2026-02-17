import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import catalogRoutes from "./routes/catalog.js";
import cartRoutes from "./routes/cart.js";
import calcRoutes from "./routes/calculators.js";
import contentRoutes from "./routes/content.js";
import supplierRoutes from "./routes/supplier.js";
import registryRoutes from "./routes/registry.js";
import publicRoutes from "./routes/public.js";
import productRoutes from "./routes/product.js";

export const prisma = new PrismaClient();

const app = express();
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get("/health", (_req, res) => res.json({ ok: true, service: "jangpyosa-api" }));

app.use("/public", publicRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/catalog", catalogRoutes);
app.use("/cart", cartRoutes);
app.use("/calculators", calcRoutes);
app.use("/content", contentRoutes);
app.use("/supplier", supplierRoutes);
app.use("/registry", registryRoutes);
app.use("/products", productRoutes);

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message || "INTERNAL_ERROR" });
});

app.listen(config.port, () => {
  console.log(`🚀 장표사닷컴 API listening on :${config.port}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL?.split("@")[1] || "local"}`);
  console.log(`🔐 APICK Provider: ${config.apickProvider}`);
});
