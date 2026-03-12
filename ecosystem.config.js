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
        PORT: 4000,
        CORS_ORIGIN: 'https://jangpyosa.com',
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://jangpyosa_user:장표사2024!@localhost:5432/jangpyosa_db',
        JWT_SECRET: process.env.JWT_SECRET || 'jangpyosa_jwt_secret_2024_production',
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'jangpyosa_jwt_refresh_secret_2024_production',
        APICK_API_KEY: '41173030f4fc1055778b2f97ce9659b5'
      },
      max_memory_restart: '500M'
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
