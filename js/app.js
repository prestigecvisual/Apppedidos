window.onload = () => {
    popularProdutos();
    atualizarDataRef();
    atualizarListaOrcamentos();
    calcularTotais();
};

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
    } else { t = p.preco * q; }

    sistema.carrinho.push({ nome: p.nome, medida: m, qtd: q, total: t });
    atualizarCarrinho();
    calcularTotais();
}

function atualizarCarrinho() {
    const l = document.getElementById("listaItens");
    l.innerHTML = "";
    sistema.carrinho.forEach(i => {
        l.innerHTML += `<p style="font-size: 0.85em; margin: 5px 0;">${i.nome} (${i.medida}) x${i.qtd} - <b>R$ ${i.total.toFixed(2)}</b></p>`;
    });
}

function calcularTotais() {
    let sub = 0;
    sistema.carrinho.forEach(i => sub += i.total);
    const cep = document.getElementById("clienteCEP").value.replace(/\D/g, "");
    let f = (cep.length === 8) ? (cep.startsWith("0") ? 15 : 40) : 0;
    const pg = document.getElementById("formaPagamento").value;
    let tx = (pg === "pix") ? -(sub * 0.05) : (pg === "credito_3x" ? sub * 0.06 : (pg === "credito_5x" ? sub * 0.07 : 0));
    document.getElementById("frete").textContent = f.toFixed(2);
    document.getElementById("desconto").textContent = Math.abs(tx).toFixed(2);
    document.getElementById("totalGeral").textContent = (sub + f + tx).toFixed(2);
}

function atualizarDataRef() {
    const d = new Date(); d.setHours(d.getHours() + 1);
    const ref = `${d.getFullYear().toString().slice(-2)}/${d.getDate()}/${d.getHours()}h${d.getMinutes()}`;
    document.getElementById("numeroOrcamento").textContent = ref;
    return ref;
}

function salvarOrcamento() {
    if(sistema.carrinho.length === 0) return alert("Carrinho vazio!");
    sistema.orcamentos.push({ 
        cliente: document.getElementById("clienteNome").value, 
        total: document.getElementById("totalGeral").textContent,
        data: atualizarDataRef()
    });
    sistema.carrinho = [];
    salvarNoNavegador();
    atualizarCarrinho();
    atualizarListaOrcamentos();
}

function atualizarListaOrcamentos() {
    const div = document.getElementById("listaOrcamentos");
    
    // TRAVA DE SEGURANÇA: Se o 'div' for nulo, a função para aqui e evita o erro
    if (!div) {
        console.warn("Aviso: O elemento 'listaOrcamentos' não existe no HTML.");
        return; 
    }

    div.innerHTML = "<strong>Histórico:</strong><br>";
    
    // Verifica se existem orçamentos no array (que vem do db.js)
    if (sistema.orcamentos && sistema.orcamentos.length > 0) {
        // Mostra os últimos 3 orçamentos salvos
        sistema.orcamentos.slice(-3).reverse().forEach(o => {
            div.innerHTML += `${o.cliente || 'Cliente'} - R$ ${o.total}<br>`;
        });
    } else {
        div.innerHTML += "Nenhum orçamento salvo.";
    }
}

// PDF COM LOGO CENTRALIZADA E ENDEREÇO PRESTIGE
document.getElementById("gerarPDF")?.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const ref = atualizarDataRef();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Logo
    const imgLogo = new Image();
    imgLogo.src = 'img/logo.png';
    doc.addImage(imgLogo, 'PNG', (pageWidth / 2) - 25, 10, 50, 25);

    // Endereço Prestige Centralizado
    doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text("PRESTIGE COMUNICAÇÃO VISUAL", pageWidth / 2, 42, { align: "center" });
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text("Rua Brasil, 304 - Rudge Ramos - São Bernardo do Campo - SP", pageWidth / 2, 48, { align: "center" });
    doc.text("Contato: (11) 92201-82909", pageWidth / 2, 53, { align: "center" });
    doc.line(10, 56, 200, 56);

    // Dados Cliente
    doc.setFontSize(10);
    doc.text(`Ref: ${ref}`, 10, 66);
    doc.text(`Cliente: ${document.getElementById("clienteNome").value}`, 10, 72);
    doc.text(`CPF/CNPJ: ${document.getElementById("clienteDoc").value}`, 10, 78);
    doc.text(`Endereço: ${document.getElementById("clienteEndereco").value}`, 10, 84);
    
    let y = 98;
    doc.setFont("helvetica", "bold");
    doc.text("Item", 10, y); doc.text("Qtd", 150, y); doc.text("Total", 180, y);
    doc.line(10, y+2, 200, y+2); y += 10;

    doc.setFont("helvetica", "normal");
    sistema.carrinho.forEach(i => {
        doc.text(`${i.nome} (${i.medida})`, 10, y);
        doc.text(`${i.qtd}`, 150, y);
        doc.text(`R$ ${i.total.toFixed(2)}`, 180, y);
        y += 8;
    });

    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL FINAL: R$ ${document.getElementById("totalGeral").textContent}`, 10, y + 10);
    doc.save(`Prestige_${ref.replace(/\//g,'-')}.pdf`);
});
