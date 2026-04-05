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
};

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

function adicionarItem() {
  const dados = calcular();
  if (!dados) return;
  sistema.carrinho.push(dados);
  atualizarListaItens();
}

function atualizarListaItens() {
  const lista = document.getElementById("listaItens");
  lista.innerHTML = "";
  sistema.carrinho.forEach((item, index) => {
    lista.innerHTML += `<div>${item.produto} - ${item.largura}x${item.altura} cm | Qtd: ${item.quantidade} | Total: R$ ${item.total.toFixed(2)}</div>`;
  });
}

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

  let totalGeral = 0;
  orcamento.itens.forEach((item, i) => {
    resumo += `${item.produto} - ${item.largura}x${item.altura} cm | Qtd: ${item.quantidade} | R$ ${item.total.toFixed(2)}\n`;
    totalGeral += item.total;
  });

  resumo += `\nTotal Geral: R$ ${totalGeral.toFixed(2)}`;
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

  atualizarListaOrcamentos();
  alert(`Orçamento Nº ${orcamento.numero} enviado! Status: Aguardando aprovação`);
}

// Criar pedido a partir do orçamento
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

function atualizarListaOrcamentos() {
  const div = document.getElementById("listaOrcamentos");
  div.innerHTML = "";
  sistema.orcamentos.forEach((orc, index) => {
    div.innerHTML += `<div>
      Orçamento Nº ${orc.numero} - ${orc.cliente.nome} | Status: ${orc.status} | Data: ${orc.data} 
      <button onclick="gerarPedido(${orc.numero})">Gerar Pedido</button>
    </div>`;
  });
}

function atualizarListaPedidos() {
  const div = document.getElementById("listaPedidos");
  if (!div) return; // caso não exista a seção de pedidos
  div.innerHTML = "";
  sistema.pedidos.forEach((pedido, index) => {
    div.innerHTML += `<div>Pedido Nº ${pedido.numero} (vinculado ao Orçamento Nº ${pedido.vinculadoOrcamento}) - ${pedido.cliente.nome} | Status: ${pedido.status} | Data: ${pedido.data}</div>`;
  });
}
