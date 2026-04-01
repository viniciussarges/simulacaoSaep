const express = require("express");
const router = express.Router();
const pool = require("../db");

const PRIORIDADES = ["baixa", "media", "alta"];
const STATUS = ["a_fazer", "fazendo", "pronto"];

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.nome AS nome_usuario
      FROM tarefas t
      JOIN usuarios u ON u.id = t.id_usuario
      ORDER BY t.data_cadastro DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT t.*, u.nome AS nome_usuario
      FROM tarefas t
      JOIN usuarios u ON u.id = t.id_usuario
      WHERE t.id = $1
    `,
      [req.params.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ erro: "Tarefa não encontrada" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.post("/", async (req, res) => {
  const { id_usuario, descricao, setor, prioridade } = req.body;

  if (!id_usuario || !descricao || !setor || !prioridade)
    return res.status(400).json({ erro: "Todos os campos são obrigatórios" });

  if (!PRIORIDADES.includes(prioridade))
    return res.status(400).json({ erro: "Prioridade inválida" });

  try {
    const result = await pool.query(
      `INSERT INTO tarefas (id_usuario, descricao, setor, prioridade)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id_usuario, descricao.trim(), setor.trim(), prioridade]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23503")
      return res.status(400).json({ erro: "Usuário não encontrado" });
    res.status(500).json({ erro: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const { id_usuario, descricao, setor, prioridade, status } = req.body;

  if (!id_usuario || !descricao || !setor || !prioridade || !status)
    return res.status(400).json({ erro: "Todos os campos são obrigatórios" });

  if (!PRIORIDADES.includes(prioridade))
    return res.status(400).json({ erro: "Prioridade inválida" });

  if (!STATUS.includes(status))
    return res.status(400).json({ erro: "Status inválido" });

  try {
    const result = await pool.query(
      `UPDATE tarefas
       SET id_usuario = $1, descricao = $2, setor = $3, prioridade = $4, status = $5
       WHERE id = $6 RETURNING *`,
      [
        id_usuario,
        descricao.trim(),
        setor.trim(),
        prioridade,
        status,
        req.params.id,
      ]
    );
    if (!result.rows.length)
      return res.status(404).json({ erro: "Tarefa não encontrada" });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23503")
      return res.status(400).json({ erro: "Usuário não encontrado" });
    res.status(500).json({ erro: err.message });
  }
});

router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;

  if (!STATUS.includes(status))
    return res.status(400).json({ erro: "Status inválido" });

  try {
    const result = await pool.query(
      "UPDATE tarefas SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ erro: "Tarefa não encontrada" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM tarefas WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ erro: "Tarefa não encontrada" });
    res.json({ mensagem: "Tarefa removida com sucesso" });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
