// ========================================================
// ESTRUTURA DE DADOS - PRESTIGE COMUNICAÇÃO VISUAL
// ========================================================

const sistema = {
  // Produtos padrão (caso o banco esteja vazio)
  produtos: [
    { nome: "Adesivo Simples", preco: 10.00, tipo: "m2" },
    { nome: "Adesivo Premium", preco: 15.00, tipo: "m2" },
    { nome: "Placa PVC 2mm", preco: 20.00, tipo: "m2" },
    { nome: "Acrílico 3mm", preco: 30.00, tipo: "m2" },
    { nome: "Lona 440g", preco: 45.00, tipo: "m2" },
    { nome: "Banner c/ Bastão", preco: 55.00, tipo: "unid" },
    { nome: "Cavalete Madeira", preco: 120.00, tipo: "unid" }
  ],
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
  localStorage.setItem('PrestigeData', JSON.stringify(sistema));
}

function carregarDoNavegador() {
  const salvos = localStorage.getItem('PrestigeData');
  if (salvos) {
    const dados = JSON.parse(salvos);
    
    // MELHORIA: Se houver produtos salvos no navegador, use-os 
    // Isso permite que novos produtos cadastrados persistam
    if (dados.produtos && dados.produtos.length > 0) {
        sistema.produtos = dados.produtos;
    }

    sistema.clientes = dados.clientes || [];
    sistema.orcamentos = dados.orcamentos || [];
    sistema.pedidos = dados.pedidos || [];
    sistema.contadorOrcamento = dados.contadorOrcamento || 1;
    
    // Opcional: manter carrinho após F5
    // sistema.carrinho = dados.carrinho || [];
  }
}

// Inicializa o carregamento imediatamente
carregarDoNavegador();
