// Must run before any config module is imported
process.env.NODE_ENV = 'development';

import { config as loadEnv } from 'dotenv';

// Load dev env so config module succeeds (same aiTest DB)
loadEnv({ path: '.env.development' });

export async function setup() {
  // Dynamic import after env is loaded
  const { sequelize } = await import('../database/sequelize.js');
  await import('../database/models/index.js');
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const { seedDemoUsers } = await import('../auth/stores/userStore.js');
  const { seedDemoProjects } = await import('../projects/stores/seedDemoProjects.js');
  await seedDemoUsers();
  await seedDemoProjects();
}

export async function teardown() {
  const { sequelize } = await import('../database/sequelize.js');
  await sequelize.close();
}
