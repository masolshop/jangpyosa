import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { getKSTNow } from "./utils/kst.js";

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
import reductionRoutes from "./routes/reduction.js";
import companiesRoutes from "./routes/companies.js";
import employeesRoutes from "./routes/employees.js";
import dashboardRoutes from "./routes/dashboard.js";
import contractsRoutes from "./routes/contracts.js";
import performancesRoutes from "./routes/performances.js";
import apickRoutes from "./routes/apick.js";
import attendanceRoutes from "./routes/attendance.js";
import announcementsRoutes from "./routes/announcements.js";
import quoteRoutes from "./routes/quote.js";
import teamRoutes from "./routes/team.js";
import workOrdersRoutes from "./routes/work-orders.js";
import notificationsRoutes from "./routes/notifications.js";

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
app.use("/reduction", reductionRoutes);
app.use("/companies", companiesRoutes);
app.use("/employees", employeesRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/contracts", contractsRoutes);
app.use("/apick", apickRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/announcements", announcementsRoutes);
app.use("/quotes", quoteRoutes);
app.use("/team", teamRoutes);
app.use("/work-orders", workOrdersRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/", performancesRoutes); // performances와 contracts 엔드포인트 모두 포함

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message || "INTERNAL_ERROR" });
});

app.listen(config.port, '127.0.0.1', async () => {
  console.log(`🚀 장표사닷컴 API listening on 127.0.0.1:${config.port}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL?.split("@")[1] || "local"}`);
  console.log(`🔐 APICK Provider: ${config.apickProvider}`);
  
  // 서버 시작 시 만료된 초대 코드 자동 정리 (한국 시간 기준)
  try {
    const kstNow = getKSTNow();
    const result = await prisma.teamInvitation.deleteMany({
      where: {
        expiresAt: { lt: kstNow },
        isUsed: false
      }
    });
    if (result.count > 0) {
      console.log(`🗑️  만료된 초대 코드 ${result.count}개 자동 삭제 완료 (한국 시간 기준)`);
    }
  } catch (error) {
    console.error('⚠️  만료된 초대 코드 정리 중 오류:', error);
  }
});
