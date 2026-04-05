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

  // atribuir número automático
  const numeroOrcamento = sistema.contadorOrcamento++;

  const orcamento = {
    numero: numeroOrcamento,       // número do orçamento
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

  // Limpar carrinho e campos
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
