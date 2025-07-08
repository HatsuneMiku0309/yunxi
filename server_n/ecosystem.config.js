module.exports = {
  apps : [{
    name: 'yunxi-server-3000',
    script: './dist/main.js',
    watch: false,
    autorestart: true,
    max_memory_restart: '2500M',
    env: {
      APP_PORT: 3000,
      DB_IP: 'localhost',
      DB_PORT: 5432,
      DB_USER: 'postgres',
      DB_PASS: '!yunxitlx0627',
      DB_NAME: 'postgres',
      EXPIRES_IN: '7d',
      ASSETS_PATH: './assets'
    }
  }]
};
