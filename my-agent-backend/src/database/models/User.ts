import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { ROLES, type Role } from '../../auth/constants.js';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id:           CreationOptional<string>;
  declare email:        string;
  declare name:         string;
  declare passwordHash: string;
  declare role:         Role;
  declare isActive:     CreationOptional<boolean>;
  declare createdAt:    CreationOptional<Date>;
  declare updatedAt:    CreationOptional<Date>;
}

User.init(
  {
    id:   { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: {
      type: DataTypes.STRING(320),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    name:         { type: DataTypes.STRING(100),  allowNull: false },
    passwordHash: { type: DataTypes.STRING(255),  allowNull: false, field: 'password_hash' },
    role: {
      type: DataTypes.ENUM(...Object.values(ROLES)),
      allowNull: false,
      defaultValue: ROLES.USER,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'system_user',
    underscored: true,
    indexes: [{ fields: ['email'], unique: true }],
  },
);
