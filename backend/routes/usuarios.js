const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios ORDER BY nome");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE id = $1", [
      req.params.id,
    ]);
    if (!result.rows.length)
      return res.status(404).json({ erro: "Usuário não encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.post("/", async (req, res) => {
  const { nome, email } = req.body;
  if (!nome || !email)
    return res.status(400).json({ erro: "Todos os campos são obrigatórios" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ erro: "Formato de e-mail inválido" });

  try {
    const result = await pool.query(
      "INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING *",
      [nome.trim(), email.trim().toLowerCase()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ erro: "E-mail já cadastrado" });
    res.status(500).json({ erro: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const { nome, email } = req.body;
  if (!nome || !email)
    return res.status(400).json({ erro: "Todos os campos são obrigatórios" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ erro: "Formato de e-mail inválido" });

  try {
    const result = await pool.query(
      "UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3 RETURNING *",
      [nome.trim(), email.trim().toLowerCase(), req.params.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ erro: "Usuário não encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ erro: "E-mail já cadastrado" });
    res.status(500).json({ erro: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM usuarios WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ erro: "Usuário não encontrado" });
    res.json({ mensagem: "Usuário removido com sucesso" });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
