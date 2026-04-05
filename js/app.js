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

    let t = 0, m = "Unid";

    if (p.tipo === "m2") {
        const l = parseFloat(document.getElementById("largura").value);
        const a = parseFloat(document.getElementById("altura").value);

        if (isNaN(l) || isNaN(a)) return alert("Preencha largura e altura!");

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

    sistema.carrinho.forEach(i => {
        l.innerHTML += `
            <p style="font-size: 0.85em; margin: 5px 0;">
                ${i.nome} (${i.medida}) x${i.qtd} 
                - <b>R$ ${i.total.toFixed(2)}</b>
            </p>`;
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

// ================= DASHBOARD =================

function calcularFaturamento() {
    let total = 0;

    sistema.pedidos.forEach(p => {
        total += parseFloat(p.total);
    });

    return total.toFixed(2);
}

// ================= LISTA =================

function atualizarListaOrcamentos() {
    const div = document.getElementById("listaOrcamentos");
    if (!div) return;

    div.innerHTML = "<strong>Histórico:</strong><br>";

    if (sistema.orcamentos && sistema.orcamentos.length > 0) {
        sistema.orcamentos.slice(-5).reverse().forEach((o, i) => {
            div.innerHTML += `
                ${o.cliente} - R$ ${o.total} (${o.status || "Aguardando"})
                <button onclick="aprovarOrcamento(${i})">✔</button>
                <br>`;
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

    const numero = "5511922018290";
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;

    window.open(url, "_blank");
}

// ================= PDF =================

document.getElementById("gerarPDF")?.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const ref = atualizarDataRef();
    const pageWidth = doc.internal.pageSize.getWidth();

    const imgLogo = new Image();
    imgLogo.src = 'img/logo.png';
    doc.addImage(imgLogo, 'PNG', (pageWidth / 2) - 25, 10, 50, 25);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PRESTIGE COMUNICAÇÃO VISUAL", pageWidth / 2, 42, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Rua Brasil, 304 - Rudge Ramos - São Bernardo do Campo - SP", pageWidth / 2, 48, { align: "center" });
    doc.text("Contato: (11) 92201-8290", pageWidth / 2, 53, { align: "center" });

    doc.line(10, 56, 200, 56);

    doc.setFontSize(10);
    doc.text(`Ref: ${ref}`, 10, 66);
    doc.text(`Cliente: ${document.getElementById("clienteNome").value}`, 10, 72);

    let y = 90;

    sistema.carrinho.forEach(i => {
        doc.text(`${i.nome} (${i.medida}) x${i.qtd}`, 10, y);
        doc.text(`R$ ${i.total.toFixed(2)}`, 160, y);
        y += 8;
    });

    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: R$ ${document.getElementById("totalGeral").textContent}`, 10, y + 10);

    doc.save(`Prestige_${ref.replace(/\//g,'-')}.pdf`);
});
