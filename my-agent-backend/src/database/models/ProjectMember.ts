import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { Project } from './Project.js';
import { User } from './User.js';

export class ProjectMember extends Model<InferAttributes<ProjectMember>, InferCreationAttributes<ProjectMember>> {
  declare id:         CreationOptional<string>;
  declare projectId:  string;
  declare userId:     string;
  declare addedAt:    CreationOptional<Date>;
  declare removedAt:  CreationOptional<Date | null>;
  declare addedBy:    string;
  declare createdAt:  CreationOptional<Date>;
  declare updatedAt:  CreationOptional<Date>;
}

ProjectMember.init(
  {
    id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    projectId: { type: DataTypes.UUID, allowNull: false, field: 'project_id' },
    userId:    { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
    addedAt:   { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'added_at' },
    removedAt: { type: DataTypes.DATE, allowNull: true,  field: 'removed_at' },
    addedBy:   { type: DataTypes.UUID, allowNull: false, field: 'added_by' },
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  {
    sequelize,
    modelName: 'ProjectMember',
    tableName: 'project_members',
    underscored: true,
    indexes: [
      { fields: ['user_id', 'removed_at'] },
      { fields: ['project_id', 'removed_at'] },
    ],
  },
);

Project.hasMany(ProjectMember, { foreignKey: 'projectId', as: 'members' });
ProjectMember.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

User.hasMany(ProjectMember, { foreignKey: 'userId', as: 'memberships' });
ProjectMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
