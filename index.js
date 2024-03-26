import express from "express";
import userRouter from "./routes/users.js";
import loginRouter from "./routes/login.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/", userRouter);
app.use("/login", loginRouter);

app.listen(process.env.PORT, () => {
	console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
