import express from "express";
import db from "../db.js";
import { Op } from "sequelize";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import security from "../security.js";

const router = express.Router();

db.connect();

router.get("/users", async (req, res) => {
	const token = req.headers.authorization
		? req.headers.authorization.split(" ")[1]
		: null;

	const inBlacklist = await security.checkBlacklist(token);
	const isValidyToken = await security.verifyToken(token);

	if (!token || !isValidyToken || inBlacklist)
		return res.status(403).json({ message: "Faça o login para acessar." });

	const role = await security.getUserRole(token);

	const users = await User.findAll({
		attributes: ["username", "email"],
		where: {
			RoleId: { [Op.lt]: role },
		},
		include: [
			{
				model: Role,
				attributes: ["roleDesc"],
			},
		],
	});
	return res.status(200).json(users);
});

router.post("/users", async (req, res) => {
	const token = req.headers.authorization
		? req.headers.authorization.split(" ")[1]
		: null;

	const inBlacklist = await security.checkBlacklist(token);
	const isValidyToken = await security.verifyToken(token);

	if (!token || !isValidyToken || inBlacklist)
		return res.status(403).json({ message: "Faça o login para acessar." });

	const role = await security.getUserRole(token);

	if (role < 3)
		return res
			.status(403)
			.json({ message: "Voce não tem permissão para realizar essa ação." });

	const userData = req.body;
	const minPasswordLength = 3;

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
		RoleId: userData.roleId ? userData.roleId : 1,
	})
		.then((data) => {
			return res.status(201).json({ message: "Usuário criado com sucesso." });
		})
		.catch((err) => {
			const errors = err.errors.map((error) => error.message);
			return res.status(401).json({ error: errors });
		});
});

router.get("/users/:id", async (req, res) => {
	const token = req.headers.authorization
		? req.headers.authorization.split(" ")[1]
		: null;

	const inBlacklist = await security.checkBlacklist(token);
	const isValidyToken = await security.verifyToken(token);

	if (!token || !isValidyToken || inBlacklist)
		return res.status(403).json({ message: "Faça o login para acessar." });

	const role = await security.getUserRole(token);
	let userId = await security.getUserId(token);

	userId = userId == req.params.id ? userId : null;

	await User.findOne({
		where: {
			[Op.or]: [
				{
					[Op.and]: [
						{
							RoleId: {
								[Op.lt]: role,
							},
							id: req.params.id,
						},
					],
				},
				{ id: userId },
			],
		},
		attributes: ["username", "email"],
		include: [
			{
				model: Role,
				attributes: ["roleDesc"],
			},
		],
	}).then((data) => {
		if (!data)
			return res.status(401).json({ error: "Usuário não encontrado." });
		return res.status(200).json(data);
	});
});

router.put("/users/:id", async (req, res) => {});

router.patch("/users/:id", async (req, res) => {});

router.delete("/users/:id", async (req, res) => {});

export default router;
