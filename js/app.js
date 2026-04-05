window.onload = () => {
    popularProdutos();
    atualizarDataRef();
    atualizarListaOrcamentos();
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

function toggleMedidas() {
    const p = sistema.produtos[document.getElementById("produto").value];
    document.getElementById("medidasInput").style.display = (p.tipo === "unid") ? "none" : "flex";
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

        if (isNaN(largura) || isNaN(altura)) return alert("Preencha largura e altura!");

        t = (largura * altura / 10000) * p.preco * q;
        m = `${largura}x${altura}cm`;
    } else {
        t = p.preco * q;
    }

    sistema.carrinho.push({
        nome: p.nome,
        medida: m,
        qtd: q,
        total: t,
        largura,
        altura
    });

    atualizarCarrinho();
    calcularTotais();
}

// ================= FUNÇÕES CARRINHO =================

function removerItem(index) {
    if (confirm("Remover este item?")) {
        sistema.carrinho.splice(index, 1);
        atualizarCarrinho();
        calcularTotais();
    }
}

function alterarQuantidade(index, novaQtd) {
    novaQtd = parseInt(novaQtd);
    if (isNaN(novaQtd) || novaQtd <= 0) return;

    const item = sistema.carrinho[index];
    item.qtd = novaQtd;

    recalcularItem(item);
    atualizarCarrinho();
    calcularTotais();
}

function alterarMedidas(index, largura, altura) {
    largura = parseFloat(largura);
    altura = parseFloat(altura);

    if (isNaN(largura) || isNaN(altura)) return;

    const item = sistema.carrinho[index];

    item.medida = `${largura}x${altura}cm`;
    item.largura = largura;
    item.altura = altura;

    recalcularItem(item);
    atualizarCarrinho();
    calcularTotais();
}

function recalcularItem(item) {
    const produto = sistema.produtos.find(p => p.nome === item.nome);
    if (!produto) return;

    if (produto.tipo === "m2" && item.largura && item.altura) {
        item.total = (item.largura * item.altura / 10000) * produto.preco * item.qtd;
    } else {
        item.total = produto.preco * item.qtd;
    }
}

function limparCarrinho() {
    if (confirm("Deseja limpar todo o carrinho?")) {
        sistema.carrinho = [];
        atualizarCarrinho();
        calcularTotais();
    }
}

function atualizarCarrinho() {
    const l = document.getElementById("listaItens");
    l.innerHTML = "";

    sistema.carrinho.forEach((i, index) => {
        const isM2 = i.medida.includes("x");

        l.innerHTML += `
        <div style="border:1px solid #e2e8f0; padding:10px; border-radius:8px; margin-bottom:8px;">
            
            <div style="font-size:0.9em; margin-bottom:5px;">
                <b>${i.nome}</b>
            </div>

            ${isM2 ? `
                <div style="display:flex; gap:5px; margin-bottom:5px;">
                    <input type="number" value="${i.largura || ''}" 
                        onchange="alterarMedidas(${index}, this.value, ${i.altura || 0})">
                    
                    <input type="number" value="${i.altura || ''}" 
                        onchange="alterarMedidas(${index}, ${i.largura || 0}, this.value)">
                </div>
            ` : ""}

            <div style="display:flex; justify-content:space-between; align-items:center;">
                
                <input type="number" value="${i.qtd}" min="1"
                    onchange="alterarQuantidade(${index}, this.value)">

                <span>R$ ${i.total.toFixed(2)}</span>

                <button onclick="removerItem(${index})"
                    style="background:#ef4444;color:white;padding:5px 8px;border-radius:6px;">
                    ❌
                </button>
            </div>
        </div>`;
    });
}

// ================= CÁLCULOS =================

function calcularTotais() {
    let sub = 0;
    sistema.carrinho.forEach(i => sub += i.total);

    const cep = document.getElementById("clienteCEP").value.replace(/\D/g, "");

    let f = 0;
    if (cep.length === 8) {
        const inicio = parseInt(cep.substring(0, 2));
        if (inicio <= 9) f = 15;
        else if (inicio <= 19) f = 25;
        else f = 40;
    }

    const pg = document.getElementById("formaPagamento").value;

    let tx = 0;
    if (pg === "pix") tx = -(sub * 0.03);
    else if (pg === "credito_3x") tx = sub * 0.06;
    else if (pg === "credito_5x") tx = sub * 0.07;

    document.getElementById("frete").textContent = f.toFixed(2);
    document.getElementById("desconto").textContent = Math.abs(tx).toFixed(2);
    document.getElementById("totalGeral").textContent = (sub + f + tx).toFixed(2);
}

// ================= ORÇAMENTO =================

function atualizarDataRef() {
    const d = new Date();
    d.setHours(d.getHours() + 1);

    const ref = `${d.getFullYear().toString().slice(-2)}/${d.getDate()}/${d.getHours()}h${d.getMinutes()}`;
    document.getElementById("numeroOrcamento").textContent = ref;
    return ref;
}

function salvarOrcamento() {
    if (sistema.carrinho.length === 0) return alert("Carrinho vazio!");

    sistema.orcamentos.push({
        cliente: document.getElementById("clienteNome").value || "Cliente",
        total: document.getElementById("totalGeral").textContent,
        data: atualizarDataRef(),
        status: "Aguardando"
    });

    sistema.carrinho = [];

    salvarNoNavegador();
    atualizarCarrinho();
    atualizarListaOrcamentos();
}

// ================= APROVAÇÃO =================

function aprovarOrcamento(index) {
    const orc = sistema.orcamentos[index];
    if (!orc) return;

    orc.status = "Aprovado";

    sistema.pedidos.push({
        ...orc,
        dataAprovacao: new Date().toLocaleDateString()
    });

    salvarNoNavegador();
    atualizarListaOrcamentos();
}

// ================= LISTA =================

function atualizarListaOrcamentos() {
    const div = document.getElementById("listaOrcamentos");
    if (!div) return;

    div.innerHTML = "<strong>Histórico:</strong><br>";

    if (sistema.orcamentos.length > 0) {
        sistema.orcamentos.slice(-5).reverse().forEach((o, i) => {
            div.innerHTML += `
                ${o.cliente} - R$ ${o.total} (${o.status})
                <button onclick="aprovarOrcamento(${i})">✔</button><br>`;
        });
    } else {
        div.innerHTML += "Nenhum orçamento salvo.";
    }
}

// ================= WHATSAPP =================

function enviarWhatsApp() {
    let msg = "🧾 *Orçamento Prestige Comunicação Visual*\n\n";

    msg += `👤 Cliente: ${document.getElementById("clienteNome").value}\n\n`;

    sistema.carrinho.forEach(i => {
        msg += `• ${i.nome} (${i.medida}) x${i.qtd} = R$ ${i.total.toFixed(2)}\n`;
    });

    msg += `\n💰 Total: R$ ${document.getElementById("totalGeral").textContent}`;

    const url = `https://wa.me/5511922018290?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
}
