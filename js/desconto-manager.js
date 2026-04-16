// ============================================
// DESCONTO MANAGER - SISTEMA COMPLETO DE DESCONTOS
// ============================================

const DESCONTO_CONFIG = {
    tipos: ["percentual", "fixo"],
    padrao: {
        tipo: "percentual",
        valor: 0
    },
    maxPercentual: 100,
    minPercentual: 0,
    maxFixo: 100000,
    minFixo: 0
};

// ============================================
// CLASSE: GERENCIADOR DE DESCONTO
// ============================================
class GerenciadorDesconto {
    constructor() {
        this.tipo = "percentual"; // "percentual" ou "fixo"
        this.valor = 0;
        this.justificativa = "";
        this.aplicadoEm = null;
        this.aplicadoPor = "";
    }

    // ============================================
    // APLICAR DESCONTO
    // ============================================
    aplicarDesconto(subtotal, tipo = null, valor = null) {
        const tipoDesconto = tipo || this.tipo;
        const valorDesconto = valor !== null ? valor : this.valor;
        
        if (tipoDesconto === "percentual") {
            const percentual = Math.min(
                DESCONTO_CONFIG.maxPercentual,
                Math.max(DESCONTO_CONFIG.minPercentual, valorDesconto)
            );
            const valorDescontoCalculado = subtotal * (percentual / 100);
            return {
                valor: valorDescontoCalculado,
                percentual: percentual,
                tipo: "percentual",
                subtotalAposDesconto: subtotal - valorDescontoCalculado
            };
        } else {
            const valorFixo = Math.min(
                DESCONTO_CONFIG.maxFixo,
                Math.max(DESCONTO_CONFIG.minFixo, valorDesconto)
            );
            const valorFinal = Math.max(0, subtotal - valorFixo);
            return {
                valor: valorFixo,
                percentual: subtotal > 0 ? (valorFixo / subtotal) * 100 : 0,
                tipo: "fixo",
                subtotalAposDesconto: valorFinal
            };
        }
    }

    // ============================================
    // CALCULAR TOTAL COM DESCONTO
    // ============================================
    calcularTotalComDesconto(subtotal, frete = 0, acrescimo = 0) {
        const resultadoDesconto = this.aplicarDesconto(subtotal);
        const total = resultadoDesconto.subtotalAposDesconto + frete + acrescimo;
        
        return {
            subtotal: subtotal,
            desconto: resultadoDesconto,
            frete: frete,
            acrescimo: acrescimo,
            total: total,
            economia: resultadoDesconto.valor
        };
    }

    // ============================================
    // DEFINIR DESCONTO POR PERCENTUAL
    // ============================================
    definirDescontoPercentual(percentual, justificativa = "", usuario = "") {
        if (percentual < DESCONTO_CONFIG.minPercentual || percentual > DESCONTO_CONFIG.maxPercentual) {
            throw new Error(`Percentual deve estar entre ${DESCONTO_CONFIG.minPercentual}% e ${DESCONTO_CONFIG.maxPercentual}%`);
        }
        
        this.tipo = "percentual";
        this.valor = percentual;
        this.justificativa = justificativa;
        this.aplicadoEm = new Date().toISOString();
        this.aplicadoPor = usuario;
        
        return this;
    }

    // ============================================
    // DEFINIR DESCONTO POR VALOR FIXO
    // ============================================
    definirDescontoFixo(valor, justificativa = "", usuario = "") {
        if (valor < DESCONTO_CONFIG.minFixo || valor > DESCONTO_CONFIG.maxFixo) {
            throw new Error(`Valor deve estar entre R$ ${DESCONTO_CONFIG.minFixo} e R$ ${DESCONTO_CONFIG.maxFixo}`);
        }
        
        this.tipo = "fixo";
        this.valor = valor;
        this.justificativa = justificativa;
        this.aplicadoEm = new Date().toISOString();
        this.aplicadoPor = usuario;
        
        return this;
    }

    // ============================================
    // REMOVER DESCONTO
    // ============================================
    removerDesconto() {
        this.tipo = "percentual";
        this.valor = 0;
        this.justificativa = "";
        this.aplicadoEm = null;
        this.aplicadoPor = "";
        
        return this;
    }

    // ============================================
    // OBTER RESUMO DO DESCONTO
    // ============================================
    obterResumo(subtotal) {
        if (this.valor === 0) {
            return {
                ativo: false,
                mensagem: "Nenhum desconto aplicado",
                valor: 0,
                percentual: 0,
                economia: 0
            };
        }
        
        const resultado = this.aplicarDesconto(subtotal);
        
        return {
            ativo: true,
            tipo: this.tipo,
            valorAplicado: this.valor,
            valorDesconto: resultado.valor,
            percentual: resultado.percentual,
            economia: resultado.valor,
            justificativa: this.justificativa,
            aplicadoEm: this.aplicadoEm,
            aplicadoPor: this.aplicadoPor,
            mensagem: this.tipo === "percentual" 
                ? `${this.valor}% de desconto aplicado (R$ ${resultado.valor.toFixed(2)})`
                : `Desconto de R$ ${this.valor.toFixed(2)} aplicado (${resultado.percentual.toFixed(1)}% de economia)`
        };
    }

    // ============================================
    // SALVAR ESTADO
    // ============================================
    toJSON() {
        return {
            tipo: this.tipo,
            valor: this.valor,
            justificativa: this.justificativa,
            aplicadoEm: this.aplicadoEm,
            aplicadoPor: this.aplicadoPor
        };
    }

    // ============================================
    // CARREGAR ESTADO
    // ============================================
    fromJSON(data) {
        if (data) {
            this.tipo = data.tipo || "percentual";
            this.valor = data.valor || 0;
            this.justificativa = data.justificativa || "";
            this.aplicadoEm = data.aplicadoEm || null;
            this.aplicadoPor = data.aplicadoPor || "";
        }
        return this;
    }
}

// ============================================
// FUNÇÃO: CRIAR PAINEL DE DESCONTO NO HTML
// ============================================
function criarPainelDesconto() {
    const painelHTML = `
        <div class="card desconto-painel" id="painelDesconto">
            <h3>🎯 Desconto</h3>
            
            <div class="desconto-tipo-selector">
                <label>
                    <input type="radio" name="tipoDesconto" value="percentual" checked> 
                    Percentual (%)
                </label>
                <label>
                    <input type="radio" name="tipoDesconto" value="fixo"> 
                    Valor Fixo (R$)
                </label>
            </div>
            
            <div class="desconto-input-group" id="descontoPercentualGroup">
                <label>Percentual de desconto (%)</label>
                <div class="input-with-buttons">
                    <button type="button" onclick="ajustarDesconto(-5)">-5%</button>
                    <input type="number" id="descontoPercentual" value="0" min="0" max="100" step="1" onchange="aplicarDescontoInput()">
                    <button type="button" onclick="ajustarDesconto(5)">+5%</button>
                </div>
                <div class="preset-buttons">
                    <button type="button" onclick="aplicarDescontoRapido(5)">5%</button>
                    <button type="button" onclick="aplicarDescontoRapido(10)">10%</button>
                    <button type="button" onclick="aplicarDescontoRapido(15)">15%</button>
                    <button type="button" onclick="aplicarDescontoRapido(20)">20%</button>
                    <button type="button" onclick="aplicarDescontoRapido(30)">30%</button>
                </div>
            </div>
            
            <div class="desconto-input-group" id="descontoFixoGroup" style="display: none;">
                <label>Valor do desconto (R$)</label>
                <div class="input-with-buttons">
                    <button type="button" onclick="ajustarDescontoFixo(-10)">-R$10</button>
                    <input type="number" id="descontoFixo" value="0" min="0" step="10" onchange="aplicarDescontoInput()">
                    <button type="button" onclick="ajustarDescontoFixo(10)">+R$10</button>
                </div>
                <div class="preset-buttons">
                    <button type="button" onclick="aplicarDescontoFixoRapido(50)">R$ 50</button>
                    <button type="button" onclick="aplicarDescontoFixoRapido(100)">R$ 100</button>
                    <button type="button" onclick="aplicarDescontoFixoRapido(200)">R$ 200</button>
                    <button type="button" onclick="aplicarDescontoFixoRapido(500)">R$ 500</button>
                </div>
            </div>
            
            <div class="desconto-justificativa">
                <label>Justificativa (opcional)</label>
                <input type="text" id="descontoJustificativa" placeholder="Ex: Cliente fidelidade, Pagamento à vista, etc.">
            </div>
            
            <div class="desconto-resumo" id="descontoResumo">
                <span class="resumo-texto">Nenhum desconto aplicado</span>
                <span class="resumo-valor"></span>
            </div>
            
            <div class="desconto-actions">
                <button type="button" onclick="aplicarDescontoConfirmado()" class="btn-desconto-aplicar">✅ Aplicar Desconto</button>
                <button type="button" onclick="removerDesconto()" class="btn-desconto-remover">🗑️ Remover Desconto</button>
            </div>
        </div>
    `;
    
    return painelHTML;
}

// ============================================
// FUNÇÕES DE CONTROLE DO PAINEL
// ============================================
let gerenciadorDescontoGlobal = new GerenciadorDesconto();

function ajustarDesconto(valor) {
    const input = document.getElementById('descontoPercentual');
    if (input) {
        let novoValor = (parseFloat(input.value) || 0) + valor;
        novoValor = Math.min(100, Math.max(0, novoValor));
        input.value = novoValor;
        atualizarPreviewDesconto();
    }
}

function ajustarDescontoFixo(valor) {
    const input = document.getElementById('descontoFixo');
    if (input) {
        let novoValor = (parseFloat(input.value) || 0) + valor;
        novoValor = Math.max(0, novoValor);
        input.value = novoValor;
        atualizarPreviewDesconto();
    }
}

function aplicarDescontoRapido(percentual) {
    document.getElementById('descontoPercentual').value = percentual;
    document.querySelector('input[name="tipoDesconto"][value="percentual"]').checked = true;
    toggleDescontoInputs();
    atualizarPreviewDesconto();
}

function aplicarDescontoFixoRapido(valor) {
    document.getElementById('descontoFixo').value = valor;
    document.querySelector('input[name="tipoDesconto"][value="fixo"]').checked = true;
    toggleDescontoInputs();
    atualizarPreviewDesconto();
}

function toggleDescontoInputs() {
    const tipo = document.querySelector('input[name="tipoDesconto"]:checked').value;
    const percentualGroup = document.getElementById('descontoPercentualGroup');
    const fixoGroup = document.getElementById('descontoFixoGroup');
    
    if (tipo === 'percentual') {
        percentualGroup.style.display = 'block';
        fixoGroup.style.display = 'none';
    } else {
        percentualGroup.style.display = 'none';
        fixoGroup.style.display = 'block';
    }
}

function atualizarPreviewDesconto() {
    const tipo = document.querySelector('input[name="tipoDesconto"]:checked').value;
    let valorDesconto = 0;
    let textoPreview = "";
    
    // Obter subtotal atual
    const itens = sistema.carrinho || [];
    const subtotal = itens.reduce((sum, item) => sum + (item.total || 0), 0);
    
    if (tipo === 'percentual') {
        valorDesconto = parseFloat(document.getElementById('descontoPercentual').value) || 0;
        const valorCalculado = subtotal * (valorDesconto / 100);
        textoPreview = `${valorDesconto}% = ${formatarMoeda(valorCalculado)} de desconto`;
    } else {
        valorDesconto = parseFloat(document.getElementById('descontoFixo').value) || 0;
        textoPreview = `${formatarMoeda(valorDesconto)} de desconto`;
    }
    
    const resumoDiv = document.getElementById('descontoResumo');
    if (resumoDiv) {
        resumoDiv.innerHTML = `
            <span class="resumo-texto">📉 Prévia: ${textoPreview}</span>
        `;
    }
}

function aplicarDescontoConfirmado() {
    const tipo = document.querySelector('input[name="tipoDesconto"]:checked').value;
    const justificativa = document.getElementById('descontoJustificativa').value;
    let valorDesconto = 0;
    
    if (tipo === 'percentual') {
        valorDesconto = parseFloat(document.getElementById('descontoPercentual').value) || 0;
        gerenciadorDescontoGlobal.definirDescontoPercentual(valorDesconto, justificativa, "Usuario");
    } else {
        valorDesconto = parseFloat(document.getElementById('descontoFixo').value) || 0;
        gerenciadorDescontoGlobal.definirDescontoFixo(valorDesconto, justificativa, "Usuario");
    }
    
    // Salvar no sistema
    sistema.descontoAtivo = true;
    sistema.desconto = gerenciadorDescontoGlobal.toJSON();
    salvarNoNavegador();
    
    // Recalcular totais
    calcularTotaisComDesconto();
    
    // Mostrar feedback
    const itens = sistema.carrinho || [];
    const subtotal = itens.reduce((sum, item) => sum + (item.total || 0), 0);
    const resumo = gerenciadorDescontoGlobal.obterResumo(subtotal);
    
    alert(`✅ Desconto aplicado!\n${resumo.mensagem}`);
    
    atualizarResumoDesconto();
}

function removerDesconto() {
    gerenciadorDescontoGlobal.removerDesconto();
    
    sistema.descontoAtivo = false;
    sistema.desconto = null;
    salvarNoNavegador();
    
    // Resetar inputs
    document.getElementById('descontoPercentual').value = 0;
    document.getElementById('descontoFixo').value = 0;
    document.getElementById('descontoJustificativa').value = "";
    document.querySelector('input[name="tipoDesconto"][value="percentual"]').checked = true;
    toggleDescontoInputs();
    
    // Recalcular totais
    calcularTotaisComDesconto();
    
    alert("✅ Desconto removido!");
    atualizarResumoDesconto();
}

function atualizarResumoDesconto() {
    const itens = sistema.carrinho || [];
    const subtotal = itens.reduce((sum, item) => sum + (item.total || 0), 0);
    const resumo = gerenciadorDescontoGlobal.obterResumo(subtotal);
    
    const resumoDiv = document.getElementById('descontoResumo');
    if (resumoDiv) {
        if (resumo.ativo) {
            resumoDiv.innerHTML = `
                <span class="resumo-texto" style="color: #10b981;">✅ ${resumo.mensagem}</span>
                <span class="resumo-valor" style="color: #10b981; font-weight: bold;">
                    Economia: ${formatarMoeda(resumo.economia)}
                </span>
                ${resumo.justificativa ? `<small>Motivo: ${resumo.justificativa}</small>` : ''}
            `;
        } else {
            resumoDiv.innerHTML = `
                <span class="resumo-texto">📉 Nenhum desconto aplicado</span>
            `;
        }
    }
}

function calcularTotaisComDesconto() {
    const itens = sistema.carrinho || [];
    const subtotal = itens.reduce((sum, item) => sum + (item.total || 0), 0);
    const frete = calcularFretePorCEP(document.getElementById('clienteCEP')?.value || "");
    
    // Obter forma de pagamento
    const formaPagamento = document.getElementById('formaPagamento')?.value || "pix";
    let acrescimo = 0;
    
    if (formaPagamento === "credito_1x") acrescimo = subtotal * 0.015;
    else if (formaPagamento === "credito_3x") acrescimo = subtotal * 0.06;
    else if (formaPagamento === "credito_5x") acrescimo = subtotal * 0.07;
    
    // Aplicar desconto
    const resultado = gerenciadorDescontoGlobal.calcularTotalComDesconto(subtotal, frete, acrescimo);
    
    // Atualizar elementos na tela
    document.getElementById('subtotal').innerText = formatarMoeda(subtotal);
    document.getElementById('frete').innerText = formatarMoeda(frete);
    document.getElementById('desconto').innerText = `- ${formatarMoeda(resultado.desconto.valor)}`;
    document.getElementById('totalGeral').innerText = formatarMoeda(resultado.total);
    document.getElementById('danfeTotalGeral').innerText = formatarMoeda(resultado.total);
    
    return resultado;
}

// ============================================
// FUNÇÃO: EDITAR DESCONTO EM ORÇAMENTO SALVO
// ============================================
function editarDescontoOrcamentoSalvo(orcamento) {
    if (!orcamento) return;
    
    // Carregar desconto salvo
    if (orcamento.desconto) {
        gerenciadorDescontoGlobal.fromJSON(orcamento.desconto);
        
        if (orcamento.desconto.tipo === 'percentual') {
            document.getElementById('descontoPercentual').value = orcamento.desconto.valor;
            document.querySelector('input[name="tipoDesconto"][value="percentual"]').checked = true;
        } else {
            document.getElementById('descontoFixo').value = orcamento.desconto.valor;
            document.querySelector('input[name="tipoDesconto"][value="fixo"]').checked = true;
        }
        
        document.getElementById('descontoJustificativa').value = orcamento.desconto.justificativa || "";
        toggleDescontoInputs();
        atualizarResumoDesconto();
    }
    
    // Recalcular com o desconto carregado
    calcularTotaisComDesconto();
}
