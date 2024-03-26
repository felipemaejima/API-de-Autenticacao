import { DataTypes } from "sequelize";
import db  from "../db.js";

const sequelize = db.sequelize;

const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "O nome de usuário deve ser informado.",
      },
      notNull: {
        msg: "O nome de usuário deve ser informado.",
      },
    },
  },
  email: {
    type: DataTypes.STRING(50),
    unique: {
      msg: "O email informado ja está registrado.",
    },
    allowNull: false,
    validate: {
        isEmail: true,
        notEmpty: {
            msg: "O Email deve ser informado.",
          },
          notNull: {
            msg: "O Email deve ser informado.",
          },
    }
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "A senha deve ser informada.",
      },
      notNull: {
        msg: "A senha deve ser informada.",
      },
      len: [10, 255],
    },
  },
  sess_hash: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  sess_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

export default User;
