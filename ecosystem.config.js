require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'jangpyosa-api',
      script: './apps/api/dist/index.js',
      cwd: '/home/ubuntu/jangpyosa',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 4000,
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        APICK_API_KEY: process.env.APICK_API_KEY,
        CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://jangpyosa.com'
      }
    },
    {
      name: 'jangpyosa-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3003',
      cwd: '/home/ubuntu/jangpyosa/apps/web',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
        NEXT_PUBLIC_API_BASE: '/api'
      }
    }
  ]
};
