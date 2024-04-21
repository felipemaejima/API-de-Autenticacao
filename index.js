import express from "express";
import userRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";
import genPassRouter from "./routes/generate-password.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/dashboard", userRouter);
app.use("/auth", authRouter);

app.use('/generate-password', genPassRouter);

app.listen(process.env.PORT, () => {
	console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
