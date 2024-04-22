import express from "express";
import db from "../db.js";
import { Op } from "sequelize";
import User from "../models/user.model.js";
import Blacklist from "../models/blacklist.model.js";
import security from "../security.js";

const router = express.Router();

const minPasswordLength = 3;

db.connect();

//////////////////////////////////////////////////////////////////////////////

router.post("/login", async (req, res) => {
	const userData = req.body;

	const token = req.headers.authorization
		? req.headers.authorization.split(" ")[1]
		: null;

	const inBlacklist = await security.checkBlacklist(token);
	const isValidyToken = await security.verifyToken(token);

	if (token && isValidyToken && !inBlacklist)
		return res.status(401).json({ message: "Já está logado." });

	if (!userData.user)
		return res.status(401).json({ error: "Usuário não informado." });

	if (!userData.password)
		return res.status(401).json({ error: "Senha não informada." });

	await User.findOne({
		where: {
			[Op.or]: [{ username: userData.user }, { email: userData.user }],
		},
		attributes: ["id", "username", "password", "RoleId"],
	})
		.then(async (data) => {
			if (!data)
				return res.status(401).json({ error: "Usuário não registrado." });

			await security
				.comparePasswordHash(userData.password, data.password)
				.then(async (result) => {
					if (!result)
						return res
							.status(401)
							.json({ error: "Usuário ou senha inválidos." });

					const token = await security.createToken(data.id, data.RoleId, 30);

					return res.status(200).json({ token });
				});
		})
		.catch((err) => {
			console.log(err);
			return res
				.status(500)
				.json({ error: "Não foi possível realizar o login." });
		});
});

//////////////////////////////////////////////////////////////////////////////

router.post("/logout", async (req, res) => {
	const token = req.headers.authorization
		? req.headers.authorization.split(" ")[1]
		: null;

	const inBlacklist = await security.checkBlacklist(token);
	const isValidyToken = await security.verifyToken(token);

	if (!token || inBlacklist || !isValidyToken)
		return res.status(401).json({ error: "Não está logado." });

	await Blacklist.create({
		token,
	})
		.then((data) => {
			if (!data)
				return res
					.status(401)
					.json({ error: "Não foi possível realizar o logout." });
			return res.status(200).json({ message: "Logout realizado com sucesso." });
		})
		.catch((err) => {
			console.log(err);
			return res
				.status(500)
				.json({ error: "Não foi possível realizar o logout." });
		});
});

//////////////////////////////////////////////////////////////////////////////

router.post("/register", async (req, res) => {
	const userData = req.body;

	if (userData.password && userData.password.length < minPasswordLength)
		return res.status(401).json({
			error: `A senha deve ter pelo menos ${minPasswordLength} caracteres`,
		});

	if (userData.password && userData.password !== userData.confirmPassword)
		return res.status(401).json({ error: "As senhas devem ser iguais" });

	const password = userData.password
		? await security.createPasswordHash(userData.password)
		: null;

	await User.create({
		username: userData.username,
		email: userData.email,
		password,
		RoleId: 1,
	})
		.then((result) => {
			if (!result)
				return res
					.status(401)
					.json({ error: "Não foi possível realizar o registro." });
			return res.status(201).json({ message: "Usuário criado com sucesso." });
		})
		.catch((err) => {
			const errors = err.errors.map((error) => {
				return { [error.path]: error.message };
			});
			return res.status(401).json({ error: errors});
		});
});

export default router;
