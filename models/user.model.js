import { DataTypes, Model } from 'sequelize';
import db from '../db.js';
import Role from './role.model.js';

const { sequelize } = db;


class User extends Model {}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Usuário não informado.",
      },
      notNull: {
        msg: "Usuário não informado.",
      },
    }
  },
  email: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      msg: 'Email ja cadastrado.',
    },
    validate: {
      notEmpty: {
        msg: "Email não informado.",
      },
      notNull: {
        msg: "Email não informado.",
      },
      isEmail: {
        msg: 'Informe um Email valido.',
      },
    },
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Senha não informada.",
      },
      notNull: {
        msg: "Senha não informada.",
      },
    }
  },
}, {
  sequelize,
  modelName: 'User', 
  tableName: 'users',
});

User.belongsTo(Role)

export default User;
