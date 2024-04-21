import { DataTypes, Model } from 'sequelize';
import db from '../db.js';

const { sequelize } = db;

class Blacklist extends Model {}

Blacklist.init({
  token: {
    type: DataTypes.STRING(255),
    primaryKey: true,
  },
}, { 
  sequelize,
  modelName: 'Blacklist',
  tableName: 'blacklist',
});

export default Blacklist;