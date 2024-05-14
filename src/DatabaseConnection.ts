import { Sequelize} from "sequelize";
import dotenv from "dotenv";
import { Op } from "sequelize";
import Blacklist from "./models/blacklist.model";
// import User from "./models/user.model";

dotenv.config();

interface Conditionals {
	[key: string]: symbol[];
}

export default class DatabaseConnection {

	public readonly sequelize: Sequelize;
	public readonly dbReferenceNames: object;
	public readonly dbModels: object;
	private readonly conditionals: Conditionals; 
	private queryBuilder: object;

	public constructor() {
		this.sequelize = new Sequelize(
			`mysql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:3306/${process.env.DB_NAME}`
		)
		this.dbReferenceNames = {
			Blacklist: ["Blacklist", "blacklist"],
			User: ["User", "users"],
			Roles: ["Roles", "roles"],
			AuthLogs: ["AuthLogs", "auth_logs"],
		}
		this.dbModels = {
			Blacklist,
			// User,
		}
		this.conditionals = {
			">=": [Op.gte],
			"<=": [Op.lte],
			"!=": [Op.ne],
			"=": [Op.eq],
			">": [Op.gt],
			"<": [Op.lt],
			"like": [Op.like],
			"in": [Op.in],
			"not in": [Op.notIn],
			"between": [Op.between],
			"not between": [Op.notBetween],
			"not like": [Op.notLike],
			"regexp": [Op.regexp],
			"not regexp": [Op.notRegexp],
		}
		this.queryBuilder = {};
	}

	/**
	 * Asynchronously establishes a connection to the database using Sequelize,
	 * authenticates the connection, and synchronizes the models.
	 *
	 * @return {Promise<void>} A Promise that resolves once the connection is established and models are synchronized.
	 */
	public async connect(): Promise<void> {
		try {
			await this.sequelize.authenticate();
			console.log("Conexão estabelecida com sucesso.");

			await this.sequelize.sync();   
			console.log("Modelos sincronizados.");
		} catch (err) {
			console.error("Erro ao conectar ou sincronizar modelos:", err);
		}
	} 

	/**
	 * Asynchronously closes the database connection.
	 *
	 * @return {Promise<void>} A Promise that resolves once the connection is closed.
	 */
	public async closeConnection(): Promise<void> {
		try {
			await this.sequelize.close();
		} catch (err) {
			console.error("Erro ao fechar a conexão:", err);
		}
	}

	private clearQueryBuilder(): void {
		this.queryBuilder = {};
	}

	public select(columns: string | string[]): this { 
		let attributes: string[] = Array.isArray(columns) ? columns :  columns.replace("/\s/g", "").split(","); 
		this.queryBuilder = {...this.queryBuilder, ...attributes}
		return this;
	}
	public where(column: string, value: any, condition: string = "="): this {
		let keyCondition = this.conditionals[condition][0]; 
		if ("where" in this.queryBuilder) {
			(this.queryBuilder).where = { ...<object>this.queryBuilder.where, [keyCondition]: [
					{[column]: value}
				]
			}
		}
		let where = {
			where: {
				[keyCondition]: [
					{[column]: value}
			],
			},
		};
		this.queryBuilder = {...this.queryBuilder, ...where};
		return this;
	}

	public orWhere (column: string, condition: string, value: any): this {

		return this;
	}

	public query(): object {

		return this.queryBuilder;
	}
}

const db = new DatabaseConnection();
// db.connect();
db.select("id").where("email", "hHJkS@example.com")
console.log(db.query());


