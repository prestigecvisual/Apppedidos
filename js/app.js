window.onload = () => {
    popularProdutos();
    atualizarDataRef();
    atualizarListaOrcamentos();
    atualizarListaPedidos(); // NOVO
    calcularTotais();
};

// GERADOR DE NÚMERO DE PEDIDO (MMDDYY + SEQUÊNCIA)
function gerarNumeroPedido() {
    const hoje = new Date();
    const mm = String(hoje.getMonth() + 1).padStart(2, '0');
    const dd = String(hoje.getDate()).padStart(2, '0');
    const yy = String(hoje.getFullYear()).slice(-2);

    const base = `${mm}${dd}${yy}`;

    const pedidosHoje = sistema.pedidos.filter(p => p.numero?.startsWith(base));
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

    const cep = document.getElementById("clienteCEP").value.replace(/\D/g, "");
    let f = (cep.length === 8) ? (cep.startsWith("0") ? 15 : 40) : 0;

    const pg = document.getElementById("formaPagamento").value;

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
        status: "Orçamento"
    });

    sistema.carrinho = [];

    salvarNoNavegador();
    atualizarCarrinho();
    atualizarListaOrcamentos();
}

function aprovarOrcamento(index) {
    const orc = sistema.orcamentos[index];

    const numeroPedido = gerarNumeroPedido();

    sistema.pedidos.push({
        ...orc,
        numero: numeroPedido,
        status: "Produção",
        dataAprovacao: new Date().toLocaleDateString()
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

    sistema.orcamentos.forEach((o, i) => {
        div.innerHTML += `
            <p>
                ${o.cliente} - R$ ${o.total}
                <br>Status: ${o.status || "Orçamento"}
                <br>
                <button onclick="aprovarOrcamento(${i})">Aprovar</button>
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

    // limpar colunas
    Object.values(colunas).forEach(col => col.innerHTML = "");

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
            <small>${p.status}</small><br><br>

            ${p.status !== "Produção" ? `<button onclick="mudarStatus(${index}, 'Produção')">⬅</button>` : ""}
            ${p.status !== "Entregue" ? `<button onclick="mudarStatus(${index}, proximoStatus('${p.status}'))">➡</button>` : ""}
        `;

        colunas[p.status]?.appendChild(card);
    });
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
