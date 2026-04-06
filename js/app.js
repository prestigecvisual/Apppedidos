// ===============================
// 🚀 INICIALIZAÇÃO
// ===============================
window.onload = () => { 
    try {
        carregarDoNavegador();

        // 🔥 Produtos
        popularProdutos();

        const select = document.getElementById("produto");
        if (select && select.options.length > 0) {
            select.selectedIndex = 0;
        }

        toggleMedidas();

        // 📅 Data
        if (typeof atualizarDataRef === "function") {
            atualizarDataRef();
        }

        // 📦 Orçamentos
        if (typeof atualizarListaOrcamentos === "function") {
            atualizarListaOrcamentos();
        }

        // 📋 Pedidos
        if (typeof atualizarListaPedidos === "function") {
            atualizarListaPedidos();
        }

        // 💰 Totais
        if (typeof calcularTotais === "function") {
            calcularTotais();
        }

    } catch (erro) {
        console.error("Erro ao iniciar sistema:", erro);
    }
};

// ===============================
// 💰 FORMATAÇÃO DE MOEDA
// ===============================
function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// ===============================
// 📅 DATA ATUAL
// ===============================
function dataHoje() {
    return new Date().toLocaleDateString("pt-BR");
}

// ===============================
// 🔢 GERAR Nº PEDIDO
// ===============================
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
    const nome = document.getElementById("novoProdNome").value.trim();
    const preco = parseFloat(document.getElementById("novoProdPreco").value);
    const tipo = document.getElementById("novoProdTipo").value;

    // Validação
    if (!nome || isNaN(preco)) {
        alert("Preencha nome e preço corretamente!");
        return;
    }

    // Evitar duplicado
    const existe = sistema.produtos.some(p => p.nome.toLowerCase() === nome.toLowerCase());
    if (existe) {
        alert("Esse produto já existe!");
        return;
    }

    // Adiciona produto
    sistema.produtos.push({ nome, preco, tipo });

    // Salva e atualiza lista
    salvarNoNavegador();
    popularProdutos();

    // Limpa campos
    document.getElementById("novoProdNome").value = "";
    document.getElementById("novoProdPreco").value = "";

    // Feedback
    alert("✅ Produto cadastrado com sucesso!");

    // Esconde o card (se estiver usando toggle)
    if (typeof toggleNovoProduto === "function") {
        toggleNovoProduto();
    }
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
    const select = document.getElementById("produto");
    const div = document.getElementById("medidasInput");

    if (!select || !div) return;

    const produto = sistema.produtos[select.value];

    if (!produto) return;

    if (produto.tipo === "m2") {
        div.style.display = "flex";
    } else {
        div.style.display = "none";
    }
}

function toggleNovoProduto() {
    const card = document.getElementById("cardNovoProduto");

    if (card.style.display === "none") {
        card.style.display = "block";
    } else {
        card.style.display = "none";
    }
}

function calcularProduto() {
    const index = document.getElementById("produto").value;
    const produto = sistema.produtos[index];

    const qtd = parseFloat(document.getElementById("quantidade").value) || 1;

    let total = 0;
    let descricao = "";

    if (produto.tipo === "m2") {
        const largura = parseFloat(document.getElementById("largura").value) || 0;
        const altura = parseFloat(document.getElementById("altura").value) || 0;

        const area = (largura * altura) / 10000;
        total = area * produto.preco * qtd;

        descricao = `${largura}x${altura} cm (${area.toFixed(2)} m²)`;
    } else {
        total = produto.preco * qtd;
        descricao = `${qtd} peça(s)`;
    }

    document.getElementById("previewCalculo").textContent =
        `Valor Unitário: R$ ${produto.preco.toFixed(2)} | Total: R$ ${total.toFixed(2)}`;

    window.tempItem = {
        nome: produto.nome,
        qtd,
        total,
        medida: descricao
    };
}

function buscarCEP() {
    const cep = document.getElementById("clienteCEP").value.replace(/\D/g, '');

    if (cep.length !== 8) {
        alert("CEP inválido");
        return;
    }

    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(res => res.json())
        .then(dados => {
            if (dados.erro) {
                alert("CEP não encontrado");
                return;
            }

            document.getElementById("clienteEndereco").value = dados.logradouro;
            document.getElementById("clienteBairro").value = dados.bairro;
            document.getElementById("clienteCidade").value = dados.localidade;
            document.getElementById("clienteEstado").value = dados.uf;

        })
        .catch(() => alert("Erro ao buscar CEP"));
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
    document.getElementById("numeroOrcamento").innerText = gerarNumeroPedido();
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

    if (!sistema.orcamentos.length) {
        div.innerHTML = "<p>Nenhum orçamento ainda.</p>";
        return;
    }

    sistema.orcamentos.forEach((o, i) => {
        const total = Number(o.total || 0);

        div.innerHTML += `
        <div class="orcamento-card">
            <p>
                <b>${o.cliente || "Sem nome"}</b><br>
                💰 R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br>
                📌 Status: ${o.status || "Orçamento"}
            </p>

            <div class="acoes">
                <button onclick="gerarPDFOrcamento(${i})">📄 PDF</button>

                ${o.status !== "Aprovado" 
                    ? `<button onclick="aprovarOrcamento(${i})">✅ Aprovar</button>` 
                    : `<span style="color:green;">✔️ Aprovado</span>`
                }
            </div>
        </div>
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

    const nome = document.getElementById("clienteNome").value;
    const numero = document.getElementById("clienteWhatsApp").value.replace(/\D/g, '');

    msg += `👤 Cliente: ${nome}\n\n`;

    sistema.carrinho.forEach(i => {
        msg += `• ${i.nome} (${i.medida}) x${i.qtd} = R$ ${i.total.toFixed(2)}\n`;
    });

    msg += `\n💰 Total: R$ ${document.getElementById("totalGeral").textContent}`;

    if (!numero) {
        alert("Informe o WhatsApp do cliente");
        return;
    }

    const url = `https://wa.me/55${numero}?text=${encodeURIComponent(msg)}`;

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
