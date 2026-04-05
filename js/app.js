window.onload = function () {
    const select = document.getElementById("produto");
    sistema.produtos.forEach((prod, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `${prod.nome} - R$ ${prod.preco}`;
        select.appendChild(option);
    });
    atualizarTudo(); // Atualiza dashboard e listas
};

// ------------------ Funções de cálculo ------------------
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
    atualizarResumoDashboard();
}

function atualizarListaItens() {
    const lista = document.getElementById("listaItens");
    lista.innerHTML = "";
    sistema.carrinho.forEach(item => {
        lista.innerHTML += `<div>${item.produto} - ${item.largura}x${item.altura} cm | Qtd: ${item.quantidade} | Total: R$ ${item.total.toFixed(2)}</div>`;
    });
}

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

    alert(`Produto "${nome}" adicionado!`);
}

// ------------------ Frete e totais ------------------
function calcularFretePorCEP(cep) {
    cep = cep.replace(/\D/g, "");
    if (!cep || cep.length !== 8) return 0;
    if (cep >= "01000000" && cep <= "19999999") return 15; // SP
    else if (cep >= "20000000" && cep <= "28999999") return 25; // RJ
    else return 40; // resto do Brasil
}

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

document.getElementById("clienteCEP")?.addEventListener("input", calcularTotais);

// ------------------ Orçamentos ------------------
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

    alert(`Orçamento Nº ${orcamento.numero} enviado!`);

    sistema.carrinho = [];
    atualizarListaItens();
    atualizarTudo();
}

// ------------------ Pedidos ------------------
function gerarPedido(orcamentoNumero) {
    const orc = sistema.orcamentos.find(o => o.numero === orcamentoNumero);
    if (!orc) return;

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
    atualizarTudo();
}

// ------------------ Alterar status ------------------
function alterarStatusOrcamento(numeroOrcamento, novoStatus) {
    const orc = sistema.orcamentos.find(o => o.numero === numeroOrcamento);
    if (!orc) return;
    orc.status = novoStatus;
    atualizarTudo();
}

function alterarStatusPedido(numeroPedido, novoStatus) {
    const pedido = sistema.pedidos.find(p => p.numero === numeroPedido);
    if (!pedido) return;
    pedido.status = novoStatus;
    atualizarTudo();
}

// ------------------ Atualização Dashboard ------------------
let graficoStatus;
function atualizarResumoDashboard() {
    const orcamentosAguardando = sistema.orcamentos.filter(o => o.status === "Aguardando aprovação").length;
    const orcamentosAprovados = sistema.orcamentos.filter(o => o.status === "Aprovado").length;
    const pedidosProducao = sistema.pedidos.filter(p => p.status === "Em produção").length;
    const pedidosFinalizados = sistema.pedidos.filter(p => p.status === "Finalizado").length;

    document.getElementById("orcamentosAguardando").textContent = orcamentosAguardando;
    document.getElementById("orcamentosAprovados").textContent = orcamentosAprovados;
    document.getElementById("pedidosProducao").textContent = pedidosProducao;
    document.getElementById("pedidosFinalizados").textContent = pedidosFinalizados;

    const ctx = document.getElementById("graficoStatus").getContext("2d");
    const data = {
        labels: ['Orçamentos Aguardando', 'Orçamentos Aprovados', 'Pedidos Produção', 'Pedidos Finalizados'],
        datasets: [{
            label: 'Quantidade',
            data: [orcamentosAguardando, orcamentosAprovados, pedidosProducao, pedidosFinalizados],
            backgroundColor: ['#f8961e', '#43aa8b', '#0077b6', '#023e8a']
        }]
    };

    const config = { type: 'bar', data: data, options: { responsive: true, plugins: { legend: { display: false } } } };

    if (graficoStatus) {
        graficoStatus.data.datasets[0].data = data.datasets[0].data;
        graficoStatus.update();
    } else {
        graficoStatus = new Chart(ctx, config);
    }
}

// ------------------ Atualizar listas com filtros ------------------
function atualizarListaOrcamentos() {
    const div = document.getElementById("listaOrcamentos");
    const filtro = document.getElementById("filtroOrcamentos").value;
    div.innerHTML = "";

    sistema.orcamentos
        .filter(o => filtro === "todos" || o.status === filtro)
        .forEach((orc) => {
            div.innerHTML += `<div>
                Orçamento Nº ${orc.numero} - ${orc.cliente.nome} | Status: 
                <select onchange="alterarStatusOrcamento(${orc.numero}, this.value)">
                    <option value="Aguardando aprovação" ${orc.status === "Aguardando aprovação" ? "selected" : ""}>Aguardando aprovação</option>
                    <option value="Aprovado" ${orc.status === "Aprovado" ? "selected" : ""}>Aprovado</option>
                </select>
                | Data: ${orc.data}
                <button onclick="gerarPedido(${orc.numero})">Gerar Pedido</button>
            </div>`;
        });
}

function atualizarListaPedidos() {
    const div = document.getElementById("listaPedidos");
    const filtro = document.getElementById("filtroPedidos").value;
    div.innerHTML = "";

    sistema.pedidos
        .filter(p => filtro === "todos" || p.status === filtro)
        .forEach((pedido) => {
            div.innerHTML += `<div>
                Pedido Nº ${pedido.numero} (vinculado ao Orçamento Nº ${pedido.vinculadoOrcamento}) - ${pedido.cliente.nome} | Status: 
                <select onchange="alterarStatusPedido(${pedido.numero}, this.value)">
                    <option value="Em produção" ${pedido.status === "Em produção" ? "selected" : ""}>Em produção</option>
                    <option value="Finalizado" ${pedido.status === "Finalizado" ? "selected" : ""}>Finalizado</option>
                </select>
                | Data: ${pedido.data}
            </div>`;
        });
}

// ------------------ Atualização completa ------------------
function atualizarTudo() {
    atualizarListaOrcamentos();
    atualizarListaPedidos();
    atualizarResumoDashboard();
}

document.getElementById("filtroOrcamentos").addEventListener("change", atualizarListaOrcamentos);
document.getElementById("filtroPedidos").addEventListener("change", atualizarListaPedidos);

// ------------------ Gerar PDF ------------------
document.getElementById("gerarPDF").addEventListener("click", () => {
    if (sistema.carrinho.length === 0) { alert("Adicione pelo menos um item antes de gerar o PDF!"); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p','mm','a4');
    let y = 20;
    doc.setFontSize(16);
    doc.text("Orçamento - Prestige Comunicação Visual", 105, y, { align: "center" });
    y += 10;
    const dataAtual = new Date().toLocaleDateString();
    doc.setFontSize(12);
    doc.text(`Data: ${dataAtual}`, 10, y);
    y += 10;
    doc.text("Produto", 10, y); doc.text("Qtd", 90, y); doc.text("Área m²", 120, y); doc.text("Total R$", 160, y);
    y += 7;
    sistema.carrinho.forEach(item => {
        const area = ((item.largura*item.altura)/10000).toFixed(2);
        doc.text(item.produto,10,y); doc.text(item.quantidade.toString(),90,y); doc.text(area,120,y); doc.text(item.total.toFixed(2),160,y);
        y +=7;
    });
    const totais = calcularTotais();
    y += 10; doc.text(`Frete: R$ ${totais.frete.toFixed(2)}`,10,y); y+=7;
    doc.text(`Desconto: R$ ${totais.desconto.toFixed(2)}`,10,y); y+=7;
    doc.setFontSize(14); doc.text(`Total Geral: R$ ${totais.totalGeral.toFixed(2)}`,10,y);
    doc.save(`Orcamento_${Date.now()}.pdf`);
});
