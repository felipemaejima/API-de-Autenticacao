import express from "express";
import db from "../db.js";
import passwordGenerator from "../passGenerator.js";

const router = express.Router();

db.connect();

router.get("/", async (req, res) => {
    const params = req.query.param || [10, 2, 2, 2];

    const pass = new passwordGenerator(...params);
    return res.json({ password: pass.getPassword() });
})

export default router;
