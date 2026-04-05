// ========================================================
// ESTRUTURA DE DADOS - PRESTIGE COMUNICAÇÃO VISUAL
// ========================================================

const sistema = {
  // Lista oficial de produtos (sempre priorizada ao iniciar)
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

// Salva o estado atual do sistema no navegador
function salvarNoNavegador() {
  localStorage.setItem('PrestigeData', JSON.stringify(sistema));
}

// Carrega os dados salvos anteriormente
function carregarDoNavegador() {
  const salvos = localStorage.getItem('PrestigeData');
  if (salvos) {
    const dados = JSON.parse(salvos);
    
    // Atualizamos as listas dinâmicas, mas mantemos os produtos do código
    sistema.clientes = dados.clientes || [];
    sistema.orcamentos = dados.orcamentos || [];
    sistema.pedidos = dados.pedidos || [];
    sistema.contadorOrcamento = dados.contadorOrcamento || 1;
    
    // Nota: O carrinho geralmente é limpo ao fechar a página, 
    // mas se quiser manter os itens pendentes, descomente a linha abaixo:
    // sistema.carrinho = dados.carrinho || [];
  }
}

// Inicializa o carregamento
carregarDoNavegador();
