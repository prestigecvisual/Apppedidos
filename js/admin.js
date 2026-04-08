// ==========================================
// ADMIN - PRESTIGE COMUNICAÇÃO VISUAL
// ==========================================

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
    carregarDoNavegador();
    atualizarTudo();
});

// ================= DASHBOARD =================
function atualizarDashboard() {

    const totalOrc = document.getElementById("totalOrc");
    const totalPed = document.getElementById("totalPed");
    const faturamento = document.getElementById("faturamento");

    if (totalOrc) totalOrc.innerText = sistema.orcamentos.length;
    if (totalPed) totalPed.innerText = sistema.pedidos.length;

    let total = 0;

    sistema.pedidos.forEach(p => {
        total += p.total || 0;
    });

    if (faturamento) faturamento.innerText = total.toFixed(2);
}

// ================= CLIENTES =================
function renderClientes() {

    const div = document.getElementById("listaClientes");
    if (!div) return;

    div.innerHTML = "";

    // evita duplicados
    const mapa = new Map();

    sistema.orcamentos.concat(sistema.pedidos).forEach(reg => {
        if (!reg.cliente) return;

        const chave = reg.cliente.nome + reg.cliente.whatsapp;

        if (!mapa.has(chave)) {
            mapa.set(chave, reg.cliente);
        }
    });

    mapa.forEach(c => {

        const el = document.createElement("div");
        el.className = "pedido-card";

        el.innerHTML = `
            <strong>${c.nome || ""}</strong><br>
            📞 ${c.whatsapp || ""}<br>
            📧 ${c.email || ""}<br>
            📍 ${c.endereco || ""}<br>
        `;

        div.appendChild(el);
    });
}

// ================= ORÇAMENTOS =================
function renderOrcamentos() {

    const div = document.getElementById("listaOrcamentos");
    if (!div) return;

    div.innerHTML = "";

    sistema.orcamentos.forEach((o, i) => {

        const el = document.createElement("div");
        el.className = "pedido-card";

        el.innerHTML = `
            <strong>#${o.numero}</strong><br>
            ${o.cliente?.nome || ""}<br>
            R$ ${o.total.toFixed(2)}<br>
            <button onclick="aprovarOrcamento(${i})">✅ Aprovar</button>
            <button onclick="excluirOrcamento(${i})">🗑 Excluir</button>
        `;

        div.appendChild(el);
    });
}

// ================= PEDIDOS (LISTA) =================
function renderPedidos() {

    const div = document.getElementById("listaPedidos");
    if (!div) return;

    div.innerHTML = "";

    sistema.pedidos.forEach((p, i) => {

        const el = document.createElement("div");
        el.className = "pedido-card";

        el.innerHTML = `
            <strong>#${p.numero}</strong><br>
            ${p.cliente?.nome || ""}<br>
            Status: ${p.status}<br>
            <small>${p.dataAprovacao || ""}</small><br>

            <button onclick="avancarStatus(${i})">➡ Avançar</button>
            <button onclick="excluirPedido(${i})">🗑 Excluir</button>
        `;

        div.appendChild(el);
    });
}

// ================= KANBAN =================
function renderKanban() {

    const colunas = ["producao", "andamento", "finalizado", "entregue"];

    colunas.forEach(c => {
        const col = document.getElementById("col-" + c);
        if (col) col.innerHTML = "";
    });

    sistema.pedidos.forEach((p, i) => {

        const card = document.createElement("div");
        card.className = "pedido-card";

        card.innerHTML = `
            <strong>#${p.numero}</strong><br>
            ${p.cliente?.nome || ""}<br>
            R$ ${p.total.toFixed(2)}<br>
            <small>${p.dataAprovacao || ""}</small><br>

            <div style="margin-top:5px;">
                <button onclick="mudarStatus(${i}, 'producao')">P</button>
                <button onclick="mudarStatus(${i}, 'andamento')">A</button>
                <button onclick="mudarStatus(${i}, 'finalizado')">F</button>
                <button onclick="mudarStatus(${i}, 'entregue')">E</button>
            </div>
        `;

        const coluna = document.getElementById("col-" + p.status);

        if (coluna) coluna.appendChild(card);
    });
}

// ================= AÇÕES =================

// Aprovar orçamento → vira pedido
function aprovarOrcamento(index) {

    const o = sistema.orcamentos[index];

    sistema.pedidos.push({
        ...o,
        status: "producao",
        dataAprovacao: new Date().toLocaleDateString()
    });

    sistema.orcamentos.splice(index, 1);

    salvarNoNavegador();
    atualizarTudo();
}

// Avançar status automático
function avancarStatus(index) {

    const fluxo = {
        producao: "andamento",
        andamento: "finalizado",
        finalizado: "entregue",
        entregue: "entregue"
    };

    const atual = sistema.pedidos[index].status;

    sistema.pedidos[index].status = fluxo[atual];

    salvarNoNavegador();
    atualizarTudo();
}

// Mudar status direto (kanban)
function mudarStatus(index, status) {

    sistema.pedidos[index].status = status;

    salvarNoNavegador();
    atualizarTudo();
}

// Excluir orçamento
function excluirOrcamento(index) {

    if (!confirm("Excluir orçamento?")) return;

    sistema.orcamentos.splice(index, 1);

    salvarNoNavegador();
    atualizarTudo();
}

// Excluir pedido
function excluirPedido(index) {

    if (!confirm("Excluir pedido?")) return;

    sistema.pedidos.splice(index, 1);

    salvarNoNavegador();
    atualizarTudo();
}

// ================= ATUALIZAÇÃO GERAL =================
function atualizarTudo() {
    atualizarDashboard();
    renderClientes();
    renderOrcamentos();
    renderPedidos();
    renderKanban();
}
