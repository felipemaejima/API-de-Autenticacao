import express from "express";
import db from "../db.js";
import User from "../models/user.model.js";
import security from "../security.js";

const router = express.Router();

db.connect();

router.get("/", async (req, res) => {
	// verifica se a sessão está atíva para retornar os usuários
    if(!req.headers.session) return res.json({ message: "Faça o login para acessar as informações" , redirect: '/login' });

	await User.findOne({
		where: {
			sess_hash: req.headers.session,
		},
		attributes: ["username", "sess_time"],
	})
		.then(async (user) => {
			if (!user) return res.status(403).json({message: "Faça o login para acessar as informações.",  redirect: '/login' });

			if( !security.verifySessionValidity(user.sess_time)) { 
				return res.json({ message: "Sessão expirada, faca o login para acessar as informações.", redirect: '/login' });
			}

			const allUsers = await User.findAll();
			const users = allUsers.map((user) => user.toJSON());
			res.status(200).json({ loggedUser: user.username, users });
		})
		.catch((err) => {
			res.status(500).json({ message: "Erro ao buscar usuários",  error: err });
		});
});

router.post("/", async (req, res) => {
	const userData = req.body;

	// verifica se a sessão está atíva para inserir o novo usuário
	if(!req.headers.session) return res.status(403).json({ message: "Faça o login adicionar usuários." , redirect: '/login'  });

	await User.findOne({
		where: {
			sess_hash: req.headers.session,
		},
		attributes: ["sess_time"],
	})
		.then(async (user) => {
			if (!user) return res.status(403).json({error: "Faça o login para inserir as informações.", redirect: '/login' });

			if( !security.verifySessionValidity(user.sess_time)) { 
				return res.json({ message: "Sessão expirada, faca o login para inserir usúario.", redirect: '/login' });
			}

			if (!userData.password)
				return res.status(400).json({ error: "A senha deve ser informada" });
			if (userData.password.length < 3)
				return res.status(400).json({ error: "A senha deve ter pelo menos 3 caracteres" });

			const password = await security.createPasswordHash(userData.password);
			const sessHash = await security.createSessionHash("firstSessionHash", userData.username);
			await User.create({
				username: userData.username,
				email: userData.email,
				password: password,
				sess_hash: sessHash,
				sess_time: new Date(),
			})
				.then((data) => {
					return res.status(200).json({message: "Usuário criado com sucesso.",  data: data})
				})
				.catch((err) => {
					return res.status(400).json({ error: err.errors[0].message });
				});
		})
		.catch((err) => {
			res.status(500).json({ message: "Erro ao criar usuário.", error: err });
		});
});

export default router;
