import { Sequelize } from 'sequelize';
import { config } from '../config/index.js';
import { logger } from '../lib/logger.js';

export const sequelize = new Sequelize(config.DATABASE_URL, {
  dialect: 'postgres',
  logging: config.NODE_ENV === 'development' ? (sql) => logger.debug({ sql }, 'sql') : false,
  pool: { max: config.DB_POOL_MAX, min: 0, acquire: 30_000, idle: 10_000 },
  dialectOptions: config.DB_SSL
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
});
