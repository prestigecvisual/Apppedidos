// ========================================================
// ESTRUTURA DE DADOS - PRESTIGE COMUNICAÇÃO VISUAL
// ========================================================

const PRODUTOS_PADRAO = [
    { nome: "Adesivo Simples", preco: 120.00, tipo: "m2" },
    { nome: "Adesivo Premium", preco: 150.00, tipo: "m2" },
    { nome: "ACM Adesivado", preco: 280.00, tipo: "m2" },
    { nome: "ACM Corte com Dobra", preco: 350.00, tipo: "m2" },
    { nome: "Placa PVC 2mm", preco: 150.00, tipo: "m2" },
    { nome: "Acrílico 3mm", preco: 350.00, tipo: "m2" },
    { nome: "Chaveiro 5x9 cm Acrílico 3mm", preco: 35.00, tipo: "unid" },
    { nome: "Chaveiro 6x10 cm Acrílico 3mm", preco: 35.00, tipo: "unid" },
    { nome: "Chaveiro 5,5x11 cm Acrílico 3mm", preco: 35.00, tipo: "unid" },
    { nome: "Lona sem Acabamento 440g", preco: 125.00, tipo: "m2" },
    { nome: "Lona com Acabamento 440g", preco: 145.00, tipo: "m2" },
    { nome: "Banner c/ Bastão", preco: 125.00, tipo: "unid" },
    { nome: "Cavalete Madeira", preco: 180.00, tipo: "unid" }
];

const sistema = {
    produtos: [...PRODUTOS_PADRAO],
    clientes: [],
    carrinho: [],
    orcamentos: [],
    pedidos: [],
    contadorOrcamento: 1
};

// ========================================================
// FUNÇÕES DE PERSISTÊNCIA (localStorage)
// ========================================================

function salvarNoNavegador() {
    try {
        localStorage.setItem('sistema', JSON.stringify(sistema));
    } catch (e) {
        console.error("Erro ao salvar dados no navegador:", e);
    }
}

function carregarDoNavegador() {
    const salvos = localStorage.getItem('sistema');
    
    if (salvos) {
        try {
            const dados = JSON.parse(salvos);

            if (dados.produtos && dados.produtos.length > 0) sistema.produtos = dados.produtos;
            sistema.clientes = dados.clientes || [];
            sistema.orcamentos = dados.orcamentos || [];
            sistema.pedidos = dados.pedidos || [];
            sistema.carrinho = dados.carrinho || [];
            sistema.contadorOrcamento = dados.contadorOrcamento || 1;

        } catch (error) {
            console.error("Erro ao carregar dados salvos:", error);
        }
    }
}

// Inicializa o carregamento
carregarDoNavegador();
