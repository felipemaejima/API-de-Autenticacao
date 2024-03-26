import express from "express";
import userRouter from "./routes/users.js";
import loginRouter from "./routes/login.js";
import logoutRouter from "./routes/logout.js";
import genPassRouter from "./routes/generate-password.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/users", userRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);

app.use('/generate-password', genPassRouter);

app.listen(process.env.PORT, () => {
	console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
