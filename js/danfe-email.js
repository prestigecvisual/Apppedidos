// ============================================
// DANFE EMAIL - ENVIO AUTOMÁTICO
// ============================================

const BACKEND_URL = "http://localhost:3000";

// ============================================
// FUNÇÃO: ENVIAR ORÇAMENTO POR E-MAIL
// ============================================
async function enviarOrcamentoEmail() {
    // Obter dados do cliente
    const clienteEmail = document.getElementById("clienteEmail")?.value;
    const clienteNome = document.getElementById("clienteNome")?.value || "Cliente";
    
    if (!clienteEmail) {
        alert("⚠️ Informe o e-mail do cliente");
        return false;
    }
    
    // Obter itens do carrinho
    const itens = sistema.carrinho || [];
    if (itens.length === 0) {
        alert("⚠️ Adicione itens ao carrinho primeiro");
        return false;
    }
    
    // Calcular totais
    const subtotal = itens.reduce((sum, item) => sum + (item.total || 0), 0);
    const frete = calcularFretePorCEP(document.getElementById("clienteCEP")?.value || "");
    const formaPagamento = document.getElementById("formaPagamento")?.value || "pix";
    let totalFinal = subtotal + frete;
    
    if (formaPagamento === "credito_1x") totalFinal *= 1.015;
    else if (formaPagamento === "credito_3x") totalFinal *= 1.06;
    else if (formaPagamento === "credito_5x") totalFinal *= 1.07;
    
    // Preparar dados do orçamento
    const orcamentoNumero = document.getElementById("numeroOrcamento")?.innerText || gerarNumeroDANFE();
    const dataEmissao = formatarData(new Date());
    
    const dadosOrcamento = {
        numero: orcamentoNumero,
        data: dataEmissao,
        clienteNome: clienteNome,
        clienteEmail: clienteEmail,
        clienteEndereco: document.getElementById("clienteEndereco")?.value || "",
        itens: itens,
        subtotal: subtotal,
        frete: frete,
        total: totalFinal,
        formaPagamento: formaPagamento,
        observacoes: document.getElementById("inObs")?.value || "",
        validade: DANFE_CONFIG.danfe.prazoValidade
    };
    
    // Gerar PDF do orçamento
    const pdfBase64 = await gerarPDFBase64(dadosOrcamento);
    
    // Tentar enviar via backend
    try {
        const response = await fetch(`${BACKEND_URL}/api/enviar-orcamento`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                destinatario: clienteEmail,
                dados: dadosOrcamento,
                pdfBase64: pdfBase64
            })
        });
        
        if (response.ok) {
            alert(`✅ Orçamento enviado com sucesso para ${clienteEmail}`);
            salvarLogEnvio({
                tipo: "email",
                destinatario: clienteEmail,
                cliente: clienteNome,
                data: dataEmissao,
                valor: totalFinal,
                orcamentoNumero: orcamentoNumero
            });
            return true;
        } else {
            throw new Error("Erro no backend");
        }
    } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
        // Fallback: abrir cliente de e-mail
        const assunto = `Prestige - Seu Orçamento nº ${orcamentoNumero}`;
        const corpo = gerarCorpoEmailTexto(dadosOrcamento);
        window.open(`mailto:${clienteEmail}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`);
        alert(`📧 Abrindo cliente de e-mail para enviar para ${clienteEmail}`);
        return true;
    }
}

// ============================================
// FUNÇÃO: GERAR CORPO DO E-MAIL (TEXTO)
// ============================================
function gerarCorpoEmailTexto(dados) {
    let corpo = `${DANFE_CONFIG.empresa.nome}\n`;
    corpo += `${"=".repeat(40)}\n\n`;
    corpo += `Olá ${dados.clienteNome},\n\n`;
    corpo += `Segue seu orçamento:\n\n`;
    corpo += `📋 ORÇAMENTO Nº: ${dados.numero}\n`;
    corpo += `📅 Data: ${dados.data}\n`;
    corpo += `💰 Total: ${formatarMoeda(dados.total)}\n\n`;
    corpo += `ITENS:\n`;
    corpo += `${"-".repeat(30)}\n`;
    
    dados.itens.forEach(item => {
        corpo += `${item.nome}\n`;
        if (item.medida && item.medida !== "--") corpo += `   Medida: ${item.medida}\n`;
        corpo += `   Quantidade: ${item.qtd}\n`;
        corpo += `   Valor: ${formatarMoeda(item.total)}\n\n`;
    });
    
    corpo += `${"-".repeat(30)}\n`;
    corpo += `Forma de Pagamento: ${getFormaPagamentoTexto(dados.formaPagamento)}\n`;
    corpo += `Validade: ${dados.validade} dias úteis\n\n`;
    corpo += `Para aprovar este orçamento, entre em contato:\n`;
    corpo += `${DANFE_CONFIG.empresa.telefone} / ${DANFE_CONFIG.empresa.email}\n\n`;
    corpo += `🙏 ${DANFE_CONFIG.empresa.nome}\n`;
    corpo += `"Deus Seja Sempre Louvado! Tudo posso Naquele que me Fortalece!"`;
    
    return corpo;
}

// ============================================
// FUNÇÃO: GERAR PDF EM BASE64
// ============================================
async function gerarPDFBase64(dadosOrcamento) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");
    let y = 10;
    
    // Cabeçalho
    doc.setFontSize(14);
    doc.text(DANFE_CONFIG.empresa.nome, 10, y);
    y += 6;
    doc.setFontSize(9);
    doc.text(`${DANFE_CONFIG.empresa.endereco}, ${DANFE_CONFIG.empresa.bairro}`, 10, y);
    y += 4;
    doc.text(`${DANFE_CONFIG.empresa.cidade} - ${DANFE_CONFIG.empresa.estado} | CEP: ${DANFE_CONFIG.empresa.cep}`, 10, y);
    y += 4;
    doc.text(`📞 ${DANFE_CONFIG.empresa.telefone} | 📧 ${DANFE_CONFIG.empresa.email}`, 10, y);
    y += 10;
    
    // Título
    doc.setFontSize(12);
    doc.text("ORÇAMENTO", 10, y);
    y += 6;
    
    // Dados do cliente
    doc.setFontSize(9);
    doc.text(`Nº: ${dadosOrcamento.numero}`, 10, y);
    doc.text(`Data: ${dadosOrcamento.data}`, 100, y);
    y += 5;
    doc.text(`Cliente: ${dadosOrcamento.clienteNome}`, 10, y);
    y += 5;
    doc.text(`E-mail: ${dadosOrcamento.clienteEmail}`, 10, y);
    y += 10;
    
    // Tabela de itens
    doc.setFontSize(9);
    doc.text("Descrição", 10, y);
    doc.text("Qtd", 100, y);
    doc.text("Valor Unit.", 130, y);
    doc.text("Total", 170, y);
    y += 4;
    doc.line(10, y, 200, y);
    y += 4;
    
    dadosOrcamento.itens.forEach(item => {
        if (y > 260) {
            doc.addPage();
            y = 10;
        }
        doc.text(item.nome.substring(0, 35), 10, y);
        doc.text(String(item.qtd), 100, y);
        doc.text(formatarMoeda(item.valorUnitario), 130, y);
        doc.text(formatarMoeda(item.total), 170, y);
        y += 6;
    });
    
    doc.line(10, y, 200, y);
    y += 5;
    
    // Totais
    doc.setFontSize(10);
    doc.text(`Subtotal: ${formatarMoeda(dadosOrcamento.subtotal)}`, 170, y, { align: "right" });
    y += 5;
    doc.text(`Frete: ${formatarMoeda(dadosOrcamento.frete)}`, 170, y, { align: "right" });
    y += 5;
    doc.setFontSize(11);
    doc.text(`TOTAL: ${formatarMoeda(dadosOrcamento.total)}`, 170, y, { align: "right" });
    y += 15;
    
    // QR Code PIX
    const qrCodeImg = await gerarQRCodePIX(dadosOrcamento.total, "temp-qr");
    if (qrCodeImg) {
        doc.addImage(qrCodeImg, "PNG", 150, y, 40, 40);
    }
    y += 45;
    
    // Frase final
    doc.setFontSize(9);
    doc.text(`Validade: ${dadosOrcamento.validade} dias úteis`, 10, y);
    y += 6;
    doc.text("Deus Seja Sempre Louvado! Tudo posso Naquele que me Fortalece!", 105, y, { align: "center" });
    
    return doc.output("datauristring").split(",")[1];
}

// ============================================
// FUNÇÃO: ENVIAR PEDIDO POR E-MAIL
// ============================================
async function enviarPedidoEmail(pedido) {
    const clienteEmail = pedido.clienteEmail;
    if (!clienteEmail) return false;
    
    const assunto = `Prestige - Seu Pedido nº ${pedido.numero} - ${getStatusTexto(pedido.status)}`;
    
    let corpo = `${DANFE_CONFIG.empresa.nome}\n`;
    corpo += `${"=".repeat(40)}\n\n`;
    corpo += `Olá ${pedido.clienteNome},\n\n`;
    corpo += `Seu pedido foi atualizado!\n\n`;
    corpo += `📦 PEDID
