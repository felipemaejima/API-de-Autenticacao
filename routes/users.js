import express from "express";
import db from "../db.js";
import { Op } from "sequelize";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import security from "../security.js";

const router = express.Router();

const minPasswordLength = 3;

db.connect();

async function validateSession(bearerToken) {
	const token = bearerToken ? bearerToken.split(" ")[1] : null;

	const inBlacklist = await security.checkBlacklist(token);
	const isValidyToken = await security.verifyToken(token);

	if (!token || !isValidyToken || inBlacklist) return false;

	return token;
}

//////////////////////////////////////////////////////////////////////////////

router.get("/users", async (req, res) => {
	const token = await validateSession(req.headers.authorization);

	if (!token)
		return res.status(403).json({ message: "Faça o login para acessar." });

	const role = await security.getUserRole(token);

	await User.findAll({
		attributes: ["username", "email"],
		where: {
			RoleId: { [Op.lt]: role },
			isActive: true,
		},
		include: {
			model: Role,
			attributes: ["roleDesc"],
		},
	})
		.then((data) => {
			if (!data)
				return res.status(401).json({ error: ["Nenhum usuário encontrado."] });
			const users = data.map((user) => {
				return {
					id: user.id,
					username: user.username,
					email: user.email,
					role: user.Role.roleDesc,
				};
			});
			return res.status(200).json({ users });
		})
		.catch((err) => {
			console.log(err);
			return res.status(500).json({ error: ["Nenhum usuário encontrado."] });
		});
});

//////////////////////////////////////////////////////////////////////////////

router.post("/users", async (req, res) => {
	const token = await validateSession(req.headers.authorization);

	if (!token)
		return res.status(403).json({ message: "Faça o login para acessar." });

	const role = await security.getUserRole(token);

	if (role < 3)
		return res
			.status(403)
			.json({ message: "Voce não tem permissão para realizar essa ação." });

	const userData = req.body;

	if (userData.password && userData.password.length < minPasswordLength)
		return res.status(401).json({
			error: [
				{
					password: `A senha deve ter pelo menos ${minPasswordLength} caracteres`,
				},
			],
		});

	if (userData.password && userData.password !== userData.confirmPassword)
		return res.status(401).json({
			error: [{ password: "As senhas devem ser iguais" }],
		});

	const password = userData.password
		? await security.createPasswordHash(userData.password)
		: null;

	await User.create({
		username: userData.username,
		email: userData.email,
		password,
		RoleId: userData.roleId ? userData.roleId : 1,
	})
		.then((result) => {
			if (!result)
				return res
					.status(401)
					.json({ error: ["Não foi possível criar o usuário."] });
			return res.status(201).json({ message: "Usuário criado com sucesso." });
		})
		.catch((err) => {
			const errors = {};
			err.errors.map((error) => {
				errors[error.path] = error.message;
			});
			return res.status(401).json({ error: errors });
		});
});

//////////////////////////////////////////////////////////////////////////////

router.get("/users/:id", async (req, res) => {
	const token = await validateSession(req.headers.authorization);

	if (!token)
		return res.status(403).json({ message: "Faça o login para acessar." });

	const role = await security.getUserRole(token);
	let userId = await security.getUserId(token);

	userId = userId == req.params.id ? userId : null;

	await User.findOne({
		where: {
			isActive: true,
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
	})
		.then((data) => {
			if (!data)
				return res.status(401).json({ error: ["Usuário não encontrado."] });
			const user = [data.toJSON()].map((user) => {
				return {
					id: user.id,
					username: user.username,
					email: user.email,
					role: user.Role.roleDesc,
				};
			});
			return res.status(200).json({ user });
		})
		.catch((err) => {
			console.log(err);
			return res.status(500).json({ error: ["Usuário não encontrado."] });
		});
});

//////////////////////////////////////////////////////////////////////////////

router.put("/users/:id", async (req, res) => {
	const token = await validateSession(req.headers.authorization);

	if (!token)
		return res.status(403).json({ message: "Faça o login para acessar." });

	const role = await security.getUserRole(token);

	if (role < 3)
		return res
			.status(403)
			.json({ message: "Voce não tem permissão para realizar essa ação." });

	const userData = req.body;

	if (!userData.password || !userData.username || !userData.email)
		return res
			.status(401)
			.json({ error: ["Envie todos os dados para atualização."] });

	if (userData.password.length < minPasswordLength)
		return res.status(401).json({
			error: [
				{
					password: `A senha deve ter pelo menos ${minPasswordLength} caracteres`,
				},
			],
		});

	if (userData.password !== userData.confirmPassword)
		return res.status(401).json({
			error: [{ password: "As senhas devem ser iguais" }],
		});

	userData.password = await security.createPasswordHash(userData.password);

	await User.update(userData, {
		where: {
			id: req.params.id,
		},
	})
		.then((data) => {
			if (!data)
				return res
					.status(401)
					.json({ error: ["Não foi possível atualizar o usuário."] });
			return res
				.status(200)
				.json({ message: "Usuário atualizado com sucesso." });
		})
		.catch((err) => {
			const errors = {};
			err.errors.map((error) => {
				errors[error.path] = error.message;
			});
			return res.status(401).json({ error: errors });
		});
});

//////////////////////////////////////////////////////////////////////////////

router.patch("/users/:id", async (req, res) => {
	const token = await validateSession(req.headers.authorization);

	if (!token)
		return res.status(403).json({ message: "Faça o login para acessar." });

	const role = await security.getUserRole(token);

	if (role < 3)
		return res
			.status(403)
			.json({ message: "Voce não tem permissão para realizar essa ação." });

	const userData = req.body;

	if (userData.password && userData.password.length < minPasswordLength)
		return res.status(401).json({
			error: [{ password: `A senha deve ter pelo menos ${minPasswordLength} caracteres` }],
		});

	if (userData.password && userData.password !== userData.confirmPassword)
		return res.status(401).json({ 
	error: [{ password: "As senhas devem ser iguais" }],
});

	if (userData.password)
		userData.password = await security.createPasswordHash(userData.password);

	await User.update(userData, {
		where: {
			id: req.params.id,
		},
	})
		.then((data) => {
			if (!data)
				return res
					.status(401)
					.json({ error: ["Não foi possível atualizar o usuário."] });
			return res
				.status(200)
				.json({ message: "Usuário atualizado com sucesso." });
		})
		.catch((err) => {
			const errors = {};
			err.errors.map((error) => {
				errors[error.path] = error.message;
			});
			return res.status(401).json({ error: errors });
		});
});

//////////////////////////////////////////////////////////////////////////////

router.delete("/users/:id", async (req, res) => {
	const token = await validateSession(req.headers.authorization);

	if (!token)
		return res.status(403).json({ message: "Faça o login para acessar." });

	const role = await security.getUserRole(token);

	if (role < 3)
		return res
			.status(403)
			.json({ message: "Voce não tem permissão para realizar essa ação." });

	await User.update(
		{ isActive: false },
		{
			where: {
				id: req.params.id,
			},
		}
	)
		.then((data) => {
			if (!data)
				return res
					.status(401)
					.json({ error: ["Não foi possível apagar o usuário."] });
			return res.status(200).json({ message: "Usuário deletado com sucesso." });
		})
		.catch((err) => {
			console.log(err);
			return res.status(500).json({ error: ["Não foi possível apagar o usuário."] });
		});
});

//////////////////////////////////////////////////////////////////////////////

export default router;
