function calcular() {
  const largura = parseFloat(document.getElementById("largura").value);
  const altura = parseFloat(document.getElementById("altura").value);
  const qtd = parseInt(document.getElementById("quantidade").value);

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
