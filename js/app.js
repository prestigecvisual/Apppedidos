// ================================
// App Pedidos - Prestige (Final)
// ================================

window.onload = function () {
    carregarDoNavegador(); // Função do db.js para recuperar dados salvos
    popularProdutos();
    atualizarListaOrcamentos();
    atualizarDashboard();
    atualizarDataAutomatica(); 
    calcularTotais(); 
};

// --- DATA AUTOMÁTICA AA/DD/HH+1 ---
function atualizarDataAutomatica() {
    const agora = new Date();
    agora.setHours(agora.getHours() + 1); 

    const aa = agora.getFullYear().toString().slice(-2);
    const dd = String(agora.getDate()).padStart(2, '0');
    const hh = String(agora.getHours()).padStart(2, '0');
    const mm = String(agora.getMinutes()).padStart(2, '0');

    const formatoFinal = `${aa}/${dd}/${hh}:${mm}`;
    const elNumero = document.getElementById("numeroOrcamento");
    if (elNumero) elNumero.textContent = formatoFinal;
    
    return formatoFinal;
}

// --- POPULAR PRODUTOS (Respeitando tipo m2 ou unid) ---
function popularProdutos() {
    const select = document.getElementById("produto");
    if (!select) return;
    select.innerHTML = "";
    sistema.produtos.forEach((prod, index) => {
        const option = document.createElement("option");
        option.value = index;
        const sufixo = prod.tipo === "m2" ? "/m²" : "/unid";
        option.textContent = `${prod.nome} - R$ ${prod.preco.toFixed(2)}${sufixo}`;
        select.appendChild(option);
    });
}

// --- CÁLCULO DINÂMICO ---
function calcular() {
    const produtoIndex = document.getElementById("produto").value;
    const largura = parseFloat(document.getElementById("largura").value);
    const altura = parseFloat(document.getElementById("altura").value);
    const quantidade = parseInt(document.getElementById("quantidade").value);

    if (produtoIndex === "" || isNaN(quantidade)) {
        alert("Preencha ao menos a quantidade!");
        return null;
    }

    const produto = sistema.produtos[produtoIndex];
    let totalItem = 0;
    let infoMedida = "";

    if (produto.tipo === "m2") {
        if (isNaN(largura) || isNaN(altura)) {
            alert("Para este produto, largura e altura são obrigatórios!");
            return null;
        }
        const areaM2 = (largura * altura) / 10000;
        totalItem = produto.preco * areaM2 * quantidade;
        infoMedida = `${largura}x${altura}cm (${areaM2.toFixed(2)}m²)`;
    } else {
        totalItem = produto.preco * quantidade;
        infoMedida = "Unidade";
    }

    document.getElementById("resultado").innerHTML = `
        <strong>${produto.nome}</strong><br>
        Detalhe: ${infoMedida}<br>
        <strong>Subtotal: R$ ${totalItem.toFixed(2)}</strong>
    `;

    return { 
        nome: produto.nome, 
        largura: largura || 0, 
        altura: altura || 0, 
        quantidade, 
        total: totalItem 
    };
}

function adicionarItem() {
    const dados = calcular();
    if (!dados) return;
    sistema.carrinho.push(dados);
    salvarNoNavegador(); // Salva no localStorage (db.js)
    atualizarListaItens();
    calcularTotais();
}

function atualizarListaItens() {
    const lista = document.getElementById("listaItens");
    if (!lista) return;
    lista.innerHTML = "";
    sistema.carrinho.forEach((item, index) => {
        lista.innerHTML += `
            <div class="item-carrinho">
                ${item.nome} (${item.quantidade}x) - <strong>R$ ${item.total.toFixed(2)}</strong>
                <button onclick="removerItem(${index})" style="color:red; background:none; border:none; cursor:pointer"> [X]</button>
            </div>`;
    });
}

function removerItem(index) {
    sistema.carrinho.splice(index, 1);
    salvarNoNavegador();
    atualizarListaItens();
    calcularTotais();
}

// --- TOTAIS COM REGRAS DE PAGAMENTO ---
function calcularTotais() {
    let totalProdutos = 0;
    sistema.carrinho.forEach(item => totalProdutos += item.total);

    // Frete por CEP
    const cep = document.getElementById("clienteCEP")?.value.replace(/\D/g, "") || "";
    let frete = 0;
    if (cep.length === 8) {
        frete = cep.startsWith("0") ? 15.00 : 40.00;
    }

    // Pagamento e Taxas
    const pgto = document.getElementById("formaPagamento")?.value || "debito";
    let taxaOuDesc = 0;

    if (pgto === "pix") taxaOuDesc = -(totalProdutos * 0.05); // -5%
    else if (pgto === "credito_3x") taxaOuDesc = totalProdutos * 0.06; // +6%
    else if (pgto === "credito_5x") taxaOuDesc = totalProdutos * 0.07; // +7%

    const totalGeral = totalProdutos + frete + taxaOuDesc;

    document.getElementById("frete").textContent = frete.toFixed(2);
    document.getElementById("desconto").textContent = Math.abs(taxaOuDesc).toFixed(2);
    
    // Muda cor se for desconto (verde) ou taxa (vermelho)
    const elDesc = document.getElementById("desconto");
    if (elDesc) elDesc.style.color = taxaOuDesc < 0 ? "green" : (taxaOuDesc > 0 ? "red" : "black");

    document.getElementById("totalGeral").textContent = totalGeral.toFixed(2);

    return { frete, taxaOuDesc, totalGeral };
}

// Ouvintes
document.getElementById("clienteCEP")?.addEventListener("blur", calcularTotais);

// --- GESTÃO E PDF ---
function salvarOrcamento() {
    const nome = document.getElementById("clienteNome").value;
    if (!nome || sistema.carrinho.length === 0) {
        alert("Preencha o nome do cliente e adicione itens!");
        return;
    }

    const orcamento = {
        numero: sistema.contadorOrcamento++,
        dataID: atualizarDataAutomatica(),
        cliente: nome,
        itens: [...sistema.carrinho],
        total: parseFloat(document.getElementById("totalGeral").textContent),
        status: "Pendente"
    };

    sistema.orcamentos.push(orcamento);
    sistema.carrinho = []; 
    salvarNoNavegador(); 
    
    atualizarListaItens();
    atualizarListaOrcamentos();
    atualizarDashboard();
    alert("Orçamento salvo!");
}

function atualizarListaOrcamentos() {
    const div = document.getElementById("listaOrcamentos");
    if (!div) return;
    div.innerHTML = "";
    sistema.orcamentos.slice().reverse().forEach(orc => {
        div.innerHTML += `
            <div class="card-historico" style="border-bottom:1px solid #ccc; padding:10px;">
                <strong>#${orc.numero}</strong> | ${orc.dataID} | ${orc.cliente} | <strong>R$ ${orc.total.toFixed(2)}</strong>
            </div>`;
    });
}

function atualizarDashboard() {
    document.getElementById("totalOrcamentos").textContent = sistema.orcamentos.length;
}

// PDF
document.getElementById("gerarPDF")?.addEventListener("click", () => {
    if (sistema.carrinho.length === 0) return alert("Carrinho vazio!");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const dataRef = atualizarDataAutomatica();

    doc.setFontSize(18);
    doc.text("PRESTIGE COMUNICAÇÃO VISUAL", 10, 20);
    doc.setFontSize(10);
    doc.text(`Orçamento Ref: ${dataRef}`, 10, 30);
    doc.text(`Cliente: ${document.getElementById("clienteNome").value}`, 10, 35);

    let y = 50;
    doc.text("Item", 10, y);
    doc.text("Qtd", 140, y);
    doc.text("Total", 170, y);
    doc.line(10, y+2, 200, y+2);
    
    y += 10;
    sistema.carrinho.forEach(item => {
        doc.text(item.nome, 10, y);
        doc.text(item.quantidade.toString(), 140, y);
        doc.text(`R$ ${item.total.toFixed(2)}`, 170, y);
        y += 8;
    });

    y += 10;
    doc.setFontSize(12);
    doc.text(`TOTAL FINAL: R$ ${document.getElementById("totalGeral").textContent}`, 10, y);
    doc.save(`Prestige_${dataRef.replace(/[:/]/g, '-')}.pdf`);
});
