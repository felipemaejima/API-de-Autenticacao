import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "./db.js";
import Blacklist from "./models/blacklist.model.js";

db.connect();

const saltRounds = 10;

dotenv.config();

function createPasswordHash(password) {
	return new Promise((resolve, reject) => {
		bcrypt.hash(password, saltRounds, (err, hash) => {
			if (err) {
				reject(err);
			} else {
				resolve(hash);
			}
		});
	});
}

function comparePasswordHash(pwClient, pwDbHash) {
	return new Promise((resolve, reject) => {
		bcrypt.compare(pwClient, pwDbHash, (err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
}

function createToken(userId, role = 1, expiresMin) {
	return new Promise((resolve, reject) => {
		jwt.sign(
			{ userId, role: role, time: new Date(), expiresMin: expiresMin },
			process.env.SECRET,
			(err, token) => {
				if (err) {
					reject(err);
				} else {
					resolve(token);
				}
			}
		);
	});
}

async function verifyToken(token) {
	return jwt.verify(token, process.env.SECRET, (err, decoded) => {
		if (err || !decoded) return false;
		const time = new Date(decoded.time);
		const expiresMin = decoded.expiresMin;
		const currentDate = new Date();
		const timeSession = currentDate.getTime() - time.getTime();
		const validity = Math.floor(timeSession / 1000 / 60);
		return validity < expiresMin ? true : false;
	});
}

function getUserId(token) {
	return new Promise((resolve, reject) => {
		jwt.verify(token, process.env.SECRET, (err, decoded) => {
			if (err || !decoded) reject(false);
			resolve(decoded.userId);
		});
	});
}

function getUserRole(token) {
	return new Promise((resolve, reject) => {
		jwt.verify(token, process.env.SECRET, (err, decoded) => {
			if (err || !decoded) reject(false)
			resolve(decoded.role);
		});
	});
}

async function checkBlacklist(token) {
	const data = await Blacklist.findOne({
		where: {
			token,
		},
	});
	if (!!data) {
		return true;
	}
	return false;
}

const security = {
	createPasswordHash,
	comparePasswordHash,
	getUserRole,
	getUserId,
	createToken,
	verifyToken,
	checkBlacklist,
};

export default security;
