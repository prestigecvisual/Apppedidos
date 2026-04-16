// ============================================
// DANFE PRINT - IMPRESSÃO PROFISSIONAL
// ============================================

// ============================================
// FUNÇÃO: IMPRIMIR DANFE
// ============================================
function imprimirDANFE() {
    // Verificar se há itens
    if (!sistema.carrinho || sistema.carrinho.length === 0) {
        alert("⚠️ Adicione itens ao carrinho antes de imprimir");
        return;
    }
    
    // Obter dados atuais
    const dados = obterDadosAtuais();
    
    // Gerar HTML do DANFE para impressão
    const htmlDanfe = gerarHTMLDANFE(dados);
    
    // Abrir janela de impressão
    const janelaImpressao = window.open("", "_blank", "width=800,height=600,toolbar=yes,scrollbars=yes");
    janelaImpressao.document.write(htmlDanfe);
    janelaImpressao.document.close();
    
    janelaImpressao.onload = function() {
        janelaImpressao.print();
    };
}

// ============================================
// FUNÇÃO: OBTER DADOS ATUAIS DO SISTEMA
// ============================================
function obterDadosAtuais() {
    const itens = sistema.carrinho || [];
    const subtotal = itens.reduce((sum, item) => sum + (item.total || 0), 0);
    const frete = calcularFretePorCEP(document.getElementById("clienteCEP")?.value || "");
    const formaPagamento = document.getElementById("formaPagamento")?.value || "pix";
    let totalFinal = subtotal + frete;
    
    if (formaPagamento === "credito_1x") totalFinal *= 1.015;
    else if (formaPagamento === "credito_3x") totalFinal *= 1.06;
    else if (formaPagamento === "credito_5x") totalFinal *= 1.07;
    
    return {
        numeroDocumento: document.getElementById("numeroOrcamento")?.innerText || gerarNumeroDANFE(),
        dataEmissao: formatarData(new Date()),
        dataVencimento: formatarData(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        cliente: {
            nome: document.getElementById("clienteNome")?.value || "_________________________",
            doc: document.getElementById("clienteDoc")?.value || "_______________",
            telefone: document.getElementById("clienteTelefone")?.value || "",
            whatsapp: document.getElementById("clienteWhatsApp")?.value || "",
            email: document.getElementById("clienteEmail")?.value || "",
            endereco: document.getElementById("clienteEndereco")?.value || "",
            numero: document.getElementById("clienteNumero")?.value || "",
            bairro: document.getElementById("clienteBairro")?.value || "",
            cidade: document.getElementById("clienteCidade")?.value || "",
            estado: document.getElementById("clienteEstado")?.value || "",
            cep: document.getElementById("clienteCEP")?.value || ""
        },
        itens: itens,
        subtotal: subtotal,
        frete: frete,
        total: totalFinal,
        formaPagamento: formaPagamento,
        observacoes: document.getElementById("inObs")?.value || "",
        chavePIX: DANFE_CONFIG.empresa.chavePIX,
        empresa: DANFE_CONFIG.empresa
    };
}

// ============================================
// FUNÇÃO: GERAR HTML DO DANFE PARA IMPRESSÃO
// ============================================
function gerarHTMLDANFE(dados) {
    return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>DANFE - ${dados.empresa.nome}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Courier New', Courier, monospace;
            background: white;
            padding: 8mm;
            font-size: 10pt;
        }
        .danfe-container {
            max-width: 210mm;
            margin: 0 auto;
        }
        .danfe-box {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
            border: 1px solid black;
        }
        .danfe-box td, .danfe-box th {
            border: 1px solid black;
            padding: 4px;
            vertical-align: top;
        }
        .label {
            font-size: 8pt;
            font-weight: bold;
            text-transform: uppercase;
            display: block;
        }
        .header-grid {
            display: grid;
            grid-template-columns: 120px 1fr 150px;
            align-items: center;
            border: 1px solid black;
            margin-bottom: 4px;
        }
        .logo-area {
            text-align: center;
            border-right: 1px solid black;
            padding: 5px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .logo-area img {
            max-width: 100%;
            max-height: 70px;
            object-fit: contain;
        }
        .info-empresa { padding: 5px; font-size: 9pt; }
        .tipo-doc {
            text-align: center;
            border-left: 1px solid black;
            padding: 5px;
            height: 80px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .flex-footer {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin-top: 4px;
        }
        .frase-fe {
            text-align: center;
            margin-top: 20px;
            font-weight: bold;
            font-style: italic;
            font-size: 10pt;
            border-top: 1px dashed black;
            padding-top: 10px;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .total-value { font-size: 12pt; font-weight: bold; }
        .bg-gray { background: #f0f0f0; }
        
        @media print {
            body { padding: 0; margin: 0; }
            @page { margin: 8mm; }
        }
    </style>
</head>
<body>
<div class="danfe-container">
    <!-- CABEÇALHO -->
    <div class="header-grid">
        <div class="logo-area">
            <img src="imagem/logo.png" alt="${dados.empresa.nome}" onerror="this.style.display='none'">
        </div>
        <div class="info-empresa">
            <span class="label">EMITENTE</span>
            <strong>${dados.empresa.nome}</strong><br>
            ${dados.empresa.endereco}, ${dados.empresa.bairro}<br>
            ${dados.empresa.cidade} - ${dados.empresa.estado} | CEP: ${dados.empresa.cep}<br>
            📞 ${dados.empresa.telefone} | 📧 ${dados.empresa.email}<br>
            🔑 Chave PIX: ${dados.empresa.chavePIX}
        </div>
        <div class="tipo-doc">
            <span class="label">DOCUMENTO</span>
            <strong>ORÇAMENTO</strong><br>
            <small>Nº ${dados.numeroDocumento}</small><br>
            <small>Via Cliente</small><br>
            <small>Emissão: ${dados.dataEmissao}</small>
        </div>
    </div>

    <!-- CLIENTE -->
    <table class="danfe-box">
        <tr>
            <td style="width: 40%;"><span class="label">CLIENTE</span> ${dados.cliente.nome}</td>
            <td style="width: 30%;"><span class="label">CPF/CNPJ</span> ${dados.cliente.doc}</td>
            <td style="width: 30%;"><span class="label">CONTATO</span> ${dados.cliente.telefone || dados.cliente.whatsapp}</td>
        </tr>
        <tr>
            <td colspan="3"><span class="label">ENDEREÇO</span> ${dados.cliente.endereco}, ${dados.cliente.numero} - ${dados.cliente.bairro}, ${dados.cliente.cidade}/${dados.cliente.estado} - CEP: ${dados.cliente.cep}</td>
        </tr>
    </table>

    <!-- ITENS -->
    <table class="danfe-box">
        <thead>
            <tr class="bg-gray">
                <th style="width: 50%;"><span class="label">DESCRIÇÃO</span></th>
                <th style="width: 10%; text-align: center;"><span class="label">QTD</span></th>
                <th style="width: 20%; text-align: right;"><span class="label">VALOR UNIT.</span></th>
                <th style="width: 20%; text-align: right;"><span class="label">TOTAL</span></th>
            </tr>
        </thead>
        <tbody>
            ${dados.itens.map(item => `
            <tr>
                <td>${item.nome}${item.medida && item.medida !== "--" ? `<br><small>${item.medida}</small>` : ""}</td>
                <td style="text-align: center;">${item.qtd}</td>
                <td style="text-align: right;">${formatarMoeda(item.valorUnitario)}</td>
                <td style="text-align: right;">${formatarMoeda(item.total)}</td>
             </tr>
            `).join("")}
        </tbody>
        <tfoot>
            <tr class="bg-gray">
                <td colspan="3" style="text-align: right;"><strong>SUBTOTAL</strong></td>
                <td style="text-align: right;"><strong>${formatarMoeda(dados.subtotal)}</strong></td>
            </tr>
            <tr>
                <td colspan="3" style="text-align: right;">Frete</td>
                <td style="text-align: right;">${formatarMoeda(dados.frete)}</td>
             </tr>
            <tr class="bg-gray">
                <td colspan="3" style="text-align: right;"><strong>TOTAL GERAL</strong></td>
                <td style="text-align: right;"><strong class="total-value">${formatarMoeda(dados.total)}</strong></td>
             </tr>
        </tfoot>
    </table>

    <!-- OBSERVAÇÕES -->
    <table class="danfe-box">
        <tr><td><span class="label">OBSERVAÇÕES / CONDIÇÕES</span><br>${dados.observacoes || "Prazo de entrega: 7 dias úteis"}</td></tr>
    </table>

    <!-- RODAPÉ PIX -->
    <div class="flex-footer">
        <table class="danfe-box" style="width: 45%;">
            <tr><td style="text-align: center; padding: 10px;">
                <span class="label">PAGAMENTO VIA PIX</span>
                <div id="qrcode-print" style="display: flex; justify-content: center; margin: 5px;"></div>
                <small>Chave: ${dados.chavePIX}</small>
             </td></tr>
        </table>
        <table class="danfe-box" style="width: 50%;">
            <tr><td><span class="label">FORMA DE PAGAMENTO</span><br>${getFormaPagamentoTexto(dados.formaPagamento)}</td></tr>
            <tr><td><span class="label">VALIDADE</span><br>${dados.dataVencimento} (${DANFE_CONFIG.danfe.prazoValidade} dias úteis)</td></tr>
        </table>
    </div>

    <!-- FRASE -->
    <div class="frase-fe">
        "Deus Seja Sempre Louvado! Tudo posso Naquele que me Fortalece!"<br>
        ${dados.empresa.nome} - ${dados.empresa.telefone}
    </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<script>
    const total = ${dados.total};
    const chave = "${dados.chavePIX}";
    const nome = "${dados.empresa.nome}";
    const cidade = "${dados.empresa.cidade.replace(/\\s/g, "")}";
    
    const vF = total.toFixed(2);
    const payload = "000201" + "26" + "00" + "14" + "BR.GOV.BCB.PIX" + "0111" + chave + "52040000" + "5303986" + "54" + vF.replace(".", "").length.toString().padStart(2, "0") + vF.replace(".", "") + "5802BR" + "59" + nome.length.toString().padStart(2, "0") + nome + "60" + cidade.length.toString().padStart(2, "0") + cidade + "6304";
    
    new QRCode(document.getElementById("qrcode-print"), {
        text: payload,
        width: 100,
        height: 100
    });
</script>
</body>
</html>
    `;
}
