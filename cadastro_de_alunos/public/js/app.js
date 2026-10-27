const studentsBody = document.querySelector("#students-body");
const searchInput = document.querySelector("#search-input");
const totalAlunos = document.querySelector("#total-alunos");
const totalCursos = document.querySelector("#total-cursos");
const ultimoCadastro = document.querySelector("#ultimo-cadastro");
const resultsCount = document.querySelector("#results-count");
const footerCount = document.querySelector("#footer-count");
const modal = document.querySelector("#student-modal");
const deleteModal = document.querySelector("#delete-modal");
const form = document.querySelector("#student-form");
const formError = document.querySelector("#form-error");
const saveButton = document.querySelector("#save-student");
const toastRegion = document.querySelector("#toast-region");
let alunos = [];
let alunoParaExcluir = null;
function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (char) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[char] || char));
}
function iniciais(nome) {
    return nome.trim().split(/\s+/).slice(0, 2).map((parte) => parte[0] || "").join("").toUpperCase();
}
function mostrarToast(titulo, mensagem, erro = false) {
    const toast = document.createElement("div");
    toast.className = `toast${erro ? " error" : ""}`;
    toast.innerHTML = `<span class="toast-mark">${erro ? "!" : "✓"}</span><div><strong>${escapeHtml(titulo)}</strong><p>${escapeHtml(mensagem)}</p></div>`;
    toastRegion.appendChild(toast);
    window.setTimeout(() => toast.remove(), 4200);
}
function mostrarErroLinha(mensagem) {
    studentsBody.innerHTML = `<tr><td colspan="5" class="empty-cell"><span class="empty-state-icon">!</span>${escapeHtml(mensagem)}</td></tr>`;
    resultsCount.textContent = "Não foi possível carregar";
    footerCount.textContent = "Verifique a conexão com o servidor.";
}
function renderizarAlunos() {
    const termo = searchInput.value.trim().toLocaleLowerCase("pt-BR");
    const filtrados = alunos.filter((aluno) => [aluno.nome, aluno.email, aluno.curso].some((campo) => campo.toLocaleLowerCase("pt-BR").includes(termo)));
    totalAlunos.textContent = String(alunos.length);
    totalCursos.textContent = String(new Set(alunos.map((a) => a.curso.trim().toLocaleLowerCase("pt-BR"))).size);
    ultimoCadastro.textContent = alunos.length ? `#${alunos[0].id}` : "Nenhum";
    resultsCount.textContent = `${filtrados.length} ${filtrados.length === 1 ? "registro" : "registros"}`;
    footerCount.textContent = `Exibindo ${filtrados.length} de ${alunos.length} alunos`;
    if (!filtrados.length) {
        const buscando = Boolean(termo);
        studentsBody.innerHTML = `<tr><td colspan="5" class="empty-cell"><span class="empty-state-icon">${buscando ? "⌕" : "＋"}</span>${buscando ? "Nenhum aluno corresponde à sua busca." : "Ainda não há alunos cadastrados. Clique em “Novo aluno” para começar."}</td></tr>`;
        return;
    }
    studentsBody.innerHTML = filtrados.map((aluno) => `
    <tr>
      <td><span class="student-sub">#${aluno.id}</span></td>
      <td><div class="student-cell"><span class="student-avatar">${escapeHtml(iniciais(aluno.nome))}</span><div><div class="student-name">${escapeHtml(aluno.nome)}</div><div class="student-sub">Aluno cadastrado</div></div></div></td>
      <td class="email-text">${escapeHtml(aluno.email)}</td>
      <td><span class="course-pill" title="${escapeHtml(aluno.curso)}">${escapeHtml(aluno.curso)}</span></td>
      <td class="actions-cell"><button class="action-delete" type="button" data-delete="${aluno.id}" aria-label="Excluir ${escapeHtml(aluno.nome)}" title="Excluir aluno"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6"/></svg></button></td>
    </tr>`).join("");
}
async function carregarAlunos() {
    studentsBody.innerHTML = '<tr><td colspan="5" class="loading-cell"><span class="spinner"></span> Carregando alunos...</td></tr>';
    try {
        const resposta = await fetch("/api/alunos");
        if (!resposta.ok)
            throw new Error("A API retornou um erro ao consultar os alunos.");
        alunos = await resposta.json();
        renderizarAlunos();
    }
    catch (error) {
        console.error(error);
        mostrarErroLinha("Não foi possível carregar os dados. Confira se o servidor e o MySQL estão ativos.");
        mostrarToast("Falha na consulta", "Verifique o servidor e a conexão com o banco.", true);
    }
}
function abrirModal() {
    form.reset();
    formError.textContent = "";
    modal.showModal();
    window.setTimeout(() => document.querySelector("#nome")?.focus(), 50);
}
function fecharModal() {
    modal.close();
    formError.textContent = "";
}
form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formError.textContent = "";
    const dados = {
        nome: document.querySelector("#nome").value.trim(),
        email: document.querySelector("#email").value.trim(),
        curso: document.querySelector("#curso").value.trim()
    };
    if (!dados.nome || !dados.email || !dados.curso) {
        formError.textContent = "Preencha todos os campos para continuar.";
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
        formError.textContent = "Digite um endereço de e-mail válido.";
        return;
    }
    saveButton.disabled = true;
    saveButton.textContent = "Salvando...";
    try {
        const resposta = await fetch("/api/alunos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
        const resultado = await resposta.json();
        if (!resposta.ok) {
            formError.textContent = "mensagem" in resultado && resultado.mensagem ? resultado.mensagem : "Não foi possível cadastrar o aluno.";
            return;
        }
        fecharModal();
        mostrarToast("Cadastro realizado", `${dados.nome} foi adicionado à lista.`);
        await carregarAlunos();
    }
    catch (error) {
        console.error(error);
        formError.textContent = "Falha de comunicação com o servidor. Tente novamente.";
    }
    finally {
        saveButton.disabled = false;
        saveButton.textContent = "Salvar cadastro";
    }
});
studentsBody.addEventListener("click", (event) => {
    const alvo = event.target;
    const botao = alvo.closest("[data-delete]");
    if (!botao)
        return;
    const id = Number(botao.dataset.delete);
    const aluno = alunos.find((item) => item.id === id);
    if (!aluno)
        return;
    alunoParaExcluir = id;
    document.querySelector("#delete-description").textContent =
        `O cadastro de ${aluno.nome} será removido permanentemente. Esta ação não pode ser desfeita.`;
    deleteModal.showModal();
});
document.querySelector("#confirm-delete").addEventListener("click", async () => {
    if (alunoParaExcluir === null)
        return;
    const id = alunoParaExcluir;
    const botao = document.querySelector("#confirm-delete");
    botao.disabled = true;
    botao.textContent = "Excluindo...";
    try {
        const resposta = await fetch(`/api/alunos/${id}`, { method: "DELETE" });
        const resultado = await resposta.json();
        if (!resposta.ok)
            throw new Error(resultado.mensagem || "Não foi possível excluir o aluno.");
        deleteModal.close();
        mostrarToast("Aluno excluído", resultado.mensagem || "O registro foi removido.");
        await carregarAlunos();
    }
    catch (error) {
        mostrarToast("Não foi possível excluir", error instanceof Error ? error.message : "Tente novamente.", true);
    }
    finally {
        alunoParaExcluir = null;
        botao.disabled = false;
        botao.textContent = "Confirmar exclusão";
    }
});
document.querySelector("#btn-novo").addEventListener("click", abrirModal);
document.querySelector("#close-modal").addEventListener("click", fecharModal);
document.querySelector("#cancel-modal").addEventListener("click", fecharModal);
document.querySelector("#cancel-delete").addEventListener("click", () => {
    alunoParaExcluir = null;
    deleteModal.close();
});
document.querySelector("#btn-atualizar").addEventListener("click", () => void carregarAlunos());
searchInput.addEventListener("input", renderizarAlunos);
modal.addEventListener("click", (event) => { if (event.target === modal)
    fecharModal(); });
deleteModal.addEventListener("click", (event) => { if (event.target === deleteModal)
    deleteModal.close(); });
document.querySelector("#year").textContent = String(new Date().getFullYear());
document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "short", year: "numeric"
}).format(new Date());
void carregarAlunos();
