import { Sequelize, Op } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
	`mysql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:3306/${process.env.DB_NAME}`
);

// const db = { sequelize, Op };
export default sequelize;
