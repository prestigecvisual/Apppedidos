// Inicialização do App
window.onload = () => {
    popularProdutos();
    atualizarDataRef();
    atualizarListaOrcamentos();
    calcularTotais();
};

// 1. GESTÃO DE PRODUTOS (ADICIONAR NOVOS)
function cadastrarNovoProduto() {
    const nome = document.getElementById("novoProdNome").value;
    const preco = parseFloat(document.getElementById("novoProdPreco").value);
    const tipo = document.getElementById("novoProdTipo").value;

    if (!nome || isNaN(preco)) return alert("Preencha nome e preço!");

    sistema.produtos.push({ nome, preco, tipo });
    salvarNoNavegador();
    popularProdutos();
    
    document.getElementById("novoProdNome").value = "";
    document.getElementById("novoProdPreco").value = "";
    alert(`Produto "${nome}" adicionado com sucesso!`);
}

function popularProdutos() {
    const select = document.getElementById("produto");
    if (!select) return;
    select.innerHTML = "";
    sistema.produtos.forEach((p, i) => {
        const opt = document.createElement("option");
        opt.value = i;
        const sfx = p.tipo === "m2" ? "/m²" : "/unid";
        opt.textContent = `${p.nome} - R$ ${p.preco.toFixed(2)}${sfx}`;
        select.appendChild(opt);
    });
}

function toggleMedidas() {
    const p = sistema.produtos[document.getElementById("produto").value];
    document.getElementById("medidasInput").style.display = (p.tipo === "unid") ? "none" : "flex";
}

// 2. CÁLCULOS E CARRINHO
function adicionarItem() {
    const idx = document.getElementById("produto").value;
    const p = sistema.produtos[idx];
    const q = parseInt(document.getElementById("quantidade").value);
    let totalItem = 0, medInfo = "Unid";

    if (p.tipo === "m2") {
        const l = parseFloat(document.getElementById("largura").value);
        const a = parseFloat(document.getElementById("altura").value);
        totalItem = (l * a / 10000) * p.preco * q;
        medInfo = `${l}x${a}cm`;
    } else {
        totalItem = p.preco * q;
    }

    sistema.carrinho.push({ nome: p.nome, medida: medInfo, qtd: q, total: totalItem });
    atualizarListaItens();
    calcularTotais();
}

function atualizarListaItens() {
    const lista = document.getElementById("listaItens");
    lista.innerHTML = "";
    sistema.carrinho.forEach((item, i) => {
        lista.innerHTML += `
            <div class="item-cart">
                <span>${item.nome} (${item.medida}) x${item.qtd}</span>
                <strong>R$ ${item.total.toFixed(2)}</strong>
            </div>`;
    });
}

function calcularTotais() {
    let sub = 0;
    sistema.carrinho.forEach(i => sub += i.total);

    const cep = document.getElementById("clienteCEP").value.replace(/\D/g, "");
    let frete = (cep.length === 8) ? (cep.startsWith("0") ? 15 : 40) : 0;

    const pgto = document.getElementById("formaPagamento").value;
    let taxa = 0;
    if (pgto === "pix") taxa = -(sub * 0.05);
    else if (pgto === "credito_3x") taxa = sub * 0.06;
    else if (pgto === "credito_5x") taxa = sub * 0.07;

    document.getElementById("frete").textContent = frete.toFixed(2);
    document.getElementById("desconto").textContent = Math.abs(taxa).toFixed(2);
    document.getElementById("totalGeral").textContent = (sub + frete + taxa).toFixed(2);
}

// 3. FINALIZAÇÃO E PDF
function salvarOrcamento() {
    const nome = document.getElementById("clienteNome").value;
    if (!nome || sistema.carrinho.length === 0) return alert("Preencha o cliente e adicione itens!");

    const orc = {
        numero: sistema.contadorOrcamento++,
        data: atualizarDataRef(),
        cliente: nome,
        documento: document.getElementById("clienteDoc").value,
        total: document.getElementById("totalGeral").textContent
    };

    sistema.orcamentos.push(orc);
    sistema.carrinho = []; // Limpa carrinho após salvar
    salvarNoNavegador();
    atualizarListaItens();
    atualizarListaOrcamentos();
    alert("Orçamento salvo com sucesso!");
}

function atualizarListaOrcamentos() {
    const div = document.getElementById("listaOrcamentos");
    div.innerHTML = "";
    sistema.orcamentos.slice().reverse().forEach(o => {
        div.innerHTML += `<p>#${o.numero} | ${o.cliente} | R$ ${o.total}</p>`;
    });
}

function atualizarDataRef() {
    const agora = new Date();
    agora.setHours(agora.getHours() + 1);
    const ref = `${agora.getFullYear().toString().slice(-2)}/${agora.getDate()}/${agora.getHours()}h`;
    document.getElementById("numeroOrcamento").textContent = ref;
    return ref;
}

// Geração de PDF com CPF/CNPJ
document.getElementById("gerarPDF")?.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const ref = atualizarDataRef();

    doc.setFontSize(16);
    doc.text("PRESTIGE COMUNICAÇÃO VISUAL", 10, 20);
    doc.setFontSize(10);
    doc.text(`Orçamento Ref: ${ref}`, 10, 30);
    doc.text(`Cliente: ${document.getElementById("clienteNome").value}`, 10, 35);
    doc.text(`CPF/CNPJ: ${document.getElementById("clienteDoc").value}`, 10, 40);
    
    let y = 55;
    sistema.carrinho.forEach(i => {
        doc.text(`${i.nome} (${i.medida}) x${i.qtd} - R$ ${i.total.toFixed(2)}`, 10, y);
        y += 8;
    });

    doc.setFontSize(12);
    doc.text(`TOTAL FINAL: R$ ${document.getElementById("totalGeral").textContent}`, 10, y + 15);
    doc.save(`Prestige_${ref.replace(/\//g,'-')}.pdf`);
});
