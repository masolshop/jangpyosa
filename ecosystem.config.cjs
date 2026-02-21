module.exports = {
  apps: [
    {
      name: 'jangpyosa-api',
      script: 'npx',
      args: 'tsx src/index.ts',
      cwd: './apps/api',
      env: {
        NODE_ENV: 'development',
        PORT: 4000,
        DATABASE_URL: 'file:./prisma/dev.db'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'jangpyosa-web',
      script: 'npx',
      args: 'next start -p 3000 -H 0.0.0.0',
      cwd: './apps/web',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
