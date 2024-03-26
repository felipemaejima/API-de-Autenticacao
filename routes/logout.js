import express from "express";
import db from "../db.js";
import User from "../models/user.model.js";
import security from "../security.js";

const router = express.Router();

db.connect();

router.post("/", async (req, res) => {
    if(!req.headers.session) return res.json({ message: "A sessão já está encerrada", redirect: '/login' });
    await User.findOne({
        where: {
            sess_hash: req.headers.session,
        },
        attributes: ["id", "username"],
    })
        .then( async (user) => {
            if (!user) return res.status(400).json({ error: "A sessão já está encerrada" , redirect: '/login' });
			
            const validationToken = await security.createSessionHash(user.id, user.username);
            await User.update(
                { sess_hash: validationToken, sess_time: new Date() },
                { where: { id: user.id } }
            )
                .then(() => {
                    return res.status(200).json({ message: "Deslogado com sucesso", redirect: '/' });
                })
                .catch((err) => {
                    return res.status(400).json({error: "Erro ao encerrar a sessão.", data: err,});
                });
        })
		.catch((err) => {
			return res.status(400).json({ error: "Erro ao encontrar a sessão do usuário.", data: err });
		})
})

export default router;
