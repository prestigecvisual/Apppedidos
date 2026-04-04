function calcular() {
  const largura = parseFloat(document.getElementById("largura").value);
  const altura = parseFloat(document.getElementById("altura").value);
  const quantidade = parseInt(document.getElementById("quantidade").value);

  if (!largura || !altura || !quantidade) {
    alert("Preencha todos os campos!");
    return;
  }

  const area = (largura * altura) / 10000; // cm² para m²
  const precoUnitario = sistema.precoBase + (area * sistema.multiplicador * 100);
  const total = precoUnitario * quantidade;

  document.getElementById("resultado").innerHTML =
    `Área: ${area.toFixed(2)} m² <br>
     Preço unitário: R$ ${precoUnitario.toFixed(2)} <br>
     Total: R$ ${total.toFixed(2)}`;

  return { largura, altura, quantidade, precoUnitario, total };
}

function adicionarItem() {
  const dados = calcular();
  if (!dados) return;

  sistema.carrinho.push(dados);
  atualizarLista();
}

function atualizarLista() {
  const lista = document.getElementById("listaItens");
  lista.innerHTML = "";

  sistema.carrinho.forEach((item, index) => {
    lista.innerHTML += `
      <div>
        Item ${index + 1} - ${item.largura}x${item.altura} cm | 
        Qtd: ${item.quantidade} | 
        Total: R$ ${item.total.toFixed(2)}
      </div>
    `;
  });
}

function salvarPedido() {
  if (sistema.carrinho.length === 0) {
    alert("Nenhum item no pedido!");
    return;
  }

  let totalGeral = 0;
  let resumo = "Pedido:\n\n";

  sistema.carrinho.forEach((item, i) => {
    resumo += `Item ${i + 1}: ${item.largura}x${item.altura} cm | Qtd: ${item.quantidade} | R$ ${item.total.toFixed(2)}\n`;
    totalGeral += item.total;
  });

  resumo += `\nTotal Geral: R$ ${totalGeral.toFixed(2)}`;

  alert(resumo);

  // limpar carrinho
  sistema.carrinho = [];
  atualizarLista();
  document.getElementById("resultado").innerHTML = "";
}
