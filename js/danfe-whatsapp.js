// ============================================
// DANFE WHATSAPP - ENVIO AUTOMÁTICO
// ============================================

// ============================================
// FUNÇÃO: ENVIAR ORÇAMENTO POR WHATSAPP
// ============================================
async function enviarOrcamentoWhatsApp() {
    // Obter dados do cliente
    const clienteNome = document.getElementById("clienteNome")?.value || "Cliente";
    const clienteWhatsApp = document.getElementById("clienteWhatsApp")?.value;
    const clienteEmail = document.getElementById("clienteEmail")?.value;
    
    if (!clienteWhatsApp) {
        alert("⚠️ Informe o número do WhatsApp do cliente");
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
    
    // Montar mensagem formatada
    let mensagem = `*PRESTIGE COMUNICAÇÃO VISUAL*\n`;
    mensagem += `*Sistema de Orçamentos*\n\n`;
    mensagem += `Olá *${clienteNome}*!\n\n`;
    mensagem += `📋 *SEU ORÇAMENTO*\n`;
    mensagem += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    mensagem += `*ITENS:*\n`;
    
    itens.forEach((item, index) => {
        mensagem += `${index + 1}. ${item.nome}\n`;
        if (item.medida && item.medida !== "--") {
            mensagem += `   📏 Medida: ${item.medida}\n`;
        }
        mensagem += `   📦 Quantidade: ${item.qtd}\n`;
        mensagem += `   💰 Valor: ${formatarMoeda(item.valorUnitario)}\n`;
        mensagem += `   ✅ Subtotal: ${formatarMoeda(item.total)}\n\n`;
    });
    
    mensagem += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    mensagem += `💰 *Subtotal:* ${formatarMoeda(subtotal)}\n`;
    mensagem += `🚚 *Frete:* ${formatarMoeda(frete)}\n`;
    mensagem += `💳 *Forma de Pagamento:* ${getFormaPagamentoTexto(formaPagamento)}\n`;
    mensagem += `🎯 *TOTAL:* ${formatarMoeda(totalFinal)}\n\n`;
    
    mensagem += `📅 *Validade:* ${DANFE_CONFIG.danfe.prazoValidade} dias úteis\n`;
    mensagem += `🔑 *Chave PIX:* ${DANFE_CONFIG.empresa.chavePIX}\n\n`;
    
    mensagem += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    mensagem += `📞 *Contato:* ${DANFE_CONFIG.empresa.telefone}\n`;
    mensagem += `📧 *E-mail:* ${DANFE_CONFIG.empresa.email}\n`;
    mensagem += `📍 *Endereço:* ${DANFE_CONFIG.empresa.endereco}, ${DANFE_CONFIG.empresa.bairro}\n`;
    mensagem += `🏙️ *Cidade:* ${DANFE_CONFIG.empresa.cidade} - ${DANFE_CONFIG.empresa.estado}\n\n`;
    
    mensagem += `🙏 *${DANFE_CONFIG.empresa.nome}*\n`;
    mensagem += `"Deus Seja Sempre Louvado! Tudo posso Naquele que me Fortalece!"`;
    
    // Gerar QR Code PIX e enviar
    const qrCodeBase64 = await gerarQRCodePIX(totalFinal, "temp-qr");
    if (qrCodeBase64) {
        mensagem += `\n\n*QR Code PIX para pagamento:*\n`;
        mensagem += `(Anexo enviado separadamente)`;
    }
    
    // Limpar número de telefone
    let numeroWhatsApp = clienteWhatsApp.replace(/\D/g, "");
    if (!numeroWhatsApp.startsWith("55")) {
        numeroWhatsApp = "55" + numeroWhatsApp;
    }
    
    // Codificar mensagem para URL
    const mensagemCodificada = encodeURIComponent(mensagem);
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`;
    
    // Abrir WhatsApp Web/App
    window.open(urlWhatsApp, "_blank");
    
    // Salvar log de envio
    salvarLogEnvio({
        tipo: "whatsapp",
        destinatario: clienteWhatsApp,
        cliente: clienteNome,
        data: formatarData(new Date()),
        valor: totalFinal,
        orcamentoNumero: document.getElementById("numeroOrcamento")?.innerText || "---"
    });
    
    return true;
}

// ============================================
// FUNÇÃO: OBTER TEXTO DA FORMA DE PAGAMENTO
// ============================================
function getFormaPagamentoTexto(forma) {
    const formas = {
        "pix": "PIX (sem juros)",
        "debito": "Débito",
        "credito_1x": "Crédito 1x (+1,5%)",
        "credito_3x": "Crédito 3x (+6%)",
        "credito_5x": "Crédito 5x (+7%)"
    };
    return formas[forma] || forma;
}

// ============================================
// FUNÇÃO: SALVAR LOG DE ENVIO
// ============================================
function salvarLogEnvio(log) {
    if (!sistema.logs) sistema.logs = [];
    sistema.logs.push({
        ...log,
        timestamp: new Date().toISOString()
    });
    salvarNoNavegador();
}

// ============================================
// FUNÇÃO: ENVIAR PEDIDO POR WHATSAPP
// ============================================
async function enviarPedidoWhatsApp(pedido) {
    const clienteWhatsApp = pedido.clienteWhatsApp;
    if (!clienteWhatsApp) return false;
    
    let mensagem = `*PRESTIGE COMUNICAÇÃO VISUAL*\n`;
    mensagem += `*Atualização do Pedido*\n\n`;
    mensagem += `Olá *${pedido.clienteNome}*!\n\n`;
    mensagem += `📦 *PEDIDO Nº:* ${pedido.numero}\n`;
    mensagem += `📅 *Data:* ${pedido.dataCriacao}\n`;
    mensagem += `📍 *Status:* ${getStatusTexto(pedido.status)}\n`;
    mensagem += `💰 *Valor:* ${formatarMoeda(pedido.total)}\n\n`;
    
    if (pedido.status === "finalizado") {
        mensagem += `✅ *Seu pedido foi finalizado!*\n`;
        mensagem += `Em breve entraremos em contato para combinar a entrega.\n\n`;
    } else if (pedido.status === "entregue") {
        mensagem += `🎉 *Pedido entregue!*\n`;
        mensagem += `Agradecemos pela preferência!\n\n`;
    }
    
    mensagem += `📞 Dúvidas? Entre em contato: ${DANFE_CONFIG.empresa.telefone}\n`;
    mensagem += `🙏 ${DANFE_CONFIG.empresa.nome}`;
    
    let numeroWhatsApp = clienteWhatsApp.replace(/\D/g, "");
    if (!numeroWhatsApp.startsWith("55")) {
        numeroWhatsApp = "55" + numeroWhatsApp;
    }
    
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(urlWhatsApp, "_blank");
    
    return true;
}

function getStatusTexto(status) {
    const statusMap = {
        "producao": "🟡 Em Produção",
        "andamento": "🔵 Em Andamento",
        "finalizado": "🟢 Finalizado",
        "entregue": "⚫ Entregue"
    };
    return statusMap[status] || status;
}
