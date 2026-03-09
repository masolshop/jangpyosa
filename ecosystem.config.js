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
        PORT: 4000
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
