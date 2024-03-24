import express from "express";
import sequelize from "../db.js";
import { Op } from "sequelize";
import User from "../models/user.model.js";
import security from "../security.js";

const router = express.Router();

(async () => {
	try {
		await sequelize.authenticate();
		console.log("Conexão estabelecida com sucesso.");

		await sequelize.sync();
		console.log("Modelos sincronizados.");
	} catch (err) {
		console.error("Erro ao conectar ou sincronizar modelos:", err);
	}
})();

router.get("/", async (req, res) => {
    if(!req.headers.session) return res.json({ message: "Envie as credenciais para realizar o login" });
    await User.findOne({
		where: {
            sess_hash: req.headers.session,
		},
		attributes: ["sess_time"],
	})
        .then((user) => {
            return security.verifySessionValidity(user.sess_time) 
            ? res.json({ message: "As credenciais já  foram autenticadas", redirect: '/' })
            : res.json({ message: "Envie as credenciais para realizar o login" });
        })
	
});

router.post("/", async (req, res) => {
	const userData = req.body;
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
            return res.json({ message: "As credenciais já foram autenticadas", redirect: '/' });
    }

	if (!userData.user)
		return res.status(400).json({ error: "Usuário não informado" });
	if (!userData.password)
		return res.status(400).json({ error: "Senha não informada" });

	await User.findOne({
		where: {
			[Op.or]: [
				{ username: userData.user ? userData.user : null },
				{ email: userData.user ? userData.user : null },
			],
		},
		attributes: ["id", "username", "password"],
	}).then(async (user) => {
		if (!user) {
			return res.status(400).json({ error: "Usuário não encontrado" });
		}
		await security
			.comparePasswordHash(userData.password, user.password)
			.then(async (result) => {
				if (!result) {
					return res
						.status(400)
						.json({ error: "Credenciais inválidas" });
				}
				const validationToken = await security.createSessionHash(
					user.id,
					user.username
				);
				await User.update(
					{ sess_hash: validationToken, sess_time: new Date() },
					{ where: { id: user.id } }
				)
					.then(() => {
						return res.status(200).json({ token: validationToken });
					})
					.catch((err) => {
						return res
							.status(400)
							.json({
								error: "Erro ao atualizar sessão.",
								data: err,
							});
					});
			});
	});
});
router.post("/logout", async (req, res) => {
    if(!req.headers.session) return res.json({ message: "Já está deslogado", redirect: '/login' });
    await User.findOne({
        where: {
            sess_hash: req.headers.session,
        },
        attributes: ["id", "username"],
    })
        .then( async (user) => {
            if (!user) {
                return res.status(400).json({ error: "Usuário não encontrado" , redirect: '/' });
            }
            const validationToken = await security.createSessionHash(
                user.id,
                user.username
            );
            await User.update(
                { sess_hash: validationToken, sess_time: new Date() },
                { where: { id: user.id } }
            )
                .then(() => {
                    return res.status(200).json({ message: "Deslogado com sucesso", redirect: '/' });
                })
                .catch((err) => {
                    return res
                        .status(400)
                        .json({
                            error: "Erro ao atualizar sessão.",
                            data: err,
                        });
                });
        })
})

export default router;
