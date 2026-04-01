CREATE TABLE IF NOT EXISTS usuarios (
  id    SERIAL PRIMARY KEY,
  nome  VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tarefas (
  id           SERIAL PRIMARY KEY,
  id_usuario   INT          NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  descricao    TEXT         NOT NULL,
  setor        VARCHAR(255) NOT NULL,
  prioridade   VARCHAR(10)  NOT NULL CHECK (prioridade IN ('baixa', 'media', 'alta')),
  data_cadastro TIMESTAMP   NOT NULL DEFAULT NOW(),
  status       VARCHAR(20)  NOT NULL DEFAULT 'a_fazer' CHECK (status IN ('a_fazer', 'fazendo', 'pronto'))
);
