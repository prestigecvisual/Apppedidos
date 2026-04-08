// ========================================================
// APP.JS - PRESTIGE COMUNICAÇÃO VISUAL (VERSÃO COMPLETA)
// ========================================================

// ===============================
// 🚀 INICIALIZAÇÃO
// ===============================
window.onload = () => { 
    try {
        console.log("Iniciando sistema Prestige...");
        carregarDoNavegador();
        inicializarSistema();
    } catch (erro) {
        console.error("Erro ao iniciar sistema:", erro);
        alert("Erro ao iniciar sistema. Verifique o console para mais detalhes.");
    }
};

function inicializarSistema() {
    // Popular produtos no select
    popularProdutos();
    
    // Configurar eventos
    configurarEventos();
    
    // Atualizar interfaces
    atualizarCarrinho();
    atualizarListaOrcamentos();
    atualizarListaPedidos();
    calcularTotais();
    atualizarPreviewDANFE();
    atualizarDashboard();
    
    // Gerar número inicial do orçamento
    gerarNumeroOrcamento();
    
    console.log("Sistema inicializado com sucesso!");
}

function configurarEventos() {
    // Evento para recalcular preview quando medidas mudarem
    const largura = document.getElementById('largura');
    const altura = document.getElementById('altura');
    const quantidade = document.getElementById('quantidade');
    
    if (largura) largura.addEventListener('input', () => calcularPreview());
    if (altura) altura.addEventListener('input', () => calcularPreview());
    if (quantidade) quantidade.addEventListener('input', () => calcularPreview());
}

// ===============================
// 📅 Utilitários
// ===============================
function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function dataHoje() {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function dataHojeISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function gerarNumeroOrcamento() {
    if (!sistema.contadorOrcamento) sistema.contadorOrcamento = 1;
    
    const ano = new Date().getFullYear();
    const sequencial = String(sistema.contadorOrcamento).padStart(4, '0');
    const numero = `ORC-${ano}-${sequencial}`;
    
    const elemento = document.getElementById('numeroOrcamento');
    if (elemento) elemento.innerText = numero;
    
    return numero;
}

function gerarNumeroPedido() {
    if (!sistema.contadorPedido) sistema.contadorPedido = 1;
    
    const ano = new Date().getFullYear();
    const sequencial = String(sistema.contadorPedido).padStart(4, '0');
    const numero = `PED-${ano}-${sequencial}`;
    
    sistema.contadorPedido++;
    return numero;
}

// ===============================
// 📊 DASHBOARD
// ===============================
function atualizarDashboard() {
    const totalOrc = document.getElementById('totalOrcamentos');
    const totalPed = document.getElementById('totalPedidos');
    const faturamento = document.getElementById('totalFaturamento');
    
    if (totalOrc) totalOrc.innerText = sistema.orcamentos?.length || 0;
    if (totalPed) totalPed.innerText = sistema.pedidos?.length || 0;
    
    let total = 0;
    if (sistema.pedidos) {
        sistema.pedidos.forEach(p => {
            total += p.total || 0;
        });
    }
    if (faturamento) faturamento.innerText = formatarMoeda(total);
}

// ===============================
// 👤 CLIENTE
// ===============================
function copiarTelefoneWhatsApp() {
    const telefone = document.getElementById('clienteTelefone')?.value || '';
    const whatsApp = document.getElementById('clienteWhatsApp');
    if (whatsApp && telefone && !whatsApp.value) {
        whatsApp.value = telefone;
    }
}

function limparCliente() {
    const campos = ['clienteNome', 'clienteDoc', 'clienteTelefone', 'clienteWhatsApp', 
                    'clienteEmail', 'clienteCEP', 'clienteEndereco', 'clienteNumero', 
                    'clienteBairro', 'clienteCidade', 'clienteEstado'];
    
    campos.forEach(campo => {
        const el = document.getElementById(campo);
        if (el) el.value = '';
    });
    
    // Resetar email padrão da empresa
    const emailEmpresa = document.getElementById('clienteEmail');
    if (emailEmpresa) emailEmpresa.value = 'prestigecvisual@gmail.com';
}

async function buscarCEP() {
    const cepInput = document.getElementById('clienteCEP');
    let cep = cepInput?.value || '';
    cep = cep.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        alert('Digite um CEP válido com 8 dígitos');
        return;
    }
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (data.erro) {
            alert('CEP não encontrado');
            return;
        }
        
        const endereco = document.getElementById('clienteEndereco');
        const bairro = document.getElementById('clienteBairro');
        const cidade = document.getElementById('clienteCidade');
        const estado = document.getElementById('clienteEstado');
        
        if (endereco) endereco.value = data.logradouro || '';
        if (bairro) bairro.value = data.bairro || '';
        if (cidade) cidade.value = data.localidade || '';
        if (estado) estado.value = data.uf || '';
        
        // Calcular frete automaticamente
        calcularFretePorCEP(cep);
        
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        alert('Erro ao buscar CEP. Tente novamente.');
    }
}

function calcularFretePorCEP(cep) {
    let frete = 0;
    
    // Regras de frete
    if (cep.startsWith('010') || cep.startsWith('011') || cep.startsWith('012') || 
        cep.startsWith('013') || cep.startsWith('014') || cep.startsWith('015')) {
        frete = 0; // Centro de SP
    } else if (cep.startsWith('09') || cep.startsWith('08')) {
        frete = 15; // Grande SP
    } else {
        frete = 25; // Interior/Outros
    }
    
    const freteElement = document.getElementById('frete');
    if (freteElement) freteElement.innerText = formatarMoeda(frete);
    
    calcularTotais();
    return frete;
}

// ===============================
// 📦 PRODUTOS
// ===============================
function popularProdutos() {
    const select = document.getElementById('produto');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Selecione um produto --</option>';
    
    if (!sistema.produtos || sistema.produtos.length === 0) {
        select.innerHTML += '<option value="" disabled>Nenhum produto cadastrado</option>';
        return;
    }
    
    sistema.produtos.forEach((produto, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${produto.nome} - ${formatarMoeda(produto.preco)}/${produto.tipo === 'm2' ? 'm²' : 'un'}`;
        select.appendChild(option);
    });
}

function selecionarProduto() {
    toggleMedidas();
    calcularPreview();
}

function toggleMedidas() {
    const select = document.getElementById('produto');
    const selectedIndex = parseInt(select?.value);
    const medidasDiv = document.getElementById('medidasInput');
    
    if (!medidasDiv) return;
    
    if (selectedIndex >= 0 && sistema.produtos[selectedIndex]?.tipo === 'm2') {
        medidasDiv.style.display = 'grid';
    } else {
        medidasDiv.style.display = 'none';
    }
}

function calcularPreview() {
    const select = document.getElementById('produto');
    const selectedIndex = parseInt(select?.value);
    const previewDiv = document.getElementById('previewCalculo');
    
    if (!previewDiv || isNaN(selectedIndex) || selectedIndex < 0) {
        if (previewDiv) previewDiv.innerHTML = '';
        return;
    }
    
    const produto = sistema.produtos[selectedIndex];
    if (!produto) return;
    
    let quantidade = parseFloat(document.getElementById('quantidade')?.value) || 1;
    let valorUnitario = produto.preco;
    let area = 1;
    let medidaTexto = '';
    
    if (produto.tipo === 'm2') {
        const largura = parseFloat(document.getElementById('largura')?.value) || 0;
        const altura = parseFloat(document.getElementById('altura')?.value) || 0;
        area = (largura * altura) / 10000;
        
        if (area <= 0) {
            previewDiv.innerHTML = '<span style="color: #ef4444;">⚠️ Informe largura e altura válidas</span>';
            return;
        }
        
        valorUnitario = produto.preco * area;
        medidaTexto = ` (${largura}x${altura}cm = ${area.toFixed(2)}m²)`;
    }
    
    const total = valorUnitario * quantidade;
    
    previewDiv.innerHTML = `
        <strong>📊 Prévia do produto:</strong><br>
        ${produto.nome}${medidaTexto}<br>
        Valor unitário: ${formatarMoeda(valorUnitario)}<br>
        Quantidade: ${quantidade}<br>
        <strong style="color: #10b981;">TOTAL: ${formatarMoeda(total)}</strong>
    `;
}

function cadastrarNovoProduto() {
    const nome = document.getElementById('novoProdNome')?.value?.trim();
    const preco = parseFloat(document.getElementById('novoProdPreco')?.value);
    const tipo = document.getElementById('novoProdTipo')?.value;
    
    if (!nome) {
        alert('Informe o nome do produto');
        return;
    }
    
    if (!preco || preco <= 0) {
        alert('Informe um preço válido');
        return;
    }
    
    sistema.produtos.push({ nome, preco, tipo });
    salvarNoNavegador();
    popularProdutos();
    
    // Limpar campos
    document.getElementById('novoProdNome').value = '';
    document.getElementById('novoProdPreco').value = '';
    
    alert(`✅ Produto "${nome}" cadastrado com sucesso!`);
}

// ===============================
// 🛒 CARRINHO
// ===============================
function adicionarItem() {
    const select = document.getElementById('produto');
    const selectedIndex = parseInt(select?.value);
    
    if (isNaN(selectedIndex) || selectedIndex < 0) {
        alert('Selecione um produto');
        return;
    }
    
    const produto = sistema.produtos[selectedIndex];
    let quantidade = parseFloat(document.getElementById('quantidade')?.value) || 1;
    let largura = parseFloat(document.getElementById('largura')?.value) || 0;
    let altura = parseFloat(document.getElementById('altura')?.value) || 0;
    let medida = '--';
    let valorUnitario = produto.preco;
    
    if (produto.tipo === 'm2') {
        if (largura <= 0 || altura <= 0) {
            alert('Informe largura e altura válidas');
            return;
        }
        const area = (largura * altura) / 10000;
        valorUnitario = produto.preco * area;
        medida = `${largura}x${altura}cm (${area.toFixed(2)}m²)`;
    }
    
    const total = valorUnitario * quantidade;
    
    const item = {
        id: Date.now(),
        nome: produto.nome,
        qtd: quantidade,
        medida: medida,
        valorUnitario: valorUnitario,
        total: total,
        tipo: produto.tipo,
        largura: largura,
        altura: altura
    };
    
    if (!sistema.carrinho) sistema.carrinho = [];
    sistema.carrinho.push(item);
    
    salvarNoNavegador();
    atualizarCarrinho();
    calcularTotais();
    atualizarPreviewDANFE();
    
    // Limpar campos após adicionar
    document.getElementById('quantidade').value = '1';
    if (produto.tipo === 'm2') {
        document.getElementById('largura').value = '';
        document.getElementById('altura').value = '';
    }
    select.value = '';
    document.getElementById('medidasInput').style.display = 'none';
    document.getElementById('previewCalculo').innerHTML = '';
    
    // Feedback visual
    const btn = event?.target;
    if (btn) {
        btn.textContent = '✓ Adicionado!';
        setTimeout(() => { btn.textContent = '➕ Adicionar ao Carrinho'; }, 1000);
    }
}

function atualizarCarrinho() {
    const container = document.getElementById('listaItens');
    if (!container) return;
    
    if (!sistema.carrinho || sistema.carrinho.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhum item adicionado</p>';
        return;
    }
    
    container.innerHTML = '';
    
    sistema.carrinho.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-info">
                <strong>${item.nome}</strong>
                ${item.medida !== '--' ? `<small>${item.medida}</small><br>` : ''}
                <span>Qtd: ${item.qtd} | Unit: ${formatarMoeda(item.valorUnitario)} | Total: ${formatarMoeda(item.total)}</span>
            </div>
            <div class="item-actions">
                <button onclick="editarItemCarrinho(${index})" class="btn-small" style="background:#f59e0b;">✏️</button>
                <button onclick="removerItemCarrinho(${index})" class="btn-small" style="background:#ef4444;">🗑️</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function removerItemCarrinho(index) {
    sistema.carrinho.splice(index, 1);
    salvarNoNavegador();
    atualizarCarrinho();
    calcularTotais();
    atualizarPreviewDANFE();
}

function editarItemCarrinho(index) {
    const item = sistema.carrinho[index];
    if (!item) return;
    
    const novaQtd = prompt('Nova quantidade:', item.qtd);
    if (novaQtd && !isNaN(novaQtd) && parseFloat(novaQtd) > 0) {
        item.qtd = parseFloat(novaQtd);
        item.total = item.valorUnitario * item.qtd;
        salvarNoNavegador();
        atualizarCarrinho();
        calcularTotais();
        atualizarPreviewDANFE();
    }
}

// ===============================
// 💰 TOTAIS E FRETE
// ===============================
function calcularTotais() {
    if (!sistema.carrinho) sistema.carrinho = [];
    
    let subtotal = sistema.carrinho.reduce((sum, item) => sum + (item.total || 0), 0);
    
    // Obter frete do elemento (já calculado pelo CEP)
    const freteElement = document.getElementById('frete');
    let frete = 0;
    if (freteElement) {
        const freteTexto = freteElement.innerText.replace('R$', '').replace('.', '').replace(',', '.').trim();
        frete = parseFloat(freteTexto) || 0;
    }
    
    const formaPagamento = document.getElementById('formaPagamento')?.value;
    let desconto = 0;
    let acrescimo = 0;
    
    switch(formaPagamento) {
        case 'pix':
            desconto = 0; // PIX sem desconto
            break;
        case 'debito':
            desconto = 0;
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
            desconto = 0;
            acrescimo = 0;
    }
    
    const total = subtotal + frete + acrescimo - desconto;
    
    const subtotalElement = document.getElementById('subtotal');
    const descontoElement = document.getElementById('desconto');
    const totalElement = document.getElementById('totalGeral');
    const danfeTotalElement = document.getElementById('danfeTotalGeral');
    
    if (subtotalElement) subtotalElement.innerText = formatarMoeda(subtotal);
    if (descontoElement) descontoElement.innerText = formatarMoeda(acrescimo - desconto);
    if (totalElement) totalElement.innerText = formatarMoeda(total);
    if (danfeTotalElement) danfeTotalElement.innerText = formatarMoeda(total);
    
    return { subtotal, total, acrescimo, desconto };
}

// ===============================
// 🏷️ DANFE PREVIEW
// ===============================
function atualizarPreviewDANFE() {
    const cabecalho = document.getElementById('danfeCabecalho');
    const corpo = document.getElementById('danfeCorpo');
    
    if (!cabecalho || !corpo) return;
    
    // Cabeçalho
    cabecalho.innerHTML = `
        <p><strong>ORÇAMENTO Nº:</strong> ${document.getElementById('numeroOrcamento')?.innerText || '------'}</p>
        <p><strong>Data:</strong> ${dataHoje()}</p>
        <p><strong>Cliente:</strong> ${document.getElementById('clienteNome')?.value || '---'}</p>
        <p><strong>E-mail:</strong> ${document.getElementById('clienteEmail')?.value || 'prestigecvisual@gmail.com'}</p>
        <p><strong>Endereço:</strong> ${document.getElementById('clienteEndereco')?.value || ''}, ${document.getElementById('clienteNumero')?.value || ''}</p>
        <p><strong>Bairro:</strong> ${document.getElementById('clienteBairro')?.value || ''}</p>
        <p><strong>Cidade/UF:</strong> ${document.getElementById('clienteCidade')?.value || ''} / ${document.getElementById('clienteEstado')?.value || ''}</p>
        <p><strong>CEP:</strong> ${document.getElementById('clienteCEP')?.value || ''}</p>
    `;
    
    // Corpo da tabela
    if (!sistema.carrinho || sistema.carrinho.length === 0) {
        corpo.innerHTML = '<tr><td colspan="5" class="empty-table">Nenhum item adicionado</td></tr>';
        return;
    }
    
    corpo.innerHTML = '';
    
    sistema.carrinho.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.nome}</td>
            <td style="text-align:center">${item.qtd}</td>
            <td>${item.medida || '-'}</td>
            <td>${formatarMoeda(item.valorUnitario)}</td>
            <td>${formatarMoeda(item.total)}</td>
        `;
        corpo.appendChild(row);
    });
}

// ===============================
// 📄 ORÇAMENTOS
// ===============================
function salvarOrcamento() {
    if (!sistema.carrinho || sistema.carrinho.length === 0) {
        alert('Adicione itens ao carrinho antes de salvar');
        return;
    }
    
    const clienteNome = document.getElementById('clienteNome')?.value;
    if (!clienteNome) {
        alert('Informe o nome do cliente');
        return;
    }
    
    const numero = gerarNumeroOrcamento();
    const total = parseFloat(document.getElementById('totalGeral')?.innerText.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 0;
    
    const orcamento = {
        numero: numero,
        dataCriacao: dataHoje(),
        dataCriacaoISO: dataHojeISO(),
        clienteNome: clienteNome,
        clienteDoc: document.getElementById('clienteDoc')?.value || '',
        clienteTelefone: document.getElementById('clienteTelefone')?.value || '',
        clienteWhatsApp: document.getElementById('clienteWhatsApp')?.value || '',
        clienteEmail: document.getElementById('clienteEmail')?.value || 'prestigecvisual@gmail.com',
        clienteCEP: document.getElementById('clienteCEP')?.value || '',
        clienteEndereco: document.getElementById('clienteEndereco')?.value || '',
        clienteNumero: document.getElementById('clienteNumero')?.value || '',
        clienteBairro: document.getElementById('clienteBairro')?.value || '',
        clienteCidade: document.getElementById('clienteCidade')?.value || '',
        clienteEstado: document.getElementById('clienteEstado')?.value || '',
        carrinho: JSON.parse(JSON.stringify(sistema.carrinho)),
        total: total,
        formaPagamento: document.getElementById('formaPagamento')?.value || '',
        status: 'Pendente'
    };
    
    if (!sistema.orcamentos) sistema.orcamentos = [];
    sistema.orcamentos.push(orcamento);
    sistema.contadorOrcamento++;
    
    salvarNoNavegador();
    
    // Limpar carrinho após salvar
    sistema.carrinho = [];
    atualizarCarrinho();
    calcularTotais();
    atualizarPreviewDANFE();
    atualizarListaOrcamentos();
    atualizarDashboard();
    
    alert(`✅ Orçamento ${numero} salvo com sucesso!`);
    
    // Perguntar se quer enviar por email
    if (orcamento.clienteEmail && orcamento.clienteEmail !== 'prestigecvisual@gmail.com') {
        if (confirm('Deseja enviar este orçamento por e-mail para o cliente?')) {
            enviarOrcamentoPorEmail();
        }
    }
}

function atualizarListaOrcamentos() {
    const container = document.getElementById('listaOrcamentos');
    if (!container) return;
    
    if (!sistema.orcamentos || sistema.orcamentos.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhum orçamento cadastrado</p>';
        return;
    }
    
    container.innerHTML = '';
    
    sistema.orcamentos.forEach((orc) => {
        const card = document.createElement('div');
        card.className = 'pedido-card';
        
        card.innerHTML = `
            <div class="cliente">👤 ${orc.clienteNome || 'Cliente não informado'}</div>
            <div class="numero">📄 ${orc.numero}</div>
            <div>💰 ${formatarMoeda(orc.total)}</div>
            <div>📅 ${orc.dataCriacao}</div>
            <div class="status status-${orc.status === 'Aprovado' ? 'aprovado' : 'pendente'}">${orc.status || 'Pendente'}</div>
            <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
                <button onclick="aprovarOrcamentoPorNumero('${orc.numero}')" class="btn-small" style="background:#10b981; color:white;">✅ Aprovar</button>
                <button onclick="excluirOrcamentoPorNumero('${orc.numero}')" class="btn-small" style="background:#ef4444; color:white;">🗑 Excluir</button>
                <button onclick="visualizarOrcamentoDetalhes('${orc.numero}')" class="btn-small" style="background:#3b82f6; color:white;">👁 Detalhes</button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function aprovarOrcamentoPorNumero(numero) {
    const index = sistema.orcamentos.findIndex(o => o.numero === numero);
    if (index === -1) return;
    
    const orc = sistema.orcamentos[index];
    
    const pedido = {
        numero: gerarNumeroPedido(),
        numeroOrcamento: orc.numero,
        clienteNome: orc.clienteNome,
        clienteDoc: orc.clienteDoc,
        clienteTelefone: orc.clienteTelefone,
        clienteWhatsApp: orc.clienteWhatsApp,
        clienteEmail: orc.clienteEmail,
        clienteCEP: orc.clienteCEP,
        clienteEndereco: orc.clienteEndereco,
        clienteNumero: orc.clienteNumero,
        clienteBairro: orc.clienteBairro,
        clienteCidade: orc.clienteCidade,
        clienteEstado: orc.clienteEstado,
        carrinho: orc.carrinho,
        total: orc.total,
        formaPagamento: orc.formaPagamento,
        status: 'producao',
        dataCriacao: dataHoje(),
        dataCriacaoISO: dataHojeISO(),
        dataAprovacao: dataHoje()
    };
    
    if (!sistema.pedidos) sistema.pedidos = [];
    sistema.pedidos.push(pedido);
    sistema.orcamentos.splice(index, 1);
    
    salvarNoNavegador();
    atualizarListaOrcamentos();
    atualizarListaPedidos();
    atualizarDashboard();
    
    alert(`✅ Orçamento aprovado! Pedido ${pedido.numero} criado.`);
    
    // Enviar notificação por email
    if (pedido.clienteEmail && pedido.clienteEmail !== 'prestigecvisual@gmail.com') {
        if (confirm('Deseja notificar o cliente por e-mail sobre a aprovação?')) {
            enviarNotificacaoAprovacao(pedido);
        }
    }
}

function excluirOrcamentoPorNumero(numero) {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return;
    
    const index = sistema.orcamentos.findIndex(o => o.numero === numero);
    if (index !== -1) {
        sistema.orcamentos.splice(index, 1);
        salvarNoNavegador();
        atualizarListaOrcamentos();
        atualizarDashboard();
        alert('Orçamento excluído!');
    }
}

function visualizarOrcamentoDetalhes(numero) {
    const orc = sistema.orcamentos.find(o => o.numero === numero);
    if (!orc) return;
    
    let itensTexto = '';
    orc.carrinho.forEach(item => {
        itensTexto += `\n   - ${item.nome}: ${item.qtd}x ${formatarMoeda(item.valorUnitario)} = ${formatarMoeda(item.total)}`;
    });
    
    alert(`📄 ORÇAMENTO ${orc.numero}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cliente: ${orc.clienteNome}
Data: ${orc.dataCriacao}
Status: ${orc.status}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITENS:
${itensTexto}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: ${formatarMoeda(orc.total)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Forma de Pagamento: ${orc.formaPagamento || 'Não selecionada'}`);
}

// ===============================
// 🏭 PEDIDOS (KANBAN)
// ===============================
function atualizarListaPedidos() {
    renderKanban();
}

function renderKanban() {
    const colunas = ['producao', 'andamento', 'finalizado', 'entregue'];
    
    colunas.forEach(col => {
        const elemento = document.getElementById(`col-${col}`);
        if (elemento) elemento.innerHTML = '';
    });
    
    if (!sistema.pedidos || sistema.pedidos.length === 0) {
        colunas.forEach(col => {
            const elemento = document.getElementById(`col-${col}`);
            if (elemento) elemento.innerHTML = '<p class="empty-message">Nenhum pedido</p>';
        });
        return;
    }
    
    sistema.pedidos.forEach((pedido, index) => {
        const card = document.createElement('div');
        card.className = 'pedido-card';
        
        // Calcular atraso
        let isAtrasado = false;
        let diasAtraso = 0;
        
        if (pedido.dataCriacaoISO && (pedido.status === 'producao' || pedido.status === 'andamento')) {
            const dataPedido = new Date(pedido.dataCriacaoISO);
            const hoje = new Date();
            const diffDias = Math.floor((hoje - dataPedido) / (1000 * 60 * 60 * 24));
            isAtrasado = diffDias > 7;
            diasAtraso = diffDias;
        }
        
        if (isAtrasado) {
            card.classList.add('atrasado');
        }
        
        card.innerHTML = `
            <div class="cliente">👤 ${pedido.clienteNome || 'Cliente'}</div>
            <div class="numero">🏭 ${pedido.numero}</div>
            <div>💰 ${formatarMoeda(pedido.total)}</div>
            <div>📅 Criação: ${pedido.dataCriacao}</div>
            ${isAtrasado ? `<div class="status status-atrasado">⚠️ ATRASADO (${diasAtraso} dias)</div>` : ''}
            <div style="margin-top: 8px; display: flex; gap: 4px; flex-wrap: wrap;">
                <button onclick="mudarStatusPedido(${index}, 'producao')" class="btn-small" style="background:#f59e0b;">🟡 Prod</button>
                <button onclick="mudarStatusPedido(${index}, 'andamento')" class="btn-small" style="background:#3b82f6;">🔵 Andam</button>
                <button onclick="mudarStatusPedido(${index}, 'finalizado')" class="btn-small" style="background:#10b981;">🟢 Final</button>
                <button onclick="mudarStatusPedido(${index}, 'entregue')" class="btn-small" style="background:#6366f1;">⚫ Entre</button>
                <button onclick="excluirPedidoPorIndex(${index})" class="btn-small" style="background:#ef4444;">🗑</button>
            </div>
        `;
        
        const coluna = document.getElementById(`col-${pedido.status}`);
        if (coluna) coluna.appendChild(card);
    });
}

function mudarStatusPedido(index, novoStatus) {
    if (!sistema.pedidos[index]) return;
    
    const statusAnterior = sistema.pedidos[index].status;
    sistema.pedidos[index].status = novoStatus;
    sistema.pedidos[index].dataAtualizacao = dataHoje();
    
    salvarNoNavegador();
    renderKanban();
    atualizarDashboard();
    
    alert(`✅ Pedido ${sistema.pedidos[index].numero} atualizado para: ${novoStatus}`);
    
    // Notificar cliente por email
    const pedido = sistema.pedidos[index];
    if (pedido.clienteEmail && pedido.clienteEmail !== 'prestigecvisual@gmail.com') {
        enviarNotificacaoStatus(pedido);
    }
}

function excluirPedidoPorIndex(index) {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;
    
    sistema.pedidos.splice(index, 1);
    salvarNoNavegador();
    renderKanban();
    atualizarDashboard();
    alert('Pedido excluído!');
}

// ===============================
// 📧 ENVIO DE EMAILS
// ===============================
const BACKEND_URL = 'http://localhost:3000';

async function enviarOrcamentoPorEmail() {
    const emailCliente = document.getElementById('clienteEmail')?.value;
    
    if (!emailCliente) {
        alert('⚠️ Informe o e-mail do cliente');
        return false;
    }
    
    if (emailCliente === 'prestigecvisual@gmail.com') {
        if (!confirm('Este e-mail é da empresa. Deseja enviar mesmo assim?')) {
            return false;
        }
    }
    
    if (!sistema.carrinho || sistema.carrinho.length === 0) {
        alert('⚠️ Adicione itens ao carrinho primeiro');
        return false;
    }
    
    const dados = {
        numero: document.getElementById('numeroOrcamento')?.innerText || '------',
        clienteNome: document.getElementById('clienteNome')?.value || 'Cliente',
        data: dataHoje(),
        total: parseFloat(document.getElementById('totalGeral')?.innerText.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 0,
        itens: sistema.carrinho,
        status: 'Aguardando aprovação'
    };
    
    try {
        // Tentar enviar via backend
        const response = await fetch(`${BACKEND_URL}/api/enviar-orcamento`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                destinatario: emailCliente,
                dados: dados
            })
        });
        
        if (response.ok) {
            alert(`✅ Orçamento enviado para ${emailCliente}`);
            return true;
        } else {
            throw new Error('Erro no backend');
        }
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        // Fallback: abrir cliente de email
        const assunto = `Prestige - Seu Orçamento nº ${dados.numero}`;
        const corpo = `Olá ${dados.clienteNome},\n\nSegue seu orçamento da Prestige Comunicação Visual.\n\nTotal: ${formatarMoeda(dados.total)}\n\nAtenciosamente,\nPrestige Comunicação Visual`;
        window.open(`mailto:${emailCliente}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`);
        alert(`📧 Abrindo cliente de e-mail para enviar para ${emailCliente}`);
        return true;
    }
}

async function enviarNotificacaoAprovacao(pedido) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/enviar-pedido`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                destinatario: pedido.clienteEmail,
                dados: pedido
            })
        });
        
        if (response.ok) {
            console.log(`Notificação enviada para ${pedido.clienteEmail}`);
        }
    } catch (error) {
        console.error('Erro ao enviar notificação:', error);
        // Fallback
        const assunto = `Prestige - Seu Pedido nº ${pedido.numero} foi aprovado`;
        const corpo = `Olá ${pedido.clienteNome},\n\nSeu pedido foi aprovado e entrou em produção!\n\nNº do pedido: ${pedido.numero}\nValor total: ${formatarMoeda(pedido.total)}\n\nAtenciosamente,\nPrestige Comunicação Visual`;
        window.open(`mailto:${pedido.clienteEmail}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`);
    }
}

async function enviarNotificacaoStatus(pedido) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/enviar-pedido`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                destinatario: pedido.clienteEmail,
                dados: pedido
            })
        });
        
        if (!response.ok) {
            throw new Error('Erro no backend');
        }
    } catch (error) {
        console.error('Erro ao enviar notificação de status:', error);
        // Fallback silencioso
    }
}

// ===============================
// 📱 WHATSAPP
// ===============================
function enviarWhatsApp() {
    const whatsappCliente = document.getElementById('clienteWhatsApp')?.value?.replace(/\D/g, '');
    
    if (!whatsappCliente) {
        alert('Informe o WhatsApp do cliente');
        return;
    }
    
    if (sistema.carrinho.length === 0) {
        alert('Adicione itens ao carrinho primeiro');
        return;
    }
    
    const clienteNome = document.getElementById('clienteNome')?.value || 'cliente';
    const total = document.getElementById('totalGeral')?.innerText || 'R$ 0,00';
    
    let mensagem = `*PRESTIGE COMUNICAÇÃO VISUAL*\n\n`;
    mensagem += `Olá ${clienteNome}!\n`;
    mensagem += `Segue seu orçamento:\n\n`;
    mensagem += `*ITENS:*\n`;
    
    sistema.carrinho.forEach(item => {
        mensagem += `\n📦 ${item.nome}\n`;
        if (item.medida !== '--') mensagem += `   Medida: ${item.medida}\n`;
        mensagem += `   Quantidade: ${item.qtd}\n`;
        mensagem += `   Valor: ${formatarMoeda(item.valorUnitario)}\n`;
        mensagem += `   Subtotal: ${formatarMoeda(item.total)}\n`;
    });
    
    mensagem += `\n*TOTAL: ${total}*\n\n`;
    mensagem += `Prazo do orçamento: 7 dias úteis\n`;
    mensagem += `Rua Brasil, 304 - Rudge Ramos - SBC - SP\n`;
    mensagem += `(11) 92201-8290\n\n`;
    mensagem += `Deus Seja Sempre Louvado! 🙏`;
    
    const url = `https://wa.me/55${whatsappCliente}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

// ===============================
// 📄 PDF
// ===============================
async function gerarPDFOrcamento() {
    if (!sistema.carrinho || sistema.carrinho.length === 0) {
        alert('Adicione itens ao carrinho primeiro');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    let y = 10;
    
    // CABEÇALHO
    doc.setFontSize(14);
    doc.text("Prestige Comunicação Visual", 10, y);
    y += 6;
    doc.setFontSize(9);
    doc.text("Rua Brasil, 304 - Rudge Ramos - São Bernardo do Campo - SP", 10, y);
    y += 4;
    doc.text("CNPJ: 00.000.000/0001-00 | (11) 92201-8290", 10, y);
    y += 10;
    
    // TÍTULO
    doc.setFontSize(12);
    doc.text("ORÇAMENTO", 10, y);
    y += 6;
    
    // DADOS DO CLIENTE
    doc.setFontSize(9);
    doc.text(`Cliente: ${document.getElementById('clienteNome')?.value || 'Não informado'}`, 10, y);
    y += 5;
    doc.text(`E-mail: ${document.getElementById('clienteEmail')?.value || 'prestigecvisual@gmail.com'}`, 10, y);
    y += 5;
    doc.text(`WhatsApp: ${document.getElementById('clienteWhatsApp')?.value || 'Não informado'}`, 10, y);
    y += 5;
    doc.text(`Endereço: ${document.getElementById('clienteEndereco')?.value || ''}, ${document.getElementById('clienteNumero')?.value || ''}`, 10, y);
    y += 10;
    
    // TABELA
    doc.setFontSize(9);
    doc.text("Descrição", 10, y);
    doc.text("Qtd", 100, y);
    doc.text("Valor Unit.", 130, y);
    doc.text("Total", 170, y);
    y += 4;
    doc.line(10, y, 200, y);
    y += 4;
    
    let totalGeral = 0;
    
    for (const item of sistema.carrinho) {
        if (y > 260) {
            doc.addPage();
            y = 10;
        }
        
        totalGeral += item.total;
        doc.text(item.nome.substring(0, 35), 10, y);
        doc.text(String(item.qtd), 100, y);
        doc.text(formatarMoeda(item.valorUnitario), 130, y);
        doc.text(formatarMoeda(item.total), 170, y);
        y += 6;
    }
    
    doc.line(10, y, 200, y);
    y += 5;
    
    // TOTAL
    doc.setFontSize(11);
    doc.text(`TOTAL GERAL: ${formatarMoeda(totalGeral)}`, 170, y, { align: "right" });
    y += 15;
    
    // FORMA DE PAGAMENTO
    const formaPagSelect = document.getElementById('formaPagamento');
    const formaTexto = formaPagSelect?.options[formaPagSelect.selectedIndex]?.text || 'Não selecionada';
    doc.setFontSize(9);
    doc.text(`Forma de Pagamento: ${formaTexto}`, 10, y);
    y += 10;
    
    // OBSERVAÇÕES
    doc.setFontSize(8);
    doc.text("Prazo do orçamento: 7 dias úteis", 10, y);
    y += 6;
    doc.text("Este orçamento é válido por 7 dias após a data de emissão.", 10, y);
    y += 10;
    
    // FRASE FINAL
    doc.setFontSize(9);
    doc.text("Deus Seja Sempre Louvado! Tudo posso Naquele que me Fortalece!", 105, y, { align: "center" });
    
    // SALVAR
    doc.save(`orcamento_${dataHoje().replace(/\//g, '-')}.pdf`);
}

// ===============================
// 🔧 FUNÇÕES AUXILIARES GLOBAIS
// ===============================
window.adicionarItem = adicionarItem;
window.removerItemCarrinho = removerItemCarrinho;
window.editarItemCarrinho = editarItemCarrinho;
window.calcularTotais = calcularTotais;
window.salvarOrcamento = salvarOrcamento;
window.enviarWhatsApp = enviarWhatsApp;
window.buscarCEP = buscarCEP;
window.toggleMedidas = toggleMedidas;
window.calcularPreview = calcularPreview;
window.cadastrarNovoProduto = cadastrarNovoProduto;
window.popularProdutos = popularProdutos;
window.selecionarProduto = selecionarProduto;
window.copiarTelefoneWhatsApp = copiarTelefoneWhatsApp;
window.limparCliente = limparCliente;
window.gerarPDFOrcamento = gerarPDFOrcamento;
window.enviarOrcamentoPorEmail = enviarOrcamentoPorEmail;
window.aprovarOrcamentoPorNumero = aprovarOrcamentoPorNumero;
window.excluirOrcamentoPorNumero = excluirOrcamentoPorNumero;
window.visualizarOrcamentoDetalhes = visualizarOrcamentoDetalhes;
window.mudarStatusPedido = mudarStatusPedido;
window.excluirPedidoPorIndex = excluirPedidoPorIndex;
window.atualizarListaOrcamentos = atualizarListaOrcamentos;
window.atualizarListaPedidos = atualizarListaPedidos;
