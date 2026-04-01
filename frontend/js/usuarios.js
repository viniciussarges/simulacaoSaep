async function carregarUsuarios() {
  const res = await fetch(`${API}/usuarios`);
  const usuarios = await res.json();
  const tbody = document.getElementById("tabela-usuarios");

  if (!usuarios.length) {
    tbody.innerHTML =
      '<tr><td colspan="3" class="text-center text-muted">Nenhum usuário cadastrado</td></tr>';
    return;
  }

  tbody.innerHTML = usuarios
    .map(
      (u) => `
    <tr>
      <td>${u.id}</td>
      <td>${escHtml(u.nome)}</td>
      <td>${escHtml(u.email)}</td>
    </tr>
  `
    )
    .join("");
}

function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

document.getElementById("formUsuario").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();

  const res = await fetch(`${API}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email }),
  });

  const data = await res.json();

  if (res.ok) {
    toast("Usuário cadastrado com sucesso!");
    e.target.reset();
    await carregarUsuarios();
  } else {
    toast(data.erro || "Erro ao cadastrar", "danger");
  }
});

carregarUsuarios();
