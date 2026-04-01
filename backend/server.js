require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api/usuarios", require("./routes/usuarios"));
app.use("/api/tarefas", require("./routes/tarefas"));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

async function initDB() {
  const sql = fs.readFileSync(path.join(__dirname, "../database.sql"), "utf8");
  await pool.query(sql);
}

initDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Servidor rodando em http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Erro ao conectar ao banco de dados:", err.message);
    process.exit(1);
  });
