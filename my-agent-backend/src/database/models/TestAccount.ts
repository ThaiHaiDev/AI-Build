import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';

export type Environment = 'dev' | 'staging' | 'production';
export const ENVIRONMENTS: Environment[] = ['dev', 'staging', 'production'];

export class TestAccount extends Model<InferAttributes<TestAccount>, InferCreationAttributes<TestAccount>> {
  declare id:          CreationOptional<string>;
  declare projectId:   string;
  declare environment: Environment;
  declare label:       string;
  declare username:    string;
  declare password:    string;
  declare url:         CreationOptional<string | null>;
  declare note:        CreationOptional<string | null>;
  declare createdBy:   string;
  declare createdAt:   CreationOptional<Date>;
  declare updatedAt:   CreationOptional<Date>;
}

TestAccount.init(
  {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    projectId:   { type: DataTypes.UUID, allowNull: false, field: 'project_id' },
    environment: { type: DataTypes.ENUM(...ENVIRONMENTS), allowNull: false },
    label:       { type: DataTypes.STRING(200), allowNull: false },
    username:    { type: DataTypes.STRING(320), allowNull: false },
    password:    { type: DataTypes.TEXT, allowNull: false },
    url:         { type: DataTypes.STRING(500), allowNull: true, defaultValue: null },
    note:        { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
    createdBy:   { type: DataTypes.UUID, allowNull: false, field: 'created_by' },
    createdAt:   { type: DataTypes.DATE, field: 'created_at' },
    updatedAt:   { type: DataTypes.DATE, field: 'updated_at' },
  },
  {
    sequelize,
    modelName: 'TestAccount',
    tableName: 'test_accounts',
    underscored: true,
    indexes: [{ fields: ['project_id', 'environment'] }],
  },
);
