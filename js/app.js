// Inicialização do sistema
const sistema = {
  produtos: [
    { nome: "Acrílico 3mm", preco: 50 },
    { nome: "Acrílico 5mm", preco: 80 },
  ],
  carrinho: [],
  orcamentos: [],
  pedidos: [],
  contadorOrcamento: 1,
  contadorPedido: 1
};

// Carrega produtos no select e listas ao abrir a página
window.onload = function () {
  const select = document.getElementById("produto");
  sistema.produtos.forEach((prod, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${prod.nome} - R$ ${prod.preco}`;
    select.appendChild(option);
  });
  atualizarListaOrcamentos();
  atualizarListaPedidos();
  calcularTotais(); // Atualiza totais ao carregar
};

// --------------------- FUNÇÕES DE CÁLCULO ---------------------

// Calcula preço unitário e total do item
function calcular() {
  const produtoIndex = document.getElementById("produto").value;
  const largura = parseFloat(document.getElementById("largura").value);
  const altura = parseFloat(document.getElementById("altura").value);
  const quantidade = parseInt(document.getElementById("quantidade").value);

  if (produtoIndex === "" || !largura || !altura || !quantidade) {
    alert("Preencha todos os campos do produto!");
    return;
  }

  const produto = sistema.produtos[produtoIndex];
  const area = (largura * altura) / 10000;
  const precoUnitario = produto.preco * area * 10;
  const total = precoUnitario * quantidade;

  document.getElementById("resultado").innerHTML =
    `Produto: ${produto.nome} <br>Área: ${area.toFixed(2)} m² <br>Preço unitário: R$ ${precoUnitario.toFixed(2)} <br>Total: R$ ${total.toFixed(2)}`;

  return { produto: produto.nome, largura, altura, quantidade, total };
}

// Função para calcular frete baseado no CEP
function calcularFretePorCEP(cep) {
  cep = cep.replace(/\D/g, "");
  if (!cep || cep.length !== 8) return 0;

  if (cep >= "01000000" && cep <= "19999999") return 15; // SP
  else if (cep >= "20000000" && cep <= "28999999") return 25; // RJ
  else return 40; // resto do Brasil
}

// Calcula totais do carrinho
function calcularTotais() {
  let totalProdutos = 0;
  sistema.carrinho.forEach(item => totalProdutos += item.total);

  const cep = document.getElementById("clienteCEP")?.value || "";
  const frete = calcularFretePorCEP(cep);
  const desconto = totalProdutos > 200 ? totalProdutos * 0.1 : 0;
  const totalGeral = totalProdutos + frete - desconto;

  document.getElementById("frete").textContent = frete.toFixed(2);
  document.getElementById("desconto").textContent = desconto.toFixed(2);
  document.getElementById("totalGeral").textContent = totalGeral.toFixed(2);

  return { frete, desconto, totalGeral };
}

// Recalcula totais quando o CEP muda
document.getElementById("clienteCEP").addEventListener("input", () => {
  calcularTotais();
});

// --------------------- FUNÇÕES DE CARRINHO ---------------------

// Adiciona item ao carrinho
function adicionarItem() {
  const dados = calcular();
  if (!dados) return;
  sistema.carrinho.push(dados);
  atualizarListaItens();
  calcularTotais();
}

// Atualiza lista de itens na tela
function atualizarListaItens() {
  const lista = document.getElementById("listaItens");
  lista.innerHTML = "";
  sistema.carrinho.forEach((item, index) => {
    lista.innerHTML += `<div>${item.produto} - ${item.largura}x${item.altura} cm | Qtd: ${item.quantidade} | Total: R$ ${item.total.toFixed(2)}</div>`;
  });
}

// Adicionar produtos personalizados
function adicionarProdutoPersonalizado() {
  const nome = document.getElementById("novoProdutoNome").value.trim();
  const preco = parseFloat(document.getElementById("novoProdutoPreco").value);

  if (!nome || !preco || preco <= 0) {
    alert("Preencha corretamente o nome e preço do produto!");
    return;
  }

  const novoProduto = { nome, preco };
  sistema.produtos.push(novoProduto);

  const select = document.getElementById("produto");
  const option = document.createElement("option");
  option.value = sistema.produtos.length - 1;
  option.textContent = `${novoProduto.nome} - R$ ${novoProduto.preco}`;
  select.appendChild(option);

  document.getElementById("novoProdutoNome").value = "";
  document.getElementById("novoProdutoPreco").value = "";

  alert(`Produto "${nome}" adicionado! Agora você pode selecioná-lo no orçamento.`);
}

// --------------------- ORÇAMENTO E PEDIDOS ---------------------

// Salvar orçamento e enviar via WhatsApp
function salvarOrcamento() {
  const nome = document.getElementById("clienteNome").value;
  const contato = document.getElementById("clienteContato").value;
  const telefone = document.getElementById("clienteTelefone").value;
  const endereco = document.getElementById("clienteEndereco").value;

  if (!nome || !contato || !telefone || !endereco) {
    alert("Preencha todas as informações do cliente!");
    return;
  }
  if (sistema.carrinho.length === 0) {
    alert("Adicione pelo menos um item ao orçamento!");
    return;
  }

  const numeroOrcamento = sistema.contadorOrcamento++;
  const orcamento = {
    numero: numeroOrcamento,
    cliente: { nome, contato, telefone, endereco },
    itens: [...sistema.carrinho],
    status: "Aguardando aprovação",
    prazo: "Orçamento válido por 10 dias úteis",
    data: new Date().toLocaleDateString()
  };

  sistema.orcamentos.push(orcamento);

  let resumo = `Orçamento Nº ${orcamento.numero} - Prestige Comunicação Visual\n\nCliente: ${nome}\nContato: ${contato}\nTelefone: ${telefone}\nEndereço: ${endereco}\n\n`;

  let totalProdutos = 0;
  orcamento.itens.forEach((item) => {
    resumo += `${item.produto} - ${item.largura}x${item.altura} cm | Qtd: ${item.quantidade} | R$ ${item.total.toFixed(2)}\n`;
    totalProdutos += item.total;
  });

  const totais = calcularTotais();
  resumo += `\nFrete: R$ ${totais.frete.toFixed(2)} | Desconto: R$ ${totais.desconto.toFixed(2)} | Total Geral: R$ ${totais.totalGeral.toFixed(2)}`;
  resumo += `\n${orcamento.prazo}`;

  const numero = "5511922018290";
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(resumo)}`;
  window.open(url, "_blank");

  sistema.carrinho = [];
  atualizarListaItens();
  document.getElementById("resultado").innerHTML = "";
  document.getElementById("clienteNome").value = "";
  document.getElementById("clienteContato").value = "";
  document.getElementById("clienteTelefone").value = "";
  document.getElementById("clienteEndereco").value = "";
  document.getElementById("clienteCEP").value = "";

  atualizarListaOrcamentos();
  atualizarListaPedidos();

  alert(`Orçamento Nº ${orcamento.numero} enviado! Status: Aguardando aprovação`);
}

// Gerar pedido a partir de orçamento
function gerarPedido(orcamentoNumero) {
  const orc = sistema.orcamentos.find(o => o.numero === orcamentoNumero);
  if (!orc) {
    alert("Orçamento não encontrado!");
    return;
  }

  const numeroPedido = sistema.contadorPedido++;
  const pedido = {
    numero: numeroPedido,
    vinculadoOrcamento: orc.numero,
    cliente: orc.cliente,
    itens: [...orc.itens],
    status: "Em produção",
    data: new Date().toLocaleDateString()
  };

  sistema.pedidos.push(pedido);
  alert(`Pedido Nº ${pedido.numero} gerado a partir do Orçamento Nº ${orc.numero}`);
  atualizarListaPedidos();
}

// Atualiza lista de orçamentos
function atualizarListaOrcamentos() {
  const div = document.getElementById("listaOrcamentos");
  div.innerHTML = "";
  sistema.orcamentos.forEach((orc) => {
    div.innerHTML += `<div>
      Orçamento Nº ${orc.numero} - ${orc.cliente.nome} | Status: ${orc.status} | Data: ${orc.data} 
      <button onclick="gerarPedido(${orc.numero})">Gerar Pedido</button>
    </div>`;
  });
}

// Atualiza lista de pedidos
function atualizarListaPedidos() {
  const div = document.getElementById("listaPedidos");
  div.innerHTML = "";
  sistema.pedidos.forEach((pedido) => {
    div.innerHTML += `<div>Pedido Nº ${pedido.numero} (vinculado ao Orçamento Nº ${pedido.vinculadoOrcamento}) - ${pedido.cliente.nome} | Status: ${pedido.status} | Data: ${pedido.data}</div>`;
  });
}

// --------------------- GERAR PDF ---------------------
document.getElementById("gerarPDF").addEventListener("click", () => {
  if (sistema.carrinho.length === 0) {
    alert("Adicione pelo menos um item antes de gerar o PDF!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = 20;

  doc.setFontSize(16);
  doc.text("Orçamento - Prestige Comunicação Visual", 105, y, { align: "center" });
  y += 10;

  const dataAtual = new Date().toLocaleDateString();
  doc.setFontSize(12);
  doc.text(`Data: ${dataAtual}`, 10, y);
  y += 10;

  // Cabeçalho da tabela
  doc.text("Produto", 10, y);
  doc.text("Qtd", 90, y);
  doc.text("Área m²", 120, y);
  doc.text("Total R$", 160, y);
  y += 7;

  sistema.carrinho.forEach(item => {
    const area = ((item.largura * item.altura) / 10000).toFixed(2);
    doc.text(item.produto, 10, y);
    doc.text(item.quantidade.toString(), 90, y);
    doc.text(area, 120, y);
    doc.text(item.total.toFixed(2), 160, y);
    y += 7;
  });

  // Totais
  const totais = calcularTotais();
  y += 10;
  doc.text(`Frete: R$ ${totais.frete.toFixed(2)}`, 10, y);
  y += 7;
  doc.text(`Desconto: R$ ${totais.desconto.toFixed(2)}`, 10, y);
  y += 7;
  doc.setFontSize(14);
  doc.text(`Total Geral: R$ ${totais.totalGeral.toFixed(2)}`, 10, y);

  doc.save(`Orcamento_${Date.now()}.pdf`);
});
