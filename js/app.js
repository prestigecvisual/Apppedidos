window.onload = () => {
    popularProdutos();
    atualizarListaOrcamentos();
    atualizarListaPedidos();
    calcularTotais();
};

// ================= PRODUTOS =================

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
    if (!s) return;

    s.innerHTML = "";
    sistema.produtos.forEach((p, i) => {
        s.innerHTML += `<option value="${i}">${p.nome} - R$ ${p.preco.toFixed(2)} (${p.tipo})</option>`;
    });
}

// ================= GERADORES =================

function gerarNumeroOrcamento() {
    const d = new Date();
    return `ORC-${d.getFullYear()}${d.getMonth()+1}${d.getDate()}-${d.getHours()}${d.getMinutes()}`;
}

function gerarNumeroPedido() {
    const d = new Date();

    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);

    const base = `${mm}${dd}${yy}`;

    const pedidosHoje = sistema.pedidos.filter(p => p.numero?.startsWith(base));
    const sequencia = String(pedidosHoje.length + 1).padStart(3, '0');

    return base + sequencia;
}

// ================= CARRINHO =================

function adicionarItem() {
    const idx = document.getElementById("produto").value;
    const p = sistema.produtos[idx];
    const q = parseInt(document.getElementById("quantidade").value);

    if (!p || isNaN(q) || q <= 0) return alert("Quantidade inválida!");

    let t = 0, m = "Unid", largura = null, altura = null;

    if (p.tipo === "m2") {
        largura = parseFloat(document.getElementById("largura").value);
        altura = parseFloat(document.getElementById("altura").value);

        if (isNaN(largura) || isNaN(altura)) return alert("Preencha medidas!");

        t = (largura * altura / 10000) * p.preco * q;
        m = `${largura}x${altura}cm`;
    } else {
        t = p.preco * q;
    }

    sistema.carrinho.push({ nome: p.nome, medida: m, qtd: q, total: t, largura, altura });

    atualizarCarrinho();
    calcularTotais();
}

// ================= CARRINHO FUNÇÕES =================

function removerItem(index) {
    if (confirm("Remover item?")) {
        sistema.carrinho.splice(index, 1);
        atualizarCarrinho();
        calcularTotais();
    }
}

function limparCarrinho() {
    if (confirm("Limpar carrinho?")) {
        sistema.carrinho = [];
        atualizarCarrinho();
        calcularTotais();
    }
}

function atualizarCarrinho() {
    const l = document.getElementById("listaItens");
    if (!l) return;

    l.innerHTML = "";

    sistema.carrinho.forEach((i, index) => {
        l.innerHTML += `
        <div style="border:1px solid #ddd;padding:10px;margin:5px 0;">
            ${i.nome} (${i.medida}) x${i.qtd} - R$ ${i.total.toFixed(2)}
            <button onclick="removerItem(${index})">❌</button>
        </div>`;
    });
}

// ================= CÁLCULOS =================

function calcularTotais() {
    let sub = 0;
    sistema.carrinho.forEach(i => sub += i.total);

    const pg = document.getElementById("formaPagamento")?.value;

    let tx = 0;
    if (pg === "pix") tx = -(sub * 0.03);
    else if (pg === "credito_3x") tx = sub * 0.06;
    else if (pg === "credito_5x") tx = sub * 0.07;

    document.getElementById("totalGeral").textContent = (sub + tx).toFixed(2);
}

// ================= ORÇAMENTO =================

function salvarOrcamento() {
    if (sistema.carrinho.length === 0) return alert("Carrinho vazio!");

    const numero = gerarNumeroOrcamento();

    sistema.orcamentos.push({
        numero,
        cliente: document.getElementById("clienteNome").value || "Cliente",
        itens: [...sistema.carrinho],
        total: document.getElementById("totalGeral").textContent,
        status: "Orçamento"
    });

    sistema.carrinho = [];

    salvarNoNavegador();
    atualizarCarrinho();
    atualizarListaOrcamentos();
}

// ================= CONVERTER =================

function aprovarOrcamento(index) {
    const orc = sistema.orcamentos[index];
    if (!orc) return;

    const numeroPedido = gerarNumeroPedido();

    sistema.pedidos.push({
        ...orc,
        numero: numeroPedido,
        status: "Produção",
        data: new Date().toLocaleDateString()
    });

    sistema.orcamentos.splice(index, 1);

    salvarNoNavegador();
    atualizarListaOrcamentos();
    atualizarListaPedidos();
}

// ================= PRODUÇÃO =================

function atualizarStatusPedido(index, novoStatus) {
    sistema.pedidos[index].status = novoStatus;
    salvarNoNavegador();
    atualizarListaPedidos();
}

// ================= LISTAS =================

function atualizarListaOrcamentos() {
    const div = document.getElementById("listaOrcamentos");
    if (!div) return;

    div.innerHTML = "<strong>Orçamentos:</strong><br>";

    sistema.orcamentos.forEach((o, i) => {
        div.innerHTML += `
        #${o.numero} - ${o.cliente} - R$ ${o.total}
        <button onclick="aprovarOrcamento(${i})">✔ Converter</button><br>`;
    });
}

function atualizarListaPedidos() {
    const div = document.getElementById("listaPedidos");
    if (!div) return;

    div.innerHTML = "<strong>Pedidos:</strong><br>";

    sistema.pedidos.forEach((p, i) => {
        div.innerHTML += `
        #${p.numero} - ${p.cliente} - R$ ${p.total}
        <select onchange="atualizarStatusPedido(${i}, this.value)">
            <option ${p.status==="Produção"?"selected":""}>Produção</option>
            <option ${p.status==="Pronto"?"selected":""}>Pronto</option>
            <option ${p.status==="Entregue"?"selected":""}>Entregue</option>
        </select><br>`;
    });
}
