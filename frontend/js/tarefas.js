async function carregarUsuarios() {
  const res = await fetch(`${API}/usuarios`);
  const usuarios = await res.json();
  const sel = document.getElementById("id_usuario");

  if (!usuarios.length) {
    sel.innerHTML = '<option value="">Nenhum usuário cadastrado</option>';
    return;
  }

  sel.innerHTML =
    '<option value="">Selecione um usuário</option>' +
    usuarios
      .map((u) => `<option value="${u.id}">${escHtml(u.nome)}</option>`)
      .join("");
}

function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

document.getElementById("formTarefa").addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    id_usuario: parseInt(document.getElementById("id_usuario").value),
    descricao: document.getElementById("descricao").value.trim(),
    setor: document.getElementById("setor").value.trim(),
    prioridade: document.getElementById("prioridade").value,
  };

  const res = await fetch(`${API}/tarefas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (res.ok) {
    toast("Tarefa cadastrada com sucesso!");
    e.target.reset();
    await carregarUsuarios();
  } else {
    toast(data.erro || "Erro ao cadastrar", "danger");
  }
});

carregarUsuarios();
