// ================================
// App Pedidos - app.js (Corrigido)
// ================================

// Inicialização ao carregar a página
window.onload = function () {
  popularProdutos();
  atualizarListaOrcamentos();
  atualizarListaPedidos();
  atualizarDashboard();
  atualizarDataAutomatica(); // Nova função para o formato AA/DD/HH+1
  calcularTotais(); 
};

// ================================
// Funções de Utilidade e Data
// ================================

function atualizarDataAutomatica() {
  const agora = new Date();
  agora.setHours(agora.getHours() + 1); // Soma 1 hora

  const aa = agora.getFullYear().toString().slice(-2);
  const dd = String(agora.getDate()).padStart(2, '0');
  const hh = String(agora.getHours()).padStart(2, '0');
  const mm = String(agora.getMinutes()).padStart(2, '0');

  const formatoFinal = `${aa}/${dd}/${hh}:${mm}`;
  
  // Atualiza no HTML (se o elemento existir)
  const elNumero = document.getElementById("numeroOrcamento");
  if (elNumero) {
    // Usamos o formato como parte do "ID" do orçamento ou apenas exibição
    elNumero.textContent = `${sistema.contadorOrcamento} (${formatoFinal})`;
  }
  return formatoFinal;
}

// ================================
// Funções de Produtos e Cálculos
// ================================

function popularProdutos() {
  const select = document.getElementById("produto");
  if (!select) return;
  select.innerHTML = "";
  sistema.produtos.forEach((prod, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${prod.nome} - R$ ${prod.preco.toFixed(2)}/m²`;
    select.appendChild(option);
  });
}

function calcular() {
  const produtoIndex = document.getElementById("produto").value;
  const largura = parseFloat(document.getElementById("largura").value);
  const altura = parseFloat(document.getElementById("altura").value);
  const quantidade = parseInt(document.getElementById("quantidade").value);

  if (produtoIndex === "" || isNaN(largura) || isNaN(altura) || isNaN(quantidade)) {
    alert("Preencha largura, altura e quantidade!");
    return null;
  }

  const produto = sistema.produtos[produtoIndex];
  // Cálculo de área em m² (cm * cm / 10000)
  const areaM2 = (largura * altura) / 10000;
  // Preço unitário = Preço do m² * Área
  const precoUnitario = produto.preco * areaM2;
  const totalItem = precoUnitario * quantidade;

  document.getElementById("resultado").innerHTML = `
    <strong>${produto.nome}</strong><br>
    Área: ${areaM2.toFixed(2)} m² | Unitário: R$ ${precoUnitario.toFixed(2)}<br>
    <strong>Subtotal: R$ ${totalItem.toFixed(2)}</strong>
  `;

  return { 
    nome: produto.nome, 
    largura, 
    altura, 
    quantidade, 
    area: areaM2, 
    total: totalItem 
  };
}

function adicionarItem() {
  const dados = calcular();
  if (!dados) return;
  sistema.carrinho.push(dados);
  atualizarListaItens();
  calcularTotais();
}

function atualizarListaItens() {
  const lista = document.getElementById("listaItens");
  lista.innerHTML = "";
  sistema.carrinho.forEach((item, index) => {
    lista.innerHTML += `
      <div class="item-carrinho">
        ${item.nome} (${item.largura}x${item.altura}cm) x${item.quantidade} 
        <strong>R$ ${item.total.toFixed(2)}</strong>
      </div>`;
  });
}

// ================================
// Totais e Frete
// ================================

function calcularTotais() {
  let totalProdutos = 0;
  sistema.carrinho.forEach(item => totalProdutos += item.total);

  const cep = document.getElementById("clienteCEP")?.value.replace(/\D/g, "") || "";
  let frete = 0;

  // Lógica Simples de Frete
  if (cep.length === 8) {
    if (cep.startsWith("0")) frete = 15.00; // Grande SP
    else frete = 40.00; // Outros
  }

  const desconto = totalProdutos > 500 ? totalProdutos * 0.05 : 0; // 5% acima de 500 reais
  const totalGeral = totalProdutos + frete - desconto;

  document.getElementById("frete").textContent = frete.toFixed(2);
  document.getElementById("desconto").textContent = desconto.toFixed(2);
  document.getElementById("totalGeral").textContent = totalGeral.toFixed(2);

  return { frete, desconto, totalGeral };
}

// Ouvinte para o CEP calcular frete automático
document.getElementById("clienteCEP")?.addEventListener("blur", calcularTotais);

// ================================
// Gestão de Orçamentos e PDF
// ================================

function salvarOrcamento() {
  const nome = document.getElementById("clienteNome").value;
  if (!nome || sistema.carrinho.length === 0) {
    alert("Nome do cliente e itens no carrinho são obrigatórios!");
    return;
  }

  const dataHoraId = atualizarDataAutomatica();
  const orcamento = {
    numero: sistema.contadorOrcamento++,
    dataID: dataHoraId,
    cliente: nome,
    itens: [...sistema.carrinho],
    total: parseFloat(document.getElementById("totalGeral").textContent),
    status: "Pendente"
  };

  sistema.orcamentos.push(orcamento);
  sistema.carrinho = []; // Limpa carrinho após salvar
  
  atualizarListaItens();
  atualizarListaOrcamentos();
  atualizarDashboard();
  alert("Orçamento salvo com sucesso!");
}

function atualizarListaOrcamentos() {
  const div = document.getElementById("listaOrcamentos");
  if (!div) return;
  div.innerHTML = "";
  sistema.orcamentos.forEach(orc => {
    div.innerHTML += `
      <div class="card-historico">
        ID: ${orc.dataID} | <strong>${orc.cliente}</strong> | R$ ${orc.total.toFixed(2)}
        <button onclick="aprovarOrcamento(${orc.numero})">Aprovar</button>
      </div>`;
  });
}

function atualizarDashboard() {
  document.getElementById("totalOrcamentos").textContent = sistema.orcamentos.length;
  document.getElementById("totalAprovados").textContent = sistema.orcamentos.filter(o => o.status === "Aprovado").length;
  document.getElementById("totalPedidos").textContent = sistema.pedidos.length;
}

// PDF - Ajustado para usar a nova data
document.getElementById("gerarPDF")?.addEventListener("click", () => {
  if (sistema.carrinho.length === 0) {
    alert("Adicione itens ao carrinho primeiro!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const dataRef = atualizarDataAutomatica();

  doc.setFontSize(18);
  doc.text("PRESTIGE COMUNICAÇÃO VISUAL", 10, 20);
  doc.setFontSize(12);
  doc.text(`Ref. Orçamento: ${dataRef}`, 10, 30);
  doc.text(`Cliente: ${document.getElementById("clienteNome").value}`, 10, 40);

  let y = 60;
  doc.text("Item", 10, y);
  doc.text("Qtd", 100, y);
  doc.text("Total", 160, y);
  
  doc.line(10, y+2, 200, y+2);
  y += 10;

  sistema.carrinho.forEach(item => {
    doc.text(item.nome, 10, y);
    doc.text(item.quantidade.toString(), 100, y);
    doc.text(`R$ ${item.total.toFixed(2)}`, 160, y);
    y += 8;
  });

  y += 10;
  doc.text(`Total Geral: R$ ${document.getElementById("totalGeral").textContent}`, 10, y);

  doc.save(`Orcamento_Prestige_${dataRef.replace(/\//g, '-')}.pdf`);
});
