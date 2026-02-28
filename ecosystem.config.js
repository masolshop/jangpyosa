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
        APICK_PROVIDER: "real",
        APICK_API_KEY: "YOUR_APICK_API_KEY_HERE"
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
