module.exports = {
  apps: [
    {
      name: 'chat-api',
      script: './dist/main.js',  // Relative to the API directory
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        // These will be overridden by docker-compose environment variables
        DATABASE_URL: 'postgresql://chatapp:chatapp123@postgres:5432/chatapp?schema=public',
        REDIS_URL: 'redis://redis:6379',
        JWT_SECRET: 'your-secret-key-12345',
      },
      cwd: '/app/apps/api',  // Set working directory to API folder
    },
  ],
};