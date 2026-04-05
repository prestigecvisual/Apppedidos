// ========================================================
// ESTRUTURA DE DADOS - PRESTIGE COMUNICAÇÃO VISUAL
// ========================================================

const sistema = {
  // Tabela de Preços com diferenciação de cálculo
  produtos: [
    { id: 1, nome: "Adesivo Simples", preco: 10.00, tipo: "m2" },
    { id: 2, nome: "Adesivo Premium", preco: 15.00, tipo: "m2" },
    { id: 3, nome: "Placa PVC 2mm", preco: 20.00, tipo: "m2" },
    { id: 4, nome: "Acrílico 3mm", preco: 30.00, tipo: "m2" },
    { id: 5, nome: "Lona 440g", preco: 45.00, tipo: "m2" },
    { id: 6, nome: "Banner c/ Bastão", preco: 55.00, tipo: "unid" },
    { id: 7, nome: "Cavalete Madeira", preco: 120.00, tipo: "unid" }
  ],
  
  // Listas de Armazenamento
  carrinho: [],
  orcamentos: [],
  pedidos: [],
  
  // Contadores de Sequência
  contadorOrcamento: 1,
  contadorPedido: 1
};

// ========================================================
// FUNÇÕES DE PERSISTÊNCIA (PARA NÃO PERDER OS DADOS AO DAR F5)
// ========================================================

// 1. Salvar tudo o que está no objeto 'sistema' para o navegador
function salvarNoNavegador() {
  const dadosParaSalvar = JSON.stringify(sistema);
  localStorage.setItem('PrestigeAppData', dadosParaSalvar);
}

// 2. Carregar os dados ao abrir o site
function carregarDoNavegador() {
  const dadosSalvos = localStorage.getItem('PrestigeAppData');
  if (dadosSalvos) {
    const dadosConvertidos = JSON.parse(dadosSalvos);
    
    // Atualiza as listas mantendo a estrutura original
    sistema.carrinho = dadosConvertidos.carrinho || [];
    sistema.orcamentos = dadosConvertidos.orcamentos || [];
    sistema.pedidos = dadosConvertidos.pedidos || [];
    sistema.contadorOrcamento = dadosConvertidos.contadorOrcamento || 1;
    sistema.contadorPedido = dadosConvertidos.contadorPedido || 1;
    
    // Opcional: Se quiser que os produtos novos também sejam salvos
    // sistema.produtos = dadosConvertidos.produtos; 
  }
}

// Executa o carregamento assim que o script for lido
carregarDoNavegador();
