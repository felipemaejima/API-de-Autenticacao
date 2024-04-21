import { DataTypes, Model } from 'sequelize';
import db from '../db.js';

const { sequelize } = db;

class Role extends Model {}

Role.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  roleDesc: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
}, {
  sequelize,
  modelName: 'Role',
  tableName: 'roles',
});

export default Role;