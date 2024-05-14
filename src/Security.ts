import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import DatabaseConnection from "./DatabaseConnection";


const db = new DatabaseConnection();

db.connect();

dotenv.config();

type promiseError = Error | undefined | null;

interface ISecurity {
	createPasswordHash: (password: string) => Promise<string>;
	validatePassword: (password: string, passwordHash: string) => Promise<boolean>;
	createToken: (payload: any) => Promise<string>;
	verifyTokenValidity: (token: string) => Promise<boolean>;
	checkBlacklist: (token: string) => Promise<boolean>;
	invalidateToken: (token: string) => Promise<boolean>;
	getUserId: (token: string) => Promise<number>;
	getUserRole: (token: string) => Promise<number>;
}
const saltRounds: number = 10;

/**
 * Hashes a password using bcrypt with a specified number of salt rounds.
 *
 * @param {string} password - The password to be hashed.
 * @return {Promise<string>} A Promise that resolves to the hashed password.
 */
function createPasswordHash(password: string): Promise<string> {
	return new Promise((resolve, reject) => {
		bcrypt.hash(password, saltRounds, (err: promiseError, hash: string) => {
			if (err) {
				reject(err);
			} else {
				resolve(hash);
			}
		});
	})
}

/**
 * Validates a password by comparing it with a given hash.
 *
 * @param {string} password - The password to validate.
 * @param {string} passwordHash - The hash to compare the password against.
 * @return {Promise<boolean>} A Promise that resolves to a boolean indicating password validity.
 */
function validatePassword(
	password: string,
	passwordHash: string
): Promise<boolean> {
	return new Promise((resolve, reject) => {
		bcrypt.compare(password, passwordHash, (err: promiseError, result: boolean) => {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	})
}

/**
 * Generates a JSON Web Token (JWT) using the provided payload and the secret key from the environment variables.
 *
 * @param {any} payload - The data to be included in the token.
 * @return {Promise<string>} A promise that resolves to the generated JWT string.
 */
function createToken(payload: object | string): Promise<string> {
	return new Promise((resolve, reject) => {
		jwt.sign(payload, <string>process.env.SECRET, (err: Error | null, token: string | undefined) => {
			if (err) {
				reject(err);
			} else {
				resolve(token || "");
			}
		});
	})
}

/**
 * Decodes a JWT token using the provided secret key from the environment variables.
 *
 * @param {string} token - The JWT token to decode.
 * @return {Promise<any>} A promise that resolves to the decoded token payload or rejects with an error if decoding fails.
 */
function getDecodedToken(token: string): Promise<any> {
	return new Promise((resolve, reject) => {
		jwt.verify(token, <string>process.env.SECRET, (err: promiseError, decoded: any) => {
			if (err) {
				reject(err);
			} else {
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
function verifyTokenValidity(token: string): Promise<boolean> {
	return new Promise(async (resolve, reject) => {
		try {
			const decoded = await getDecodedToken(token);
			let isValid = false;
			if (!decoded) isValid = false;
			const time = new Date(decoded.time);
			const expiresMin = decoded.expiresMin;
			const currentDate = new Date();
			const timeSession = currentDate.getTime() - time.getTime();
			const validity = Math.floor(timeSession / 1000 / 60);
			isValid = !!(validity < expiresMin);
			resolve(isValid);
		} catch (err) {
			reject(err);
		}
	});
}

	/**
	 * Checks if a given token is present in the blacklist.
	 *
	 * @param {string} token - The token to check.
	 * @return {Promise<boolean>} A Promise that resolves to a boolean indicating whether the token is in the blacklist or not.
	 */
function checkBlacklist(token: string): Promise<boolean> {
	return new Promise(async (resolve, reject) => {
		try {
			const blacklist = await Blacklist.findOne({ where: { token } });
			resolve(!!(blacklist));
		} catch (err) {
			reject(err);
		}
	})
}

/**
 * Invalidates a token by adding it to the blacklist.
 *
 * @param {string} token - The token to invalidate.
 * @return {Promise<boolean>} A Promise that resolves to a boolean indicating whether the token was successfully invalidated.
 */
function  invalidateToken(token: string): Promise<boolean> {
	return new Promise(async (resolve, reject) => {
		try {
			await Blacklist.create({ token });
			resolve(true);
		} catch (err) {
			reject(err);
		}
	})
}

/**
 * Retrieves the user ID from a JWT token.
 *
 * @param {string} token - The JWT token from which to extract the user ID.
 * @return {Promise<number>} A Promise that resolves to the user ID extracted from the token.
 */
function  getUserId(token: string): Promise<number> {
	return new Promise(async (resolve, reject) => {
		try {
			const decoded = await getDecodedToken(token);
			resolve(decoded.userId);
		} catch (err) {
			reject(err);
		}
	})
}

/**
 * Retrieves the user role from a JWT token.
 *
 * @param {string} token - The JWT token from which to extract the user role.
 * @return {Promise<number>} A Promise that resolves to the user role extracted from the token.
 */
function getUserRole(token: string): Promise<number> {
	return new Promise(async (resolve, reject) => {
		try {
			const decoded = await getDecodedToken(token);
			resolve(decoded.role);
		} catch (err) {
			reject(err);
		}
	})
}

const security: ISecurity = {
	createPasswordHash,
	validatePassword,
	createToken,
	verifyTokenValidity,
	checkBlacklist,
	invalidateToken,
	getUserId,
	getUserRole
} 

export default security; 


