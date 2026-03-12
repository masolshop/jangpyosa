import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ES 모듈에서 __dirname 사용
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 프로젝트 루트의 .env 파일 로드
dotenv.config({ path: path.join(__dirname, "../../../.env") });

export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET ?? "dev_secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "dev_refresh",
  apickApiKey: process.env.APICK_API_KEY ?? "",
};
