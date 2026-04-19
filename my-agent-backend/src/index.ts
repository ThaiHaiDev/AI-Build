import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './lib/logger.js';
import { seedDemoUsers } from './auth/stores/userStore.js';
import { seedDemoProjects } from './projects/stores/seedDemoProjects.js';
import { sequelize } from './database/sequelize.js';
import './database/models/index.js';

async function main() {
  await sequelize.authenticate();
  logger.info('🗄️  Database connected');

  // Dev only — production dùng migration
  await sequelize.sync({ alter: config.NODE_ENV === 'development' });
  logger.info('🗄️  Models synced');

  await seedDemoUsers();
  logger.info('👤 Seeded demo users: admin (SA) · leader (ADMIN) · user (USER) · outsider (USER) — pw: <Role>@12345');

  await seedDemoProjects();
  logger.info('📁 Seeded demo projects: Alpha (active, leader+user) · Beta (active) · Gamma (archived)');

  const app = createApp();

  const server = app.listen(config.PORT, () => {
    logger.info(`🚀 Server listening on http://localhost:${config.PORT} (${config.NODE_ENV})`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Forced shutdown after 10s');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled rejection');
  });
}

main().catch((err) => {
  logger.error({ err }, 'Fatal boot error');
  process.exit(1);
});
