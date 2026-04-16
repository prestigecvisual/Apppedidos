// ============================================
// FUNÇÃO: CALCULAR TOTAIS COM DESCONTO (SUBSTITUIR A EXISTENTE)
// ============================================
function calcularTotais() {
    if (!sistema.carrinho) sistema.carrinho = [];
    
    const subtotal = sistema.carrinho.reduce((sum, item) => sum + (item.total || 0), 0);
    const frete = calcularFretePorCEP(document.getElementById('clienteCEP')?.value || "");
    
    // Forma de pagamento
    const formaPagamento = document.getElementById('formaPagamento')?.value;
    let acrescimo = 0;
    
    switch(formaPagamento) {
        case 'pix':
        case 'debito':
            acrescimo = 0;
            break;
        case 'credito_1x':
            acrescimo = subtotal * 0.015;
            break;
        case 'credito_3x':
            acrescimo = subtotal * 0.06;
            break;
        case 'credito_5x':
            acrescimo = subtotal * 0.07;
            break;
        default:
            acrescimo = 0;
    }
    
    // Aplicar desconto se existir
    let descontoValor = 0;
    let descontoPercentual = 0;
    let totalComDesconto = subtotal;
    
    if (sistema.descontoAtivo && sistema.desconto) {
        const descontoManager = new GerenciadorDesconto();
        descontoManager.fromJSON(sistema.desconto);
        const resultado = descontoManager.calcularTotalComDesconto(subtotal, 0, 0);
        descontoValor = resultado.desconto.valor;
        descontoPercentual = resultado.desconto.percentual;
        totalComDesconto = resultado.desconto.subtotalAposDesconto;
    }
    
    const total = totalComDesconto + frete + acrescimo;
    
    // Atualizar elementos na tela
    const subtotalElement = document.getElementById('subtotal');
    const descontoElement = document.getElementById('desconto');
    const freteElement = document.getElementById('frete');
    const totalElement = document.getElementById('totalGeral');
    const danfeTotalElement = document.getElementById('danfeTotalGeral');
    
    if (subtotalElement) subtotalElement.innerText = formatarMoeda(subtotal);
    if (freteElement) freteElement.innerText = formatarMoeda(frete);
    if (descontoElement) {
        if (descontoValor > 0) {
            descontoElement.innerHTML = `<span style="color: #10b981;">- ${formatarMoeda(descontoValor)} (${descontoPercentual.toFixed(1)}%)</span>`;
        } else {
            descontoElement.innerText = formatarMoeda(0);
        }
    }
    if (totalElement) totalElement.innerText = formatarMoeda(total);
    if (danfeTotalElement) danfeTotalElement.innerText = formatarMoeda(total);
    
    return { subtotal, frete, desconto: descontoValor, total };
}

// ============================================
// FUNÇÃO: SALVAR ORÇAMENTO COM DESCONTO
// ============================================
async function salvarOrcamento() {
    if (!sistema.carrinho || sistema.carrinho.length === 0) {
        alert('❌ Adicione itens ao carrinho antes de salvar');
        return;
    }
    
    const clienteNome = document.getElementById('clienteNome')?.value;
    if (!clienteNome) {
        alert('❌ Informe o nome do cliente');
        return;
    }
    
    // Calcular totais
    const subtotal = sistema.carrinho.reduce((sum, item) => sum + (item.total || 0), 0);
    const frete = calcularFretePorCEP(document.getElementById('clienteCEP')?.value || "");
    const formaPagamento = document.getElementById('formaPagamento')?.value || "";
    
    let acrescimo = 0;
    if (formaPagamento === "credito_1x") acrescimo = subtotal * 0.015;
    else if (formaPagamento === "credito_3x") acrescimo = subtotal * 0.06;
    else if (formaPagamento === "credito_5x") acrescimo = subtotal * 0.07;
    
    // Calcular desconto
    let descontoValor = 0;
    let descontoPercentual = 0;
    let totalComDesconto = subtotal;
    
    if (sistema.descontoAtivo && sistema.desconto) {
        const descontoManager = new GerenciadorDesconto();
        descontoManager.fromJSON(sistema.desconto);
        const resultado = descontoManager.calcularTotalComDesconto(subtotal, 0, 0);
        descontoValor = resultado.desconto.valor;
        descontoPercentual = resultado.desconto.percentual;
        totalComDesconto = resultado.desconto.subtotalAposDesconto;
    }
    
    const total = totalComDesconto + frete + acrescimo;
    const numero = gerarNumeroOrcamento();
    
    const orcamento = {
        numero: numero,
        dataCriacao: dataHoje(),
        dataCriacaoISO: new Date().toISOString(),
        clienteNome: clienteNome,
        clienteDoc: document.getElementById('clienteDoc')?.value || "",
        clienteTelefone: document.getElementById('clienteTelefone')?.value || "",
        clienteWhatsApp: document.getElementById('clienteWhatsApp')?.value || "",
        clienteEmail: document.getElementById('clienteEmail')?.value || "",
        clienteCEP: document.getElementById('clienteCEP')?.value || "",
        clienteEndereco: document.getElementById('clienteEndereco')?.value || "",
        clienteNumero: document.getElementById('clienteNumero')?.value || "",
        clienteBairro: document.getElementById('clienteBairro')?.value || "",
        clienteCidade: document.getElementById('clienteCidade')?.value || "",
        clienteEstado: document.getElementById('clienteEstado')?.value || "",
        itens: JSON.parse(JSON.stringify(sistema.carrinho)),
        subtotal: subtotal,
        frete: frete,
        desconto: sistema.desconto || null,
        descontoValor: descontoValor,
        descontoPercentual: descontoPercentual,
        total: total,
        formaPagamento: formaPagamento,
        observacoes: document.getElementById('inObs')?.value || "",
        status: 'Pendente'
    };
    
    if (!sistema.orcamentos) sistema.orcamentos = [];
    sistema.orcamentos.push(orcamento);
    sistema.contadorOrcamento = (sistema.contadorOrcamento || 1) + 1;
    
    salvarNoNavegador();
    
    // Limpar carrinho mas manter desconto? (opcional)
    sistema.carrinho = [];
    atualizarCarrinho();
    calcularTotais();
    atualizarPreviewDANFE();
    atualizarListaOrcamentos();
    atualizarDashboard();
    
    alert(`✅ Orçamento ${numero} salvo com sucesso!`);
    
    // Envio automático (opcional)
    if (orcamento.clienteEmail && orcamento.clienteEmail !== 'prestigecvisual@gmail.com') {
        const enviar = confirm(`Deseja enviar o orçamento para ${orcamento.clienteEmail}?`);
        if (enviar) {
            await enviarOrcamentoEmailDireto(orcamento);
        }
    }
}

// ============================================
// FUNÇÃO: EDITAR ORÇAMENTO SALVO
// ============================================
function editarOrcamentoSalvo(orcamento) {
    if (!orcamento) return;
    
    // Carregar dados do orçamento no formulário
    document.getElementById('clienteNome').value = orcamento.clienteNome || "";
    document.getElementById('clienteDoc').value = orcamento.clienteDoc || "";
    document.getElementById('clienteTelefone').value = orcamento.clienteTelefone || "";
    document.getElementById('clienteWhatsApp').value = orcamento.clienteWhatsApp || "";
    document.getElementById('clienteEmail').value = orcamento.clienteEmail || "";
    document.getElementById('clienteCEP').value = orcamento.clienteCEP || "";
    document.getElementById('clienteEndereco').value = orcamento.clienteEndereco || "";
    document.getElementById('clienteNumero').value = orcamento.clienteNumero || "";
    document.getElementById('clienteBairro').value = orcamento.clienteBairro || "";
    document.getElementById('clienteCidade').value = orcamento.clienteCidade || "";
    document.getElementById('clienteEstado').value = orcamento.clienteEstado || "";
    document.getElementById('inObs').value = orcamento.observacoes || "";
    document.getElementById('formaPagamento').value = orcamento.formaPagamento || "";
    
    // Carregar itens do carrinho
    sistema.carrinho = JSON.parse(JSON.stringify(orcamento.itens || []));
    atualizarCarrinho();
    
    // Carregar desconto
    if (orcamento.desconto) {
        sistema.descontoAtivo = true;
        sistema.desconto = orcamento.desconto;
        
        // Atualizar painel de desconto
        const descontoManager = new GerenciadorDesconto();
        descontoManager.fromJSON(orcamento.desconto);
        
        if (orcamento.desconto.tipo === 'percentual') {
            document.getElementById('descontoPercentual').value = orcamento.desconto.valor;
            document.querySelector('input[name="tipoDesconto"][value="percentual"]').checked = true;
        } else {
            document.getElementById('descontoFixo').value = orcamento.desconto.valor;
            document.querySelector('input[name="tipoDesconto"][value="fixo"]').checked = true;
        }
        document.getElementById('descontoJustificativa').value = orcamento.desconto.justificativa || "";
        toggleDescontoInputs();
    } else {
        sistema.descontoAtivo = false;
        sistema.desconto = null;
    }
    
    // Recalcular tudo
    calcularTotais();
    atualizarPreviewDANFE();
    
    alert(`📋 Orçamento ${orcamento.numero} carregado para edição.`);
    
    // Remover o orçamento original (será salvo como novo)
    const index = sistema.orcamentos.findIndex(o => o.numero === orcamento.numero);
    if (index !== -1) {
        if (confirm('Deseja remover o orçamento original após editar?')) {
            sistema.orcamentos.splice(index, 1);
            salvarNoNavegador();
            atualizarListaOrcamentos();
        }
    }
}

// ============================================
// FUNÇÃO: INICIALIZAR PAINEL DE DESCONTO
// ============================================
function inicializarPainelDesconto() {
    // Verificar se o painel já existe
    let painel = document.getElementById('painelDesconto');
    if (!painel) {
        // Procurar local para inserir (após o resumo do pedido)
        const targetElement = document.querySelector('.totais-area');
        if (targetElement && targetElement.parentNode) {
            const painelHTML = criarPainelDesconto();
            targetElement.insertAdjacentHTML('afterend', painelHTML);
        }
    }
    
    // Configurar eventos
    const radios = document.querySelectorAll('input[name="tipoDesconto"]');
    radios.forEach(radio => {
        radio.addEventListener('change', toggleDescontoInputs);
    });
    
    // Carregar desconto salvo se existir
    if (sistema.descontoAtivo && sistema.desconto) {
        const descontoManager = new GerenciadorDesconto();
        descontoManager.fromJSON(sistema.desconto);
        
        if (sistema.desconto.tipo === 'percentual') {
            document.getElementById('descontoPercentual').value = sistema.desconto.valor;
        } else {
            document.getElementById('descontoFixo').value = sistema.desconto.valor;
        }
        document.getElementById('descontoJustificativa').value = sistema.desconto.justificativa || "";
        atualizarResumoDesconto();
    }
}
