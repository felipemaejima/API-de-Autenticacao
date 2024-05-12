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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const DatabaseConnection_1 = __importDefault(require("./DatabaseConnection"));
const db = new DatabaseConnection_1.default();
db.connect();
dotenv_1.default.config();
const saltRounds = 10;
/**
 * Hashes a password using bcrypt with a specified number of salt rounds.
 *
 * @param {string} password - The password to be hashed.
 * @return {Promise<string>} A Promise that resolves to the hashed password.
 */
function createPasswordHash(password) {
    return new Promise((resolve, reject) => {
        bcrypt_1.default.hash(password, saltRounds, (err, hash) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(hash);
            }
        });
    });
}
/**
 * Validates a password by comparing it with a given hash.
 *
 * @param {string} password - The password to validate.
 * @param {string} passwordHash - The hash to compare the password against.
 * @return {Promise<boolean>} A Promise that resolves to a boolean indicating password validity.
 */
function validatePassword(password, passwordHash) {
    return new Promise((resolve, reject) => {
        bcrypt_1.default.compare(password, passwordHash, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}
/**
 * Generates a JSON Web Token (JWT) using the provided payload and the secret key from the environment variables.
 *
 * @param {any} payload - The data to be included in the token.
 * @return {Promise<string>} A promise that resolves to the generated JWT string.
 */
function createToken(payload) {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.sign(payload, process.env.SECRET, (err, token) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(token || "");
            }
        });
    });
}
/**
 * Decodes a JWT token using the provided secret key from the environment variables.
 *
 * @param {string} token - The JWT token to decode.
 * @return {Promise<any>} A promise that resolves to the decoded token payload or rejects with an error if decoding fails.
 */
function getDecodedToken(token) {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, process.env.SECRET, (err, decoded) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(decoded);
            }
        });
    });
}
/**
 * Verifies the validity of a JWT token.
 *
 * @param {string} token - The JWT token to verify.
 * @return {Promise<boolean>} A Promise that resolves to a boolean indicating whether the token is valid or not.
 */
function verifyTokenValidity(token) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const decoded = yield getDecodedToken(token);
            let isValid = false;
            if (!decoded)
                isValid = false;
            const time = new Date(decoded.time);
            const expiresMin = decoded.expiresMin;
            const currentDate = new Date();
            const timeSession = currentDate.getTime() - time.getTime();
            const validity = Math.floor(timeSession / 1000 / 60);
            isValid = !!(validity < expiresMin);
            resolve(isValid);
        }
        catch (err) {
            reject(err);
        }
    }));
}
/**
 * Checks if a given token is present in the blacklist.
 *
 * @param {string} token - The token to check.
 * @return {Promise<boolean>} A Promise that resolves to a boolean indicating whether the token is in the blacklist or not.
 */
function checkBlacklist(token) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const blacklist = yield Blacklist.findOne({ where: { token } });
            resolve(!!(blacklist));
        }
        catch (err) {
            reject(err);
        }
    }));
}
/**
 * Invalidates a token by adding it to the blacklist.
 *
 * @param {string} token - The token to invalidate.
 * @return {Promise<boolean>} A Promise that resolves to a boolean indicating whether the token was successfully invalidated.
 */
function invalidateToken(token) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield Blacklist.create({ token });
            resolve(true);
        }
        catch (err) {
            reject(err);
        }
    }));
}
/**
 * Retrieves the user ID from a JWT token.
 *
 * @param {string} token - The JWT token from which to extract the user ID.
 * @return {Promise<number>} A Promise that resolves to the user ID extracted from the token.
 */
function getUserId(token) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const decoded = yield getDecodedToken(token);
            resolve(decoded.userId);
        }
        catch (err) {
            reject(err);
        }
    }));
}
/**
 * Retrieves the user role from a JWT token.
 *
 * @param {string} token - The JWT token from which to extract the user role.
 * @return {Promise<number>} A Promise that resolves to the user role extracted from the token.
 */
function getUserRole(token) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const decoded = yield getDecodedToken(token);
            resolve(decoded.role);
        }
        catch (err) {
            reject(err);
        }
    }));
}
const security = {
    createPasswordHash,
    validatePassword,
    createToken,
    verifyTokenValidity,
    checkBlacklist,
    invalidateToken,
    getUserId,
    getUserRole
};
exports.default = security;
