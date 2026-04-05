// ========================================================
// ESTRUTURA DE DADOS - PRESTIGE COMUNICAÇÃO VISUAL
// ========================================================

// Definimos os produtos iniciais separadamente para comparação
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
    produtos: [...PRODUTOS_PADRAO], // Inicia com o padrão
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
        localStorage.setItem('PrestigeData', JSON.stringify(sistema));
    } catch (e) {
        console.error("Erro ao salvar dados no navegador:", e);
    }
}

function carregarDoNavegador() {
    const salvos = localStorage.getItem('PrestigeData');
    
    if (salvos) {
        try {
            const dados = JSON.parse(salvos);
            
            // 1. GESTÃO DE PRODUTOS:
            // Só substitui se os dados salvos tiverem produtos (preserva cadastros novos)
            if (dados.produtos && dados.produtos.length > 0) {
                sistema.produtos = dados.produtos;
            }

            // 2. OUTROS DADOS (Uso de operador OR para evitar valores nulos)
            sistema.clientes = dados.clientes || [];
            sistema.orcamentos = dados.orcamentos || [];
            sistema.pedidos = dados.pedidos || [];
            sistema.contadorOrcamento = dados.contadorOrcamento || 1;
            
            // Opcional: Descomente se quiser que o carrinho não limpe ao dar F5
            // sistema.carrinho = dados.carrinho || [];

        } catch (error) {
            console.error("Erro ao carregar dados salvos:", error);
            // Em caso de erro no JSON, mantém o padrão do objeto 'sistema'
        }
    }
}

// Inicializa o carregamento imediatamente
carregarDoNavegador();
