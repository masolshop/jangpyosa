module.exports = {
  apps: [
    {
      name: 'jangpyosa-api',
      script: 'node',
      args: 'dist/index.js',
      cwd: './apps/api',
      env: {
        NODE_ENV: 'development',
        PORT: 4000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'jangpyosa-web',
      script: 'npx',
      args: 'next start -p 3000',
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
