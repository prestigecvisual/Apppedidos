// ========================================================
// PRESTIGE COMUNICAÇÃO VISUAL - APP.JS
// ========================================================

// ===============================
// 🔥 INICIALIZAÇÃO
// ===============================
window.onload = () => {
    try {
        carregarDoNavegador();

        // Popular produtos no select
        popularProdutos();

        const select = document.getElementById("produto");
        if (select && select.options.length > 0) select.selectedIndex = 0;

        toggleMedidas();

        // Atualizar data
        if (typeof atualizarDataRef === "function") atualizarDataRef();

        // Atualizar listas
        atualizarListaOrcamentos();
        atualizarListaPedidos();

        // Totais
        calcularTotais();

    } catch (erro) {
        console.error("Erro ao iniciar sistema:", erro);
    }
};

// ========================================================
// 💰 UTILITÁRIOS
// ========================================================
function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dataHoje() {
    const d = new Date();
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function gerarNumeroPedido() {
    const num = sistema.contadorOrcamento;
    sistema.contadorOrcamento++;
    salvarNoNavegador();
    return num;
}

// ========================================================
// 🛒 PRODUTOS
// ========================================================
function cadastrarNovoProduto() {
    const nome = document.getElementById("novoProdutoNome").value.trim();
    const preco = parseFloat(document.getElementById("novoProdutoPreco").value);

    if(!nome || isNaN(preco)) return alert("Preencha nome e preço corretamente.");

    sistema.produtos.push({ nome, preco, tipo: "unid" });
    salvarNoNavegador();
    popularProdutos();

    document.getElementById("novoProdutoNome").value = "";
    document.getElementById("novoProdutoPreco").value = "";
}

function popularProdutos() {
    const select = document.getElementById("produto");
    select.innerHTML = '<option value="">Selecione o produto</option>';
    sistema.produtos.forEach((p, i) => {
        select.innerHTML += `<option value="${i}">${p.nome} - ${p.tipo === "unid" ? "unidade" : "m²"} - ${formatarMoeda(p.preco)}</option>`;
    });
}

function toggleMedidas() {
    const select = document.getElementById("produto");
    const largura = document.getElementById("largura");
    const altura = document.getElementById("altura");

    if(!select) return;
    select.onchange = () => {
        const p = sistema.produtos[select.value];
        if(!p) return;
        if(p.tipo === "unid") {
            largura.disabled = true;
            altura.disabled = true;
            largura.value = "";
            altura.value = "";
        } else {
            largura.disabled = false;
            altura.disabled = false;
        }
    }
}

// ========================================================
// 📦 CÁLCULO
// ========================================================
function calcularProduto() {
    const select = document.getElementById("produto");
    const p = sistema.produtos[select.value];
    if(!p) return 0;

    const largura = parseFloat(document.getElementById("largura").value || 0);
    const altura = parseFloat(document.getElementById("altura").value || 0);
    const qtd = parseFloat(document.getElementById("quantidade").value || 1);

    let total = 0;
    if(p.tipo === "unid") {
        total = p.preco * qtd;
    } else {
        total = p.preco * (largura/100) * (altura/100) * qtd; // m²
    }
    return total;
}

// ========================================================
// 📡 FRETE CEP
// ========================================================
async function buscarCEP() {
    const cep = document.getElementById("clienteCEP").value.replace(/\D/g,'');
    if(!cep) return;

    try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();

        if(data.erro) return alert("CEP inválido");

        document.getElementById("clienteEndereco").value = data.logradouro || "";
        document.getElementById("clienteBairro").value = data.bairro || "";
        document.getElementById("clienteCidade").value = data.localidade || "";
        document.getElementById("clienteEstado").value = data.uf || "";

        calcularFrete(data);
    } catch(err) {
        console.error(err);
        alert("Erro ao buscar CEP");
    }
}

function calcularFrete(data) {
    const cidade = data.localidade.toLowerCase();
    const uf = data.uf.toLowerCase();
    let frete = 0;

    if(cidade.includes("são paulo") && uf === "sp") frete = 0;
    else if(["guarulhos","osasco","santo andré","são bernardo do campo","diadema","barueri","são caetano do sul"].includes(cidade)) frete = 20;
    else frete = 50;

    document.getElementById("frete").innerText = frete.toFixed(2);
}

// ========================================================
// 🛒 CARRINHO / ORÇAMENTO
// ========================================================
function adicionarItem() {
    const select = document.getElementById("produto");
    const p = sistema.produtos[select.value];
    if(!p) return alert("Selecione produto");

    const largura = parseFloat(document.getElementById("largura").value || 0);
    const altura = parseFloat(document.getElementById("altura").value || 0);
    const qtd = parseFloat(document.getElementById("quantidade").value || 1);

    let total = calcularProduto();

    sistema.carrinho.push({
        nome: p.nome,
        tipo: p.tipo,
        largura,
        altura,
        qtd,
        total
    });

    salvarNoNavegador();
    atualizarCarrinho();
    calcularTotais();
}

function atualizarCarrinho() {
    const div = document.getElementById("listaItens");
    div.innerHTML = "";
    sistema.carrinho.forEach((item, i) => {
        div.innerHTML += `<div>${item.nome} - ${item.qtd} x ${formatarMoeda(item.total/item.qtd)} = ${formatarMoeda(item.total)} <button onclick="removerItem(${i})">❌</button></div>`;
    });
}

function removerItem(index) {
    sistema.carrinho.splice(index,1);
    salvarNoNavegador();
    atualizarCarrinho();
    calcularTotais();
}

function calcularTotais() {
    let total = sistema.carrinho.reduce((sum,item)=>sum+item.total,0);
    const frete = parseFloat(document.getElementById("frete").innerText || 0);
    total += frete;
    document.getElementById("totalGeral").innerText = total.toFixed(2);
}

// ========================================================
// 📅 ORÇAMENTOS / PEDIDOS
// ========================================================
function atualizarDataRef() {
    document.getElementById("dataRef").innerText = dataHoje();
}

function salvarOrcamento() {
    const cliente = document.getElementById("clienteNome").value.trim();
    if(!cliente) return alert("Preencha dados do cliente");
    const numero = gerarNumeroPedido();
    const data = dataHoje();

    const orc = {
        numero,
        dataCriacao: data,
        cliente,
        clienteEndereco: document.getElementById("clienteEndereco").value,
        clienteBairro: document.getElementById("clienteBairro").value,
        clienteCidade: document.getElementById("clienteCidade").value,
        clienteEstado: document.getElementById("clienteEstado").value,
        clienteCEP: document.getElementById("clienteCEP").value,
        itens: [...sistema.carrinho],
        frete: parseFloat(document.getElementById("frete").innerText || 0),
        status: "Aguardando aprovação"
    };

    sistema.orcamentos.push(orc);
    salvarNoNavegador();

    sistema.carrinho = [];
    atualizarCarrinho();
    atualizarListaOrcamentos();
    calcularTotais();
}

// Aprovar orçamento → transforma em pedido
function aprovarOrcamento(index) {
    const o = sistema.orcamentos[index];
    o.status = "Aprovado";
    sistema.pedidos.push({...o, dataAprovacao: dataHoje()});
    salvarNoNavegador();
    atualizarListaOrcamentos();
    atualizarListaPedidos();
}

// Atualiza lista de orçamentos
function atualizarListaOrcamentos() {
    const div = document.getElementById("listaOrcamentos");
    div.innerHTML = "";
    sistema.orcamentos.forEach((o,i)=>{
        div.innerHTML += `
        <div>
            #${o.numero} - ${o.cliente} - ${o.status}
            <button onclick="aprovarOrcamento(${i})">Aprovar ✅</button>
            <button onclick="gerarPDFOrcamento(${i})">📄 PDF</button>
            <button onclick="enviarWhatsApp(${i})">💬 WhatsApp</button>
        </div>`;
    });
}

// Atualiza lista de pedidos
function atualizarListaPedidos() {
    const colProducao = document.getElementById("col-producao");
    const colAndamento = document.getElementById("col-andamento");
    const colFinalizado = document.getElementById("col-finalizado");
    const colEntregue = document.getElementById("col-entregue");

    colProducao.innerHTML = colAndamento.innerHTML = colFinalizado.innerHTML = colEntregue.innerHTML = "";

    sistema.pedidos.forEach((p,i)=>{
        const btnNext = `<button onclick="proximoStatus(${i})">➡️</button>`;
        const html = `<div>#${p.numero} - ${p.cliente} (${p.status}) ${btnNext}</div>`;
        switch(p.status){
            case "Aprovado": colProducao.innerHTML += html; break;
            case "Produção": colAndamento.innerHTML += html; break;
            case "Em andamento": colFinalizado.innerHTML += html; break;
            case "Finalizado": colEntregue.innerHTML += html; break;
            case "Entregue": colEntregue.innerHTML += html; break;
        }
    });
}

// Avança status do pedido
function proximoStatus(index){
    const p = sistema.pedidos[index];
    if(!p) return;
    switch(p.status){
        case "Aprovado": p.status="Produção"; break;
        case "Produção": p.status="Em andamento"; break;
        case "Em andamento": p.status="Finalizado"; break;
        case "Finalizado": p.status="Entregue"; break;
    }
    salvarNoNavegador();
    atualizarListaPedidos();
}

// ========================================================
// 📤 WhatsApp
// ========================================================
function enviarWhatsApp(index){
    const p = sistema.orcamentos[index] || sistema.pedidos[index];
    if(!p) return alert("Item não encontrado");

    let msg = `*Prestige Comunicação Visual*\nOrçamento/Pedido #${p.numero}\nCliente: ${p.cliente}\nEndereço: ${p.clienteEndereco}, ${p.clienteBairro}, ${p.clienteCidade} - ${p.clienteEstado}\nCEP: ${p.clienteCEP}\n\nItens:\n`;
    p.itens.forEach(i=>{
        msg += `${i.nome} - ${i.qtd} x ${formatarMoeda(i.total/i.qtd)} = ${formatarMoeda(i.total)}\n`;
    });
    msg += `\nFrete: ${formatarMoeda(p.frete)}\nTOTAL: ${formatarMoeda(p.itens.reduce((s,i)=>s+i.total,0)+p.frete)}\n\nStatus: ${p.status}`;

    window.open(`https://api.whatsapp.com/send?phone=5511922018290&text=${encodeURIComponent(msg)}`,'_blank');
}

// ========================================================
// 📄 PDF
// ========================================================

async function gerarPDFOrcamento(index){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p','mm','a4');
    const p = sistema.orcamentos[index];
    let y=10;

    doc.setFontSize(14); doc.text("Prestige Comunicação Visual",10,y); y+=6;
    doc.setFontSize(10); doc.text("Rua Brasil, 304 - Rudge Ramos - São Bernardo do Campo - SP - CEP: 09627-000",10,y); y+=4;
    doc.text("PIX: 11922018290",10,y); y+=10;

    doc.setFontSize(12); doc.text(`ORÇAMENTO Nº: ${p.numero || "-"}`,10,y); y+=5;
    doc.setFontSize(10); doc.text(`Data: ${p.dataCriacao || "-"}`,10,y);
    doc.text(`Status: ${p.status || "-"}`,150,y); y+=8;

    doc.setFontSize(10); doc.text(`Cliente: ${p.cliente || "-"}`,10,y); y+=5;
    doc.text(`Endereço: ${p.clienteEndereco || "-"}`,10,y); y+=5;
    doc.text(`Bairro: ${p.clienteBairro || "-"}`,10,y); y+=5;
    doc.text(`Cidade/UF: ${p.clienteCidade || "-"} / ${p.clienteEstado || "-"}`,10,y); y+=5;
    doc.text(`CEP: ${p.clienteCEP || "-"}`,10,y); y+=10;

    doc.setFontSize(10); doc.setDrawColor(0); doc.setLineWidth(0.1);
    doc.line(10,y,200,y); y+=2;
    doc.text("Produto",10,y); doc.text("Qtd",120,y); doc.text("Medida",140,y); doc.text("Valor Unit.",160,y); doc.text("Total",190,y,{align:"right"}); y+=2;
    doc.line(10,y,200,y); y+=5;

    let totalGeral = 0;
    p.itens.forEach(item=>{
        const valorUnit = Number(item.total/item.qtd||0).toFixed(2);
        const totalItem = Number(item.total||0).toFixed(2);
        totalGeral += Number(totalItem);

        doc.text(item.nome||"-",10,y);
        doc.text(`${item.qtd||0}`,120,y);
        doc.text(item.tipo==="m2"?`${item.largura}x${item.altura} cm`:"-",140,y);
        doc.text(`R$ ${valorUnit}`,160,y);
        doc.text(`R$ ${totalItem}`,190,y,{align:"right"});
        y+=7;
    });

    y+=2; doc.line(10,y,200,y); y+=5;
    doc.setFontSize(12); doc.text(`TOTAL GERAL: R$ ${totalGeral.toFixed(2)}`,200,y,{align:"right"});
    y+=15; doc.setFontSize(10); doc.text("Deus Seja Sempre Louvado! Tudo posso Naquele que me Fortalece!",10,y);

    const qrCode = await gerarQRCodePIX(totalGeral);
    doc.addImage(qrCode,"PNG",150,y-5,50,50);

    doc.save(`orcamento_${p.numero || "orcamento"}.pdf`);
}

async function gerarPDFPedido(index){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p','mm','a4');
    const p = sistema.pedidos[index];
    let y=10;

    doc.setFontSize(14); doc.text("Prestige Comunicação Visual",10,y); y+=6;
    doc.setFontSize(10); doc.text("Rua Brasil, 304 - Rudge Ramos - São Bernardo do Campo - SP - CEP: 09627-000",10,y); y+=4;
    doc.text("PIX: 11922018290",10,y); y+=10;

    doc.setFontSize(12); doc.text(`PEDIDO Nº: ${p.numero || "-"}`,10,y); y+=5;
    doc.setFontSize(10); doc.text(`Data: ${p.dataAprovacao || "-"}`,10,y);
    doc.text(`Status: ${p.status || "-"}`,150,y); y+=8;

    doc.setFontSize(10); doc.text(`Cliente: ${p.cliente || "-"}`,10,y); y+=5;
    doc.text(`Endereço: ${p.clienteEndereco || "-"}`,10,y); y+=5;
    doc.text(`Bairro: ${p.clienteBairro || "-"}`,10,y); y+=5;
    doc.text(`Cidade/UF: ${p.clienteCidade || "-"} / ${p.clienteEstado || "-"}`,10,y); y+=5;
    doc.text(`CEP: ${p.clienteCEP || "-"}`,10,y); y+=10;

    doc.setFontSize(10); doc.setDrawColor(0); doc.setLineWidth(0.1);
    doc.line(10,y,200,y); y+=2;
    doc.text("Produto",10,y); doc.text("Qtd",120,y); doc.text("Medida",140,y); doc.text("Valor Unit.",160,y); doc.text("Total",190,y,{align:"right"}); y+=2;
    doc.line(10,y,200,y); y+=5;

    let totalGeral = 0;
    p.itens.forEach(item=>{
        const valorUnit = Number(item.total/item.qtd||0).toFixed(2);
        const totalItem = Number(item.total||0).toFixed(2);
        totalGeral += Number(totalItem);

        doc.text(item.nome||"-",10,y);
        doc.text(`${item.qtd||0}`,120,y);
        doc.text(item.tipo==="m2"?`${item.largura}x${item.altura} cm`:"-",140,y);
        doc.text(`R$ ${valorUnit}`,160,y);
        doc.text(`R$ ${totalItem}`,190,y,{align:"right"});
        y+=7;
    });

    y+=2; doc.line(10,y,200,y); y+=5;
    doc.setFontSize(12); doc.text(`TOTAL GERAL: R$ ${totalGeral.toFixed(2)}`,200,y,{align:"right"});
    y+=15; doc.setFontSize(10); doc.text("Deus Seja Sempre Louvado! Tudo posso Naquele que me Fortalece!",10,y);

    const qrCode = await gerarQRCodePIX(totalGeral);
    doc.addImage(qrCode,"PNG",150,y-5,50,50);

    doc.save(`pedido_${p.numero || "pedido"}.pdf`);
}

// ========================================================
// 💳 QR CODE PIX
// ========================================================
function gerarQRCodePIX(valor) {
    return new Promise(resolve=>{
        const chavePIX="11922018290";
        const payload=`00020126580014BR.GOV.BCB.PIX0136${chavePIX}52040000530398654${Number(valor).toFixed(2)}5802BR5920Prestige Comunicacao6009Sao Paulo62070503***6304`;

        const div=document.createElement("div");
        new QRCode(div,{text:payload,width:150,height:150});
        setTimeout(()=>{
            const img = div.querySelector("img").src;
            resolve(img);
        },500);
    });
}

// ========================================================
// 💾 LOCAL STORAGE
// ========================================================
function salvarNoNavegador() {
    localStorage.setItem("sistema",JSON.stringify(sistema));
}

function carregarDoNavegador() {
    const data = JSON.parse(localStorage.getItem("sistema"));
    if(data) Object.assign(sistema,data);
}

// ========================================================
// 🌐 SISTEMA
// ========================================================
const sistema = {
    produtos:[
        {nome:"Banner",preco:50,tipo:"m2"},
        {nome:"Adesivo",preco:30,tipo:"m2"},
        {nome:"Chaveiro",preco:10,tipo:"unid"}
    ],
    carrinho:[],
    orcamentos:[],
    pedidos:[],
    contadorOrcamento:1
};
