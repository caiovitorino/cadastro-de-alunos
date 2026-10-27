import { Router, Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/database";
import { Aluno, NovoAluno } from "../types/aluno";

const router = Router();

function validarAluno(dados: Partial<NovoAluno>): string | null {
  const nome = typeof dados.nome === "string" ? dados.nome.trim() : "";
  const email = typeof dados.email === "string" ? dados.email.trim() : "";
  const curso = typeof dados.curso === "string" ? dados.curso.trim() : "";

  if (!nome || !email || !curso) {
    return "Preencha nome, e-mail e curso.";
  }
  if (nome.length > 120 || curso.length > 120 || email.length > 160) {
    return "Um ou mais campos ultrapassaram o limite permitido.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Informe um e-mail válido.";
  }
  return null;
}

// GET /api/alunos?nome=ana
router.get("/", async (req: Request, res: Response) => {
  try {
    const nome = typeof req.query.nome === "string" ? req.query.nome.trim() : "";
    let rows: RowDataPacket[];
    if (nome) {
      [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT id, nome, email, curso FROM alunos WHERE nome LIKE ? ORDER BY id DESC",
        [`%${nome}%`]
      );
    } else {
      [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT id, nome, email, curso FROM alunos ORDER BY id DESC"
      );
    }
    res.json(rows as Aluno[]);
  } catch (error) {
    console.error("Erro ao consultar alunos:", error);
    res.status(500).json({ mensagem: "Não foi possível carregar os alunos." });
  }
});

// POST /api/alunos
router.post("/", async (req: Request, res: Response) => {
  const dados: Partial<NovoAluno> = req.body;
  const erro = validarAluno(dados);
  if (erro) return res.status(400).json({ mensagem: erro });

  const nome = dados.nome!.trim();
  const email = dados.email!.trim().toLowerCase();
  const curso = dados.curso!.trim();

  try {
    const [resultado] = await pool.execute<ResultSetHeader>(
      "INSERT INTO alunos (nome, email, curso) VALUES (?, ?, ?)",
      [nome, email, curso]
    );
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, nome, email, curso FROM alunos WHERE id = ?",
      [resultado.insertId]
    );
    return res.status(201).json(rows[0] as Aluno);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error &&
        (error as { code?: string }).code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensagem: "Este e-mail já está cadastrado." });
    }
    console.error("Erro ao cadastrar aluno:", error);
    return res.status(500).json({ mensagem: "Não foi possível cadastrar o aluno." });
  }
});

// DELETE /api/alunos/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ mensagem: "Identificador de aluno inválido." });
  }

  try {
    const [resultado] = await pool.execute<ResultSetHeader>(
      "DELETE FROM alunos WHERE id = ?",
      [id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: "Aluno não encontrado." });
    }
    return res.json({ mensagem: "Aluno excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir aluno:", error);
    return res.status(500).json({ mensagem: "Não foi possível excluir o aluno." });
  }
});

export default router;
