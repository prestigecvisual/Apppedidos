// carregar produtos no select
window.onload = function () {
  const select = document.getElementById("produto");

  sistema.produtos.forEach((prod, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = prod.nome + " - R$ " + prod.preco;
    select.appendChild(option);
  });
};

function calcular() {
  const produtoIndex = document.getElementById("produto").value;
  const largura = parseFloat(document.getElementById("largura").value);
  const altura = parseFloat(document.getElementById("altura").value);
  const quantidade = parseInt(document.getElementById("quantidade").value);

  if (produtoIndex === "" || !largura || !altura || !quantidade) {
    alert("Preencha todos os campos!");
    return;
  }

  const produto = sistema.produtos[produtoIndex];

  const area = (largura * altura) / 10000;
  const precoUnitario = produto.preco * area * 10;
  const total = precoUnitario * quantidade;

  document.getElementById("resultado").innerHTML =
    `Produto: ${produto.nome} <br>
     Área: ${area.toFixed(2)} m² <br>
     Preço unitário: R$ ${precoUnitario.toFixed(2)} <br>
     Total: R$ ${total.toFixed(2)}`;

  return { produto: produto.nome, largura, altura, quantidade, total };
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
        ${item.produto} - ${item.largura}x${item.altura} cm | 
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
    const telefone = "5511922018290"; // seu número
const url = `https://wa.me/${telefone}?text=${encodeURIComponent(resumo)}`;
window.open(url, "_blank");
  }

  let totalGeral = 0;
  let resumo = "Pedido:\n\n";

  sistema.carrinho.forEach((item, i) => {
    resumo += `${item.produto} - ${item.largura}x${item.altura} cm | Qtd: ${item.quantidade} | R$ ${item.total.toFixed(2)}\n`;
    totalGeral += item.total;
  });

  resumo += `\nTotal Geral: R$ ${totalGeral.toFixed(2)}`;

  alert(resumo);

  sistema.carrinho = [];
  atualizarLista();
  document.getElementById("resultado").innerHTML = "";
}
