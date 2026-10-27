import express from "express";
import path from "path";
import dotenv from "dotenv";
import alunosRouter from "./routes/alunos";
import { testarConexao } from "./config/database";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/alunos", alunosRouter);

async function iniciarServidor(): Promise<void> {
  try {
    await testarConexao();
    app.listen(PORT, () => {
      console.log(`Portal Acadêmico disponível em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Não foi possível conectar ao MySQL.");
    console.error("Confira se o serviço está ativo e revise as credenciais do arquivo .env.");
    console.error(error);
    process.exit(1);
  }
}

void iniciarServidor();
