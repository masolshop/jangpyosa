import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { PrismaClient } from "@prisma/client";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import catalogRoutes from "./routes/catalog.js";
import cartRoutes from "./routes/cart.js";
import calcRoutes from "./routes/calculators.js";
import contentRoutes from "./routes/content.js";

export const prisma = new PrismaClient();

const app = express();
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "jangpyosa-api" }));

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/catalog", catalogRoutes);
app.use("/cart", cartRoutes);
app.use("/calculators", calcRoutes);
app.use("/content", contentRoutes);

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
