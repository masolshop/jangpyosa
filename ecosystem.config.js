module.exports = {
  apps: [
    {
      name: "jangpyosa-api",
      cwd: "./apps/api",
      script: "npx",
      args: "tsx src/index.ts",
      env: {
        NODE_ENV: "production",
        PORT: "4000",
        CORS_ORIGIN: "https://jangpyosa.com",
        DATABASE_URL: "postgresql://jp:jp_pw@localhost:5432/jangpyosa?schema=public",
        JWT_SECRET: "change_me_super_secret_jangpyosa_2026",
        JWT_REFRESH_SECRET: "change_me_refresh_secret_jangpyosa_2026",
        APICK_PROVIDER: "real",
        APICK_API_KEY: "41173030f4fc1055778b2f97ce9659b5"
      }
    },
    {
      name: "jangpyosa-web",
      cwd: "./apps/web",
      script: "npx",
      args: "next start -p 3003 -H 127.0.0.1",
      env: {
        NODE_ENV: "production",
        API_BASE: "http://localhost:4000"
      }
    }
  ]
};
