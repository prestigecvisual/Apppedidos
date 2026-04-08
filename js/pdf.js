// ==========================================
// GERAR PDF PROFISSIONAL
// ==========================================
function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 10;

    // EMPRESA
    doc.setFontSize(12);
    doc.text("Prestige Comunicação Visual", 10, y);
    y += 6;
    doc.setFontSize(9);
    doc.text("Rua Brasil, 304 - São Bernardo do Campo - SP", 10, y);
    y += 10;

    // CLIENTE
    const c = obterDadosCliente();

    doc.text(`Cliente: ${c.nome}`, 10, y); y+=5;
    doc.text(`Telefone: ${c.telefone}`, 10, y); y+=5;
    doc.text(`Email: ${c.email}`, 10, y); y+=5;
    doc.text(`Endereço: ${c.endereco}, ${c.numero}`, 10, y); y+=10;

    // TABELA
    doc.text("Produto | Qtd | Área | Unit | Total", 10, y);
    y+=5;

    sistema.carrinho.forEach(i=>{
        doc.text(
            `${i.nome} | ${i.qtd} | ${i.area?.toFixed(2)||"-"} | ${i.valorUnit} | ${i.total.toFixed(2)}`,
            10, y
        );
        y+=5;
    });

    y+=5;
    doc.text(`TOTAL: R$ ${document.getElementById("totalGeral").innerText}`, 10, y);

    // FRASE FINAL
    y+=10;
    doc.text("Deus Seja Sempre Louvado!", 10, y);
    y+=5;
    doc.text("Tudo posso Naquele que me Fortalece!", 10, y);

    // SALVAR
    doc.save(`orcamento_${Date.now()}.pdf`);
}
