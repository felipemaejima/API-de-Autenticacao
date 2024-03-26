import express from "express";
import db from "../db.js";
import { Op } from "sequelize";
import User from "../models/user.model.js";
import security from "../security.js";

const router = express.Router();

db.connect();

router.get("/", async (req, res) => {

    if(!req.headers.session) return res.json({ message: "Envie as credenciais para realizar o login" });

    await User.findOne({
		where: {
            sess_hash: req.headers.session,
		},
		attributes: ["sess_time"],
	})
        .then((user) => {
			if (!user) return res.json({ message: "Envie as credenciais para realizar o login" });
			
            return security.verifySessionValidity(user.sess_time) 
            ? res.json({ message: "Já há uma sessão ativa.", redirect: '/users' })
            : res.json({ message: "Página de login." });
        })
	
});


router.post("/", async (req, res) => {

	const userData = req.body;

	// Verifica se a sessão ainda está ativa
    if(req.headers.session) {
        const userSession = await User.findOne({
            where: {
                sess_hash: req.headers.session,
            },
            attributes: ["sess_time"],
        })
        .then((user) => {
            return user ? user.sess_time : false;
        })
        if (userSession && security.verifySessionValidity(userSession)) 
            return res.json({ message: "Já há uma sessaão ativa.", redirect: '/users' });
    }

	// Case sessão não esteja ativa, verifica credenciais
	if (!userData.user)
		return res.status(400).json({ error: "Usuário não informado" });
	if (!userData.password)
		return res.status(400).json({ error: "Senha não informada" });

	await User.findOne({
		where: {
			[Op.or]: [
				{ username: userData.user  },
				{ email: userData.user },
			],
		},
		attributes: ["id", "username", "password"],
	}).then(async (user) => {

		if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

		await security.comparePasswordHash(userData.password, user.password)
			.then(async (result) => {
				if (!result) return res.status(400).json({ error: "Credenciais inválidas" });
					
				const validationToken = await security.createSessionHash(user.id, user.username);
				await User.update(
					{ sess_hash: validationToken, sess_time: new Date() },
					{ where: { id: user.id } }
				)
					.then(() => {
						return res.status(200).json({ token: validationToken, redirect: '/users' });
					})
					.catch((err) => {
						return res.status(400).json({error: "Erro ao iniciar sessão.", data: err});
					});
			});
	})
	.catch((err) => {
		return res.status(400).json({ error: "Erro ao fazer o login.", data: err });
	})
});
export default router;
