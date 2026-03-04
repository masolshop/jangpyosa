module.exports = {
  apps: [
    {
      name: "jangpyosa-api",
      cwd: "/home/ubuntu/jangpyosa/apps/api",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
        CORS_ORIGIN: "https://jangpyosa.com",
        DATABASE_URL: process.env.DATABASE_URL || "postgresql://jp:jp_pw@localhost:5432/jangpyosa?schema=public",
        JWT_SECRET: process.env.JWT_SECRET || "change_me_super_secret_jangpyosa_2026",
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "change_me_refresh_secret_jangpyosa_2026",
        APICK_PROVIDER: "real",
        APICK_API_KEY: "41173030f4fc1055778b2f97ce9659b5"
      },
      max_memory_restart: "500M",
      error_file: "/home/ubuntu/.pm2/logs/jangpyosa-api-error.log",
      out_file: "/home/ubuntu/.pm2/logs/jangpyosa-api-out.log"
    },
    {
      name: "jangpyosa-web",
      cwd: "/home/ubuntu/jangpyosa/apps/web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3003",
      env: {
        NODE_ENV: "production",
        API_BASE: "http://localhost:4000",
        NEXT_PUBLIC_API_BASE: "https://jangpyosa.com:4000"
      },
      max_memory_restart: "500M",
      error_file: "/home/ubuntu/.pm2/logs/jangpyosa-web-error.log",
      out_file: "/home/ubuntu/.pm2/logs/jangpyosa-web-out.log"
    }
  ]
};
