import express from "express";
import cors from "cors";
import compression from "compression";
import { config } from "./config.js";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { getKSTNow } from "./utils/kst.js";
import { createPrismaWithMonitoring, startPerformanceReporting } from "./lib/prisma-monitoring.js";

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
import leaveRoutes from "./routes/leave.js";
import annualLeaveRoutes from "./routes/annual-leave.js";
import salesRoutes from "./routes/sales.js";
import referralRoutes from "./routes/referral.js";
import salesAuthRoutes from "./routes/sales-auth.js";
import superAdminRoutes from "./routes/super-admin.js";

// Prisma Client with monitoring
export const prisma = createPrismaWithMonitoring();
startPerformanceReporting(prisma);

const app = express();

// CORS 설정
app.use(cors({ origin: config.corsOrigin, credentials: true }));

// Compression 미들웨어 (응답 압축)
app.use(compression({
  level: 6, // 압축 레벨 (0-9, 6이 기본값이자 최적값)
  threshold: 1024, // 1KB 이상만 압축
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

app.use(express.json({ limit: "2mb" }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get("/health", (_req, res) => res.json({ ok: true, service: "jangpyosa-api" }));

app.use("/public", publicRoutes);
app.use("/", superAdminRoutes); // 슈퍼어드민 생성 엔드포인트
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
app.use("/leave", leaveRoutes);
app.use("/annual-leave", annualLeaveRoutes);
app.use("/sales/auth", salesAuthRoutes);
app.use("/sales", salesRoutes);
app.use("/referral", referralRoutes);
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
  
  // 근태 스케줄러 시작
  try {
    const { startAttendanceSchedulers } = await import('./schedulers/attendanceScheduler.js');
    startAttendanceSchedulers();
  } catch (error) {
    console.error('⚠️  근태 스케줄러 시작 실패:', error);
  }
  
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
