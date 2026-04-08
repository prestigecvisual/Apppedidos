function atualizarDashboard() {

    document.getElementById("totalOrc").innerText = sistema.orcamentos.length;
    document.getElementById("totalPed").innerText = sistema.pedidos.length;

    let total = 0;

    sistema.pedidos.forEach(p => total += p.total);

    document.getElementById("faturamento").innerText = total.toFixed(2);
}

// ================= CLIENTES =================
function renderClientes() {

    const div = document.getElementById("listaClientes");
    div.innerHTML = "";

    sistema.orcamentos.forEach(o => {

        const c = o.cliente;

        const el = document.createElement("div");

        el.innerHTML = `
            <p><b>${c.nome}</b> - ${c.whatsapp}</p>
            <p>${c.email}</p>
            <p>${c.endereco}</p>
            <hr>
        `;

        div.appendChild(el);
    });
}

// ================= ORÇAMENTOS =================
function renderOrcamentos() {

    const div = document.getElementById("listaOrcamentos");
    div.innerHTML = "";

    sistema.orcamentos.forEach((o, i) => {

        const el = document.createElement("div");

        el.innerHTML = `
            <p><b>#${o.numero}</b> - ${o.cliente.nome}</p>
            <p>Total: R$ ${o.total}</p>
            <button onclick="aprovarPedido(${i})">Aprovar</button>
            <button onclick="excluirOrcamento(${i})">Excluir</button>
            <hr>
        `;

        div.appendChild(el);
    });
}

// ================= PEDIDOS =================
function renderPedidos() {

    const div = document.getElementById("listaPedidos");
    div.innerHTML = "";

    sistema.pedidos.forEach((p, i) => {

        const el = document.createElement("div");

        el.innerHTML = `
            <p><b>#${p.numero}</b> - ${p.cliente.nome}</p>
            <p>Status: ${p.status}</p>
            <button onclick="alterarStatus(${i})">Mudar Status</button>
            <button onclick="excluirPedido(${i})">Excluir</button>
            <hr>
        `;

        div.appendChild(el);
    });
}

// ================= AÇÕES =================
function aprovarPedido(index) {

    const o = sistema.orcamentos[index];

    sistema.pedidos.push({
        ...o,
        status: "Em produção",
        dataAprovacao: new Date().toLocaleDateString()
    });

    sistema.orcamentos.splice(index, 1);

    salvar();
    atualizarTudo();
}

function alterarStatus(index) {

    const status = prompt("Novo status:");

    sistema.pedidos[index].status = status;

    salvar();
    atualizarTudo();
}

function excluirOrcamento(index) {
    sistema.orcamentos.splice(index, 1);
    salvar();
    atualizarTudo();
}

function excluirPedido(index) {
    sistema.pedidos.splice(index, 1);
    salvar();
    atualizarTudo();
}

// ================= INIT =================
function atualizarTudo() {
    atualizarDashboard();
    renderClientes();
    renderOrcamentos();
    renderPedidos();
}

atualizarTudo();
