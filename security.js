import bcrypt from "bcrypt";
const saltRounds = 10;

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

function comparePasswordHash(pwClientHash, pwDbHash) {
	return new Promise((resolve, reject) => {
		bcrypt.compare(pwClientHash, pwDbHash, (err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
}

function createSessionHash(userId, UserName) {
	return new Promise((resolve, reject) => {
		bcrypt.hash(`${userId}${UserName}`, saltRounds, (err, hash) => {
			if (err) {
				reject(err);
			} else {
				resolve("sess_" + hash);
			}
		});
	});
}

function verifySessionValidity(SessionTime) {
	const currentDate = new Date();
	const timeSession = currentDate.getTime() - SessionTime.getTime();
	const validity = Math.floor(timeSession / 1000 / 60);
	return validity < 1 ? true : false;
}

const security = {
	createPasswordHash,
	comparePasswordHash,
	createSessionHash,
  verifySessionValidity,
};

export default security;
