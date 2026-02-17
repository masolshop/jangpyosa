import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET ?? "dev_secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "dev_refresh",
  apickProvider: (process.env.APICK_PROVIDER ?? "mock") as "mock" | "real",
  apickApiKey: process.env.APICK_API_KEY ?? "",
};
