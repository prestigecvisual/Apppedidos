window.onload = () => { 
    popularProdutos();
    atualizarDataRef();
    atualizarListaOrcamentos();
    atualizarListaPedidos();
    calcularTotais();
};

// 💰 FORMATAÇÃO DE MOEDA
function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

// GERADOR DE NÚMERO DE PEDIDO (MMDDYY + SEQUÊNCIA)
function gerarNumeroPedido() {
    const hoje = new Date();
    const mm = String(hoje.getMonth() + 1).padStart(2, '0');
    const dd = String(hoje.getDate()).padStart(2, '0');
    const yy = String(hoje.getFullYear()).slice(-2);

    const base = `${mm}${dd}${yy}`;

    const pedidosHoje = (sistema.pedidos || []).filter(p => p.numero?.startsWith(base));
    const seq = String(pedidosHoje.length + 1).padStart(3, '0');

    return base + seq;
}

function cadastrarNovoProduto() {
    const nome = document.getElementById("novoProdNome").value;
    const preco = parseFloat(document.getElementById("novoProdPreco").value);
    const tipo = document.getElementById("novoProdTipo").value;

    if (!nome || isNaN(preco)) return alert("Preencha nome e preço!");

    sistema.produtos.push({ nome, preco, tipo });
    salvarNoNavegador();
    popularProdutos();
    alert("Produto cadastrado!");
}

function popularProdutos() {
    const s = document.getElementById("produto");
    if(!s) return;

    s.innerHTML = "";

    sistema.produtos.forEach((p, i) => {
        s.innerHTML += `<option value="${i}">${p.nome} - R$ ${p.preco.toFixed(2)} (${p.tipo})</option>`;
    });
}

function toggleMedidas() {
    const p = sistema.produtos[document.getElementById("produto").value];
    document.getElementById("medidasInput").style.display = (p.tipo === "unid") ? "none" : "flex";
}

function adicionarItem() {
    const idx = document.getElementById("produto").value;
    const p = sistema.produtos[idx];
    const q = parseInt(document.getElementById("quantidade").value);

    let t = 0, m = "Unid";

    if(p.tipo === "m2") {
        const l = parseFloat(document.getElementById("largura").value);
        const a = parseFloat(document.getElementById("altura").value);
        t = (l * a / 10000) * p.preco * q;
        m = `${l}x${a}cm`;
    } else {
        t = p.preco * q;
    }

    sistema.carrinho.push({ nome: p.nome, medida: m, qtd: q, total: t });

    atualizarCarrinho();
    calcularTotais();
}

function atualizarCarrinho() {
    const l = document.getElementById("listaItens");
    if (!l) return;

    l.innerHTML = "";

    sistema.carrinho.forEach((i, index) => {
        l.innerHTML += `
            <p style="font-size:0.85em;">
                ${i.nome} (${i.medida}) x${i.qtd} - <b>R$ ${i.total.toFixed(2)}</b>
                <button onclick="removerItem(${index})" style="margin-left:10px;">❌</button>
            </p>
        `;
    });
}

function removerItem(index) {
    sistema.carrinho.splice(index, 1);
    atualizarCarrinho();
    calcularTotais();
}

function calcularTotais() {
    let sub = 0;

    sistema.carrinho.forEach(i => sub += i.total);

    const cepInput = document.getElementById("clienteCEP");
    const cep = cepInput ? cepInput.value.replace(/\D/g, "") : "";

    let f = (cep.length === 8) ? (cep.startsWith("0") ? 15 : 40) : 0;

    const pgSelect = document.getElementById("formaPagamento");
    const pg = pgSelect ? pgSelect.value : "pix";

    let tx =
        (pg === "pix") ? -(sub * 0.05) :
        (pg === "credito_3x") ? sub * 0.06 :
        (pg === "credito_5x") ? sub * 0.07 : 0;

    document.getElementById("frete").textContent = f.toFixed(2);
    document.getElementById("desconto").textContent = Math.abs(tx).toFixed(2);
    document.getElementById("totalGeral").textContent = (sub + f + tx).toFixed(2);
}

function atualizarDataRef() {
    const d = new Date();
    const ref = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
    document.getElementById("numeroOrcamento").textContent = ref;
    return ref;
}

function salvarOrcamento() {
    if(sistema.carrinho.length === 0) return alert("Carrinho vazio!");

    sistema.orcamentos.push({
        cliente: document.getElementById("clienteNome").value,
        total: document.getElementById("totalGeral").textContent,
        data: atualizarDataRef(),
        status: "Orçamento",
        itens: [...sistema.carrinho] // 🔥 ESSENCIAL
    });

    sistema.carrinho = [];

    salvarNoNavegador();
    atualizarCarrinho();
    atualizarListaOrcamentos();
}

function aprovarOrcamento(index) {
    const orc = sistema.orcamentos[index];

    if (orc.status === "Aprovado") {
        alert("Esse orçamento já foi aprovado!");
        return;
    }

    const numeroPedido = gerarNumeroPedido();

    sistema.pedidos.push({
        ...orc,
        numero: numeroPedido,
        status: "Produção",
        dataAprovacao: new Date().toLocaleDateString(),
        itens: orc.itens // 🔥 garante itens no pedido
    });

    orc.status = "Aprovado";

    salvarNoNavegador();
    atualizarListaOrcamentos();
    atualizarListaPedidos();
}

function atualizarListaOrcamentos() {
    const div = document.getElementById("listaOrcamentos");
    if (!div) return;

    div.innerHTML = "";

    div.innerHTML += `
    <p>
        <b>${o.cliente}</b> - R$ ${o.total}
        <br>Status: ${o.status || "Orçamento"}
        <br><br>

        <button onclick="gerarPDFOrcamento(${i})">📄 PDF</button>

        ${o.status !== "Aprovado" 
            ? `<button onclick="aprovarOrcamento(${i})">✅ Aprovar</button>` 
            : "✔️ Aprovado"
        }
    </p>
`;
    });
}

function atualizarListaPedidos() {

    const colunas = {
        "Produção": document.getElementById("col-producao"),
        "Em andamento": document.getElementById("col-andamento"),
        "Finalizado": document.getElementById("col-finalizado"),
        "Entregue": document.getElementById("col-entregue")
    };

    Object.values(colunas).forEach(col => {
        if (col) col.innerHTML = "";
    });

    if (!sistema.pedidos || sistema.pedidos.length === 0) return;

    sistema.pedidos.forEach((p, index) => {

        const card = document.createElement("div");
        card.style.background = "#f1f5f9";
        card.style.padding = "10px";
        card.style.marginBottom = "10px";
        card.style.borderRadius = "6px";

        card.innerHTML = `
            <b>#${p.numero}</b><br>
            ${p.cliente}<br>
            R$ ${p.total}<br>
            <small>${p.status}</small><br>
            <small>📅 ${p.dataAprovacao}</small><br><br>

            <button onclick="gerarPDFPedido(${index})">🧾 PDF</button><br><br>

            ${p.status !== "Produção" ? `<button onclick="mudarStatus(${index}, 'Produção')">⬅</button>` : ""}
            ${p.status !== "Entregue" ? `<button onclick="mudarStatus(${index}, proximoStatus('${p.status}'))">➡</button>` : ""}
    `;
        
        if (colunas[p.status]) {
            colunas[p.status].appendChild(card);
        }
    });
}

function proximoStatus(atual) {
    switch(atual) {
        case "Produção": return "Em andamento";
        case "Em andamento": return "Finalizado";
        case "Finalizado": return "Entregue";
        default: return "Produção";
    }
}

function mudarStatus(index, novoStatus) {
    sistema.pedidos[index].status = novoStatus;

    salvarNoNavegador();
    atualizarListaPedidos();
}

function enviarWhatsApp() {
    let msg = "🧾 *Orçamento Prestige Comunicação Visual*\n\n";

    msg += `👤 Cliente: ${document.getElementById("clienteNome").value}\n\n`;

    sistema.carrinho.forEach(i => {
        msg += `• ${i.nome} (${i.medida}) x${i.qtd} = R$ ${i.total.toFixed(2)}\n`;
    });

    msg += `\n💰 Total: R$ ${document.getElementById("totalGeral").textContent}`;

    const numero = "5511922018290";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;

    window.open(url, "_blank");
}

function gerarPDFOrcamento(index) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const o = sistema.orcamentos[index];

    let y = 20;

    doc.setFontSize(14);
    doc.text("ORÇAMENTO", 150, y);

    doc.setFontSize(10);
    doc.text("Prestige Comunicação Visual", 10, 10);

    doc.text(`Cliente: ${o.cliente}`, 10, 30);
    doc.text(`Data: ${o.data}`, 10, 35);

    y = 50;

    let total = 0;

    o.itens.forEach(item => {
        total += item.total;

        doc.text(item.nome, 10, y);
        doc.text(`Qtd: ${item.qtd}`, 90, y);
        doc.text(`R$ ${item.total.toFixed(2)}`, 150, y);

        y += 7;
    });

    doc.setFontSize(12);
    doc.text(`TOTAL: R$ ${total.toFixed(2)}`, 140, y + 10);

    doc.text("Validade: 7 dias", 10, y + 20);

    doc.save(`orcamento_${o.cliente}.pdf`);
}

function gerarPDFPedido(index) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const p = sistema.pedidos[index];

    let y = 20;

    // 🔥 BORDA ESTILO NOTA
    doc.rect(5, 5, 200, 287);

    doc.setFontSize(14);
    doc.text("PEDIDO", 150, y);

    doc.setFontSize(10);
    doc.text("Prestige Comunicação Visual", 10, 10);

    doc.text(`Pedido Nº: ${p.numero}`, 10, 25);
    doc.text(`Cliente: ${p.cliente}`, 10, 30);
    doc.text(`Data: ${p.dataAprovacao}`, 10, 35);

    y = 50;

    let total = 0;

    p.itens.forEach(item => {
        total += item.total;

        doc.text(item.nome, 10, y);
        doc.text(`Qtd: ${item.qtd}`, 90, y);
        doc.text(`R$ ${item.total.toFixed(2)}`, 150, y);

        y += 7;
    });

    doc.setFontSize(12);
    doc.text(`TOTAL: R$ ${total.toFixed(2)}`, 140, y + 10);

    doc.text(`Status: ${p.status}`, 10, y + 20);

    doc.save(`pedido_${p.numero}.pdf`);
}
