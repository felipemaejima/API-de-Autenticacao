import { Sequelize} from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
	`mysql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:3306/${process.env.DB_NAME}`
);

async function connect() { 
	try {
		await sequelize.authenticate();
		console.log("Conexão estabelecida com sucesso.");

		await sequelize.sync();
		console.log("Modelos sincronizados.");
	} catch (err) {
		console.error("Erro ao conectar ou sincronizar modelos:", err);
	}
}
async function closeConnection() {
	await sequelize.close();
}

const db = {
	sequelize,
	connect,
	closeConnection,
}
export default db; 
