import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import db from '../database/connection';

class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
  declare id   : CreationOptional<string>;
  declare name : string;
}

Role.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: new DataTypes.STRING(20), allowNull: false },
  },
  {
    tableName: 'roles',
    sequelize: db,
    timestamps: false
  }
);

export default Role;