let itens = [];

function calcular() {
  const largura = parseFloat(document.getElementById("largura").value);
  const altura = parseFloat(document.getElementById("altura").value);
  const qtd = parseInt(document.getElementById("quantidade").value);

  if (!largura || !altura || !qtd) {
    alert("Preencha todos os campos!");
    return;
  }

  const area = largura * altura;
  const areaTotal = area * qtd;

  const precoChapa = sistema.configuracao.precoChapa;
  const areaChapa = sistema.configuracao.larguraChapa * sistema.configuracao.alturaChapa;

  const custoCm2 = precoChapa / areaChapa;
  const custoTotal = areaTotal * custoCm2;

  document.getElementById("resultado").innerHTML =
    `Área total: ${areaTotal} cm² <br>
     Custo estimado: R$ ${custoTotal.toFixed(2)}`;
}

function adicionarItem() {
  const largura = parseFloat(document.getElementById("largura").value);
  const altura = parseFloat(document.getElementById("altura").value);
  const qtd = parseInt(document.getElementById("quantidade").value);

  if (!largura || !altura || !qtd) {
    alert("Preencha todos os campos!");
    return;
  }

  const area = largura * altura;
  const areaTotal = area * qtd;

  const precoChapa = sistema.configuracao.precoChapa;
  const areaChapa = sistema.configuracao.larguraChapa * sistema.configuracao.alturaChapa;

  const custoCm2 = precoChapa / areaChapa;
  const custoTotal = areaTotal * custoCm2;

  const item = {
    largura,
    altura,
    qtd,
    areaTotal,
    custoTotal
  };

  itens.push(item);

  atualizarLista();
}

function atualizarLista() {
  let html = "";

  itens.forEach((item, i) => {
    html += `
      <div style="border:1px solid #000; margin:10px; padding:10px;">
        Item ${i + 1} <br>
        ${item.qtd} un - ${item.largura}x${item.altura} cm <br>
        Área: ${item.areaTotal} cm² <br>
        Custo: R$ ${item.custoTotal.toFixed(2)}
      </div>
    `;
  });

  document.getElementById("listaItens").innerHTML = html;
}

function salvarPedido() {
  let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

  const novoPedido = {
    numero: pedidos.length + 1,
    data: new Date().toLocaleDateString(),
    itens
  };

  pedidos.push(novoPedido);

  localStorage.setItem("pedidos", JSON.stringify(pedidos));

  alert("Pedido salvo!");

  itens = [];
  atualizarLista();
}
