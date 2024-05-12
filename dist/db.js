"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const sequelize_2 = require("sequelize");
const blacklist_model_1 = __importDefault(require("./models/blacklist.model"));
// import User from "./models/user.model";
dotenv_1.default.config();
class DatabaseConnection {
    constructor() {
        this.sequelize = new sequelize_1.Sequelize(`mysql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:3306/${process.env.DB_NAME}`);
        this.dbReferenceNames = {
            Blacklist: ["Blacklist", "blacklist"],
            User: ["User", "users"],
            Roles: ["Roles", "roles"],
            AuthLogs: ["AuthLogs", "auth_logs"],
        };
        this.dbModels = {
            Blacklist: blacklist_model_1.default,
            // User,
        };
        this.conditionals = {
            ">=": [sequelize_2.Op.gte],
            "<=": [sequelize_2.Op.lte],
            "!=": [sequelize_2.Op.ne],
            "=": [sequelize_2.Op.eq],
            ">": [sequelize_2.Op.gt],
            "<": [sequelize_2.Op.lt],
            "like": [sequelize_2.Op.like],
            "in": [sequelize_2.Op.in],
            "not in": [sequelize_2.Op.notIn],
            "between": [sequelize_2.Op.between],
            "not between": [sequelize_2.Op.notBetween],
            "not like": [sequelize_2.Op.notLike],
            "regexp": [sequelize_2.Op.regexp],
            "not regexp": [sequelize_2.Op.notRegexp],
        };
        this.queryBuilder = {};
    }
    /**
     * Asynchronously establishes a connection to the database using Sequelize,
     * authenticates the connection, and synchronizes the models.
     *
     * @return {Promise<void>} A Promise that resolves once the connection is established and models are synchronized.
     */
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.sequelize.authenticate();
                console.log("Conexão estabelecida com sucesso.");
                yield this.sequelize.sync();
                console.log("Modelos sincronizados.");
            }
            catch (err) {
                console.error("Erro ao conectar ou sincronizar modelos:", err);
            }
        });
    }
    /**
     * Asynchronously closes the database connection.
     *
     * @return {Promise<void>} A Promise that resolves once the connection is closed.
     */
    closeConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.sequelize.close();
            }
            catch (err) {
                console.error("Erro ao fechar a conexão:", err);
            }
        });
    }
    clearQueryBuilder() {
        this.queryBuilder = {};
    }
    select(columns) {
        let attributes = Array.isArray(columns) ? columns : columns.replace("/\s/g", "").split(",");
        this.queryBuilder = Object.assign({}, attributes);
        return this;
    }
    where(column, condition, value) {
        return this;
    }
    orWhere(column, condition, value) {
        return this;
    }
}
exports.default = DatabaseConnection;
