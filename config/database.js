module.exports = ({ env }) => ({
    connection: {
      client: 'mysql',
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'facturaciontienda'),
        user: env('DATABASE_USERNAME', 'Santiago@'),
        password: env('DATABASE_PASSWORD', 'Santimajo101219@'),
        ssl: env.bool('DATABASE_SSL', false),
        charset: 'utf8mb4',
      },
      pool: {
        min: 0,
        max: 5,
        acquireTimeoutMillis: 60000,
        createTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 100,
      },
      debug: false,
      acquireConnectionTimeout: 60000,
    },
  });