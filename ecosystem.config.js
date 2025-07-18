module.exports = {
  apps: [
    {
      name: 'move-to-learn-next',
      script: '.next/standalone/server.js',
      cwd: '/var/www/move-to-learn-next-app',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        NEXT_PUBLIC_AI_API_URL: 'https://api.move-to-learn.accc.space',
        AI_API_URL: 'https://api.move-to-learn.accc.space',
        BACKEND_URL: 'https://api.move-to-learn.accc.space'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
        NEXT_PUBLIC_AI_API_URL: 'https://api.move-to-learn.accc.space',
        AI_API_URL: 'https://api.move-to-learn.accc.space',
        BACKEND_URL: 'https://api.move-to-learn.accc.space'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
}; 