// --- SALVAMENTO ---
function salvarOrcamento() {
    const nome = document.getElementById("clienteNome").value;
    const endereco = document.getElementById("clienteEndereco").value; // Captura Endereço
    
    if (!nome || sistema.carrinho.length === 0) return alert("Preencha o cliente e adicione itens!");

    const orc = {
        numero: sistema.contadorOrcamento++,
        data: atualizarDataRef(),
        cliente: nome,
        documento: document.getElementById("clienteDoc").value,
        endereco: endereco, // Salva no histórico
        total: document.getElementById("totalGeral").textContent
    };

    sistema.orcamentos.push(orc);
    sistema.carrinho = [];
    salvarNoNavegador();
    atualizarListaItens();
    atualizarListaOrcamentos();
    alert("Orçamento salvo com sucesso!");
}

// --- GERAÇÃO DE PDF ---
document.getElementById("gerarPDF")?.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const ref = atualizarDataRef();
    
    const nome = document.getElementById("clienteNome").value;
    const docCli = document.getElementById("clienteDoc").value;
    const endereco = document.getElementById("clienteEndereco").value;

    doc.setFontSize(16);
    doc.text("PRESTIGE COMUNICAÇÃO VISUAL", 10, 20);
    
    doc.setFontSize(10);
    doc.text(`Orçamento Ref: ${ref}`, 10, 30);
    doc.text(`Cliente: ${nome}`, 10, 35);
    doc.text(`CPF/CNPJ: ${docCli}`, 10, 40);
    doc.text(`Endereço: ${endereco}`, 10, 45); // Imprime no PDF
    
    let y = 60;
    doc.text("Item", 10, y);
    doc.text("Medida", 80, y);
    doc.text("Qtd", 140, y);
    doc.text("Total", 170, y);
    doc.line(10, y+2, 200, y+2);
    
    y += 10;
    sistema.carrinho.forEach(i => {
        doc.text(`${i.nome}`, 10, y);
        doc.text(`${i.medida}`, 80, y);
        doc.text(`${i.qtd}`, 140, y);
        doc.text(`R$ ${i.total.toFixed(2)}`, 170, y);
        y += 8;
    });

    doc.setFontSize(12);
    doc.text(`VALOR TOTAL: R$ ${document.getElementById("totalGeral").textContent}`, 10, y + 15);
    doc.save(`Prestige_${ref.replace(/\//g,'-')}.pdf`);
});
