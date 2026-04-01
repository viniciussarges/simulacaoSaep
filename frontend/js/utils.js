const API = "http://localhost:3000/api";

function toast(msg, tipo = "success") {
  const el = document.createElement("div");
  el.className = `alert alert-${tipo} position-fixed top-0 end-0 m-3`;
  el.style.cssText = "z-index:9999;min-width:260px;animation:fadeIn .2s";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function setNavActive() {
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link[data-page]").forEach((a) => {
    a.classList.toggle("active", a.dataset.page === page);
  });
}

document.addEventListener("DOMContentLoaded", setNavActive);
