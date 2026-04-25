import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize';
import { sequelize } from '../sequelize.js';

export const HISTORY_RESOURCE_TYPES = ['test_account', 'project', 'member', 'user'] as const;
export type HistoryResourceType = typeof HISTORY_RESOURCE_TYPES[number];

export type HistoryMeta = {
  before?: Record<string, unknown>;
  after?:  Record<string, unknown>;
};

export class History extends Model<
  InferAttributes<History>,
  InferCreationAttributes<History>
> {
  declare id:           CreationOptional<string>;
  declare actorId:      CreationOptional<string | null>;
  declare actorName:    string;
  declare actorEmail:   string;
  declare action:       string;
  declare resourceType: HistoryResourceType;
  declare resourceId:   string;
  declare resourceName: string;
  declare projectId:    CreationOptional<string | null>;
  declare projectName:  CreationOptional<string | null>;
  declare meta:         CreationOptional<HistoryMeta | null>;
  declare createdAt:    CreationOptional<Date>;
}

History.init(
  {
    id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    actorId:      { type: DataTypes.UUID,         allowNull: true,  field: 'actor_id'      },
    actorName:    { type: DataTypes.STRING(100),   allowNull: false, field: 'actor_name'    },
    actorEmail:   { type: DataTypes.STRING(320),   allowNull: false, field: 'actor_email'   },
    action:       { type: DataTypes.STRING(50),    allowNull: false                         },
    resourceType: { type: DataTypes.ENUM(...HISTORY_RESOURCE_TYPES), allowNull: false, field: 'resource_type' },
    resourceId:   { type: DataTypes.UUID,          allowNull: false, field: 'resource_id'   },
    resourceName: { type: DataTypes.STRING(255),   allowNull: false, field: 'resource_name' },
    projectId:    { type: DataTypes.UUID,          allowNull: true,  field: 'project_id'    },
    projectName:  { type: DataTypes.STRING(255),   allowNull: true,  defaultValue: null, field: 'project_name' },
    meta:         { type: DataTypes.JSONB,         allowNull: true,  defaultValue: null  },
    createdAt:    { type: DataTypes.DATE,          field: 'created_at' },
  },
  {
    sequelize,
    modelName:   'History',
    tableName:   'histories',
    underscored: true,
    updatedAt:   false,
    indexes: [
      { fields: ['resource_type', 'created_at'] },
      { fields: ['project_id',    'created_at'] },
      { fields: ['actor_id',      'created_at'] },
    ],
  },
);
