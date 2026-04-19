import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';

export type ProjectStatus = 'active' | 'archived';

export class Project extends Model<InferAttributes<Project>, InferCreationAttributes<Project>> {
  declare id:                   CreationOptional<string>;
  declare name:                 string;
  declare description:          CreationOptional<string | null>;
  declare techStack:            CreationOptional<string | null>;
  declare partnerName:          CreationOptional<string | null>;
  declare partnerContactName:   CreationOptional<string | null>;
  declare partnerEmail:         CreationOptional<string | null>;
  declare partnerPhone:         CreationOptional<string | null>;
  declare status:               CreationOptional<ProjectStatus>;
  declare archivedAt:           CreationOptional<Date | null>;
  declare createdBy:            string;
  declare createdAt:            CreationOptional<Date>;
  declare updatedAt:            CreationOptional<Date>;
}

Project.init(
  {
    id:                 { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name:               { type: DataTypes.STRING(200), allowNull: false },
    description:        { type: DataTypes.TEXT, allowNull: true },
    techStack:          { type: DataTypes.TEXT, allowNull: true, field: 'tech_stack' },
    partnerName:        { type: DataTypes.STRING(200), allowNull: true, field: 'partner_name' },
    partnerContactName: { type: DataTypes.STRING(100), allowNull: true, field: 'partner_contact_name' },
    partnerEmail:       { type: DataTypes.STRING(320), allowNull: true, field: 'partner_email' },
    partnerPhone:       { type: DataTypes.STRING(30),  allowNull: true, field: 'partner_phone' },
    status: {
      type: DataTypes.ENUM('active', 'archived'),
      allowNull: false,
      defaultValue: 'active',
    },
    archivedAt: { type: DataTypes.DATE, allowNull: true, field: 'archived_at' },
    createdBy:  { type: DataTypes.UUID, allowNull: false, field: 'created_by' },
    createdAt:  { type: DataTypes.DATE, field: 'created_at' },
    updatedAt:  { type: DataTypes.DATE, field: 'updated_at' },
  },
  {
    sequelize,
    modelName: 'Project',
    tableName: 'projects',
    underscored: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['created_by'] },
    ],
  },
);
