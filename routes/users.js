import express from "express";
import sequelize from "../db.js";
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
    if(!req.headers.session) return res.json({ message: "Faça o login para acessar as informações" });
	await User.findOne({
		where: {
			sess_hash: req.headers.session,
		},
		attributes: ["username", "sess_hash"],
	})
		.then(async (user) => {
			if (!user) {
				return res
					.status(403)
					.json({
						error: "Faça o login para acessar as informações.",
					});
			}
			const allUsers = await User.findAll({
				attributes: ["username", "email"],
			});
			const users = allUsers.map((user) => user.toJSON());
			res.status(200).send({ loggedUser: user.username, users });
		})
		.catch((err) => {
			res.status(500).send({ error: err });
		});
});

router.post("/", async (req, res) => {
	const userData = req.body;

	const token = req.headers.session ? req.headers.session : null;
	await User.findOne({
		where: {
			sess_hash: token,
		},
		attributes: ["username", "sess_hash"],
	})
		.then(async (user) => {
			if (!user) {
				return res
					.status(403)
					.json({
						error: "Faça o login para inserir as informações.",
					});
			}
			let userError = !userData.username
				? { error: "Nome de Usuário não informado" }
				: false;
			if (userError) return res.status(400).json(userError);

			let emailError = !userData.email
				? { error: "Email não informado" }
				: false;
			if (emailError) return res.status(400).json(emailError);

			let passError = !userData.password
				? { error: "Senha não informada" }
				: false;
			passError =
				!passError && userData.password.length < 3
					? { error: "A senha deve ter pelo menos 3 caracteres" }
					: false;
			if (passError) return res.status(400).json(passError);

			const password = await security.createPasswordHash(
				userData.password
			);
			const sessHash = await security.createSessionHash(
				"firstSessionHash",
				userData.username
			);
			await User.create({
				username: userData.username,
				email: userData.email,
				password: password,
				sess_hash: sessHash,
				sess_time: new Date(),
			})
				.then((data) => {
					return res
						.status(200)
						.json({
							message: "Usuário criado com sucesso.",
							data: data,
						});
				})
				.catch((err) => {
					return res
						.status(400)
						.json({ error: err.errors[0].message });
				});
		})
		.catch((err) => {
			res.status(500).send({ error: err });
		});
});

export default router;
