window.onload = function () {
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

  const orcamento = {
    cliente: { nome, contato, telefone, endereco },
    itens: [...sistema.carrinho],
    status: "Aguardando aprovação",
    prazo: "Orçamento válido por 10 dias úteis",
    data: new Date().toLocaleDateString()
  };

  sistema.orcamentos.push(orcamento);

  let resumo = `Orçamento - Prestige Comunicação Visual\n\nCliente: ${nome}\nContato: ${contato}\nTelefone: ${telefone}\nEndereço: ${endereco}\n\n`;

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
  alert("Orçamento enviado! Status: Aguardando aprovação");
}

function atualizarListaOrcamentos() {
  const div = document.getElementById("listaOrcamentos");
  div.innerHTML = "";
  sistema.orcamentos.forEach((orc, index) => {
    div.innerHTML += `<div>${orc.cliente.nome} | Status: ${orc.status} | Data: ${orc.data}</div>`;
  });
}
