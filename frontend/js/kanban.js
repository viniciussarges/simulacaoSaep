let tarefas = [];

const LABELS = { a_fazer: "A Fazer", fazendo: "Fazendo", pronto: "Pronto" };
const PRIORIDADE_LABEL = { baixa: "Baixa", media: "Média", alta: "Alta" };
const PRIORIDADE_BADGE = {
  baixa: "text-bg-success",
  media: "text-bg-warning",
  alta: "text-bg-danger",
};

async function carregarTarefas() {
  const res = await fetch(`${API}/tarefas`);
  tarefas = await res.json();
  renderKanban();
}

function renderKanban() {
  ["a_fazer", "fazendo", "pronto"].forEach((status) => {
    const col = document.getElementById(`col-${status}`);
    const items = tarefas.filter((t) => t.status === status);

    document.getElementById(`count-${status}`).textContent = items.length;

    if (!items.length) {
      col.innerHTML =
        '<div class="text-center text-muted small py-4">Nenhuma tarefa</div>';
      return;
    }

    col.innerHTML = items
      .map(
        (t) => `
      <div class="card" id="card-${t.id}">
        <div class="card-body p-2">
          <div class="d-flex justify-content-between align-items-start">
            <span class="badge ${PRIORIDADE_BADGE[t.prioridade]}">${
          PRIORIDADE_LABEL[t.prioridade]
        }</span>
            <small class="text-muted">${new Date(
              t.data_cadastro
            ).toLocaleDateString("pt-BR")}</small>
          </div>
          <div class="fw-semibold text-dark my-1" style="font-size:0.9rem;word-break:break-word">${escHtml(
            t.descricao
          )}</div>
          <div class="text-muted small mb-2">
            <i class="bi bi-building"></i> ${escHtml(t.setor)}
            &nbsp;·&nbsp;
            <i class="bi bi-person"></i> ${escHtml(t.nome_usuario)}
          </div>
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-1">
            <select class="form-select form-select-sm w-auto" onchange="alterarStatus(${
              t.id
            }, this.value)">
              ${Object.entries(LABELS)
                .map(
                  ([v, l]) =>
                    `<option value="${v}" ${
                      v === t.status ? "selected" : ""
                    }>${l}</option>`
                )
                .join("")}
            </select>
            <div class="d-flex gap-1">
              <button class="btn btn-outline-primary btn-sm" onclick="abrirEdicao(${
                t.id
              })">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-outline-danger btn-sm" onclick="confirmarExclusao(${
                t.id
              })">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `
      )
      .join("");
  });
}

function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function alterarStatus(id, status) {
  await fetch(`${API}/tarefas/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  await carregarTarefas();
}

async function abrirEdicao(id) {
  const tarefa = tarefas.find((t) => t.id === id);
  if (!tarefa) return;

  const res = await fetch(`${API}/usuarios`);
  const usuarios = await res.json();

  document.getElementById("edit-id").value = tarefa.id;
  document.getElementById("edit-descricao").value = tarefa.descricao;
  document.getElementById("edit-setor").value = tarefa.setor;
  document.getElementById("edit-prioridade").value = tarefa.prioridade;
  document.getElementById("edit-status").value = tarefa.status;

  const selUser = document.getElementById("edit-usuario");
  selUser.innerHTML = usuarios
    .map(
      (u) =>
        `<option value="${u.id}" ${
          u.id === tarefa.id_usuario ? "selected" : ""
        }>${escHtml(u.nome)}</option>`
    )
    .join("");

  new bootstrap.Modal(document.getElementById("modalEdicao")).show();
}

document.getElementById("formEdicao").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("edit-id").value;

  const body = {
    id_usuario: parseInt(document.getElementById("edit-usuario").value),
    descricao: document.getElementById("edit-descricao").value,
    setor: document.getElementById("edit-setor").value,
    prioridade: document.getElementById("edit-prioridade").value,
    status: document.getElementById("edit-status").value,
  };

  const res = await fetch(`${API}/tarefas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    bootstrap.Modal.getInstance(document.getElementById("modalEdicao")).hide();
    toast("Tarefa atualizada com sucesso!");
    await carregarTarefas();
  } else {
    const data = await res.json();
    toast(data.erro || "Erro ao atualizar", "danger");
  }
});

let excluirId = null;

function confirmarExclusao(id) {
  excluirId = id;
  const tarefa = tarefas.find((t) => t.id === id);
  document.getElementById("confirm-desc").textContent = tarefa?.descricao || "";
  new bootstrap.Modal(document.getElementById("modalConfirm")).show();
}

document
  .getElementById("btnConfirmarExclusao")
  .addEventListener("click", async () => {
    if (!excluirId) return;
    const res = await fetch(`${API}/tarefas/${excluirId}`, {
      method: "DELETE",
    });
    bootstrap.Modal.getInstance(document.getElementById("modalConfirm")).hide();
    if (res.ok) {
      toast("Tarefa removida com sucesso!");
      await carregarTarefas();
    } else {
      toast("Erro ao remover tarefa", "danger");
    }
    excluirId = null;
  });

carregarTarefas();
