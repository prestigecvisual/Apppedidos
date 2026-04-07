// ========================================================
// APP.JS FINAL - PRESTIGE COMUNICAÇÃO VISUAL
// ========================================================

// ===============================
// 🚀 INICIALIZAÇÃO
// ===============================
window.onload = () => { 
    try {
        carregarDoNavegador();
        popularProdutos();
        toggleMedidas();
        atualizarListaOrcamentos();
        atualizarListaPedidos();
        calcularTotais();
        atualizarPreviewDANFE();
    } catch (erro) {
        console.error("Erro ao iniciar sistema:", erro);
    }
};

// ===============================
// 📅 Utilitários
// ===============================
function formatarMoeda(valor){
    return Number(valor || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}

function dataHoje(){
    const d = new Date();
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function gerarNumeroOrcamento(){
    const d = new Date();
    const dia = String(d.getDate()).padStart(2,'0');
    const mes = String(d.getMonth()+1).padStart(2,'0');
    const ano = String(d.getFullYear());
    const sequencial = sistema.contadorOrcamento.toString().padStart(4,'0');
    return `${dia}${mes}${ano}${sequencial}`;
}

function gerarNumeroPedido(){
    const d = new Date();
    const dia = String(d.getDate()).padStart(2,'0');
    const mes = String(d.getMonth()+1).padStart(2,'0');
    const ano = String(d.getFullYear());
    const sequencial = (sistema.pedidos.length+1).toString().padStart(4,'0');
    return `${dia}${mes}${ano}${sequencial}`;
}

// ===============================
// 🔧 Produtos
// ===============================
function cadastrarNovoProduto(){
    const nome = document.getElementById('novoProdNome').value.trim();
    const preco = Number(document.getElementById('novoProdPreco').value);
    const tipo = document.getElementById('novoProdTipo').value;
    if(!nome || !preco) return alert('Informe nome e preço');
    sistema.produtos.push({nome, preco, tipo});
    salvarNoNavegador();
    popularProdutos();
    document.getElementById('novoProdNome').value='';
    document.getElementById('novoProdPreco').value='';
}

function popularProdutos(){
    const sel = document.getElementById('produto');
    sel.innerHTML='';
    sistema.produtos.forEach((p,i)=>{
        const opt = document.createElement('option');
        opt.value=i;
        opt.text=p.nome;
        sel.appendChild(opt);
    });
}

function toggleMedidas(){
    const idx = document.getElementById('produto').value;
    const tipo = sistema.produtos[idx]?.tipo;
    document.getElementById('medidasInput').style.display = tipo==='m2'?'flex':'none';
}

// ===============================
// 🛒 Carrinho
// ===============================
function adicionarItem(){
    const idx = document.getElementById('produto').value;
    const produto = sistema.produtos[idx];
    let qtd = Number(document.getElementById('quantidade').value || 1);
    let largura = Number(document.getElementById('largura').value || 0);
    let altura = Number(document.getElementById('altura').value || 0);
    let medida = produto.tipo==='m2'?`${largura}x${altura} cm`:'--';
    let total = produto.tipo==='m2'? (largura*altura/10000)*produto.preco*qtd : produto.preco*qtd;

    const item = {
        nome: produto.nome,
        qtd,
        medida,
        total
    };
    sistema.carrinho.push(item);
    salvarNoNavegador();
    atualizarCarrinho();
}

function atualizarCarrinho(){
    const lista = document.getElementById('listaItens');
    lista.innerHTML='';
    sistema.carrinho.forEach((item,i)=>{
        const div = document.createElement('div');
        div.textContent = `${item.nome} | Qtd: ${item.qtd} | ${item.medida} | Total: ${formatarMoeda(item.total)}`;
        const btn = document.createElement('button');
        btn.textContent='❌';
        btn.onclick=()=>{ removerItem(i); };
        div.appendChild(btn);
        lista.appendChild(div);
    });
    calcularTotais();
    atualizarPreviewDANFE();
}

function removerItem(i){
    sistema.carrinho.splice(i,1);
    salvarNoNavegador();
    atualizarCarrinho();
}

// ===============================
// 💰 Totais e Frete
// ===============================
function calcularTotais(){
    let subtotal = sistema.carrinho.reduce((a,b)=>a+b.total,0);
    let frete = calcularFrete();
    let forma = document.getElementById('formaPagamento').value;
    let desconto = 0;

    if(forma==='pix') desconto = subtotal*0.05;
    if(forma==='credito_1x') subtotal*=1.015;
    if(forma==='credito_3x') subtotal*=1.06;
    if(forma==='credito_5x') subtotal*=1.07;

    let totalGeral = subtotal + frete - desconto;

    document.getElementById('frete').textContent = formatarMoeda(frete);
    document.getElementById('desconto').textContent = formatarMoeda(desconto);
    document.getElementById('totalGeral').textContent = formatarMoeda(totalGeral);
    document.getElementById('danfeTotalGeral').textContent = formatarMoeda(totalGeral);
}

function calcularFrete(){
    const cep = document.getElementById('clienteCEP').value || '';
    if(!cep) return 0;
    if(/^010\d{3}-?\d{3}$/.test(cep)) return 0; // SP Capital
    if(/^0[1-9]\d{3}-?\d{3}$/.test(cep)) return 15; // Grande SP
    return 25; // Interior/Outros
}

// ===============================
// 🏷️ DANFE Preview
// ===============================
function atualizarPreviewDANFE(){
    const cab = document.getElementById('danfeCabecalho');
    cab.innerHTML=`
    <p>ORÇAMENTO Nº: ${sistema.contadorOrcamento}</p>
    <p>Data: ${dataHoje()}</p>
    <p>Cliente: ${document.getElementById('clienteNome').value}</p>
    <p>Endereço: ${document.getElementById('clienteEndereco').value} ${document.getElementById('clienteNumero').value}</p>
    <p>Bairro: ${document.getElementById('clienteBairro').value}</p>
    <p>Cidade/UF: ${document.getElementById('clienteCidade').value} / ${document.getElementById('clienteEstado').value}</p>
    <p>CEP: ${document.getElementById('clienteCEP').value}</p>
    `;
    const corpo = document.getElementById('danfeCorpo');
    corpo.innerHTML='';
    sistema.carrinho.forEach(item=>{
        corpo.innerHTML+=`<tr>
            <td style="border:1px solid #ccc; padding:5px;">${item.nome}</td>
            <td style="border:1px solid #ccc; padding:5px;">${item.qtd}</td>
            <td style="border:1px solid #ccc; padding:5px;">${item.medida}</td>
            <td style="border:1px solid #ccc; padding:5px;">${formatarMoeda(item.total/item.qtd)}</td>
            <td style="border:1px solid #ccc; padding:5px;">${formatarMoeda(item.total)}</td>
        </tr>`;
    });
}

// ===============================
// 📦 Orçamento / Pedido
// ===============================
function salvarOrcamento(){
    const numero = gerarNumeroOrcamento();
    sistema.contadorOrcamento++;
    const orc = {
        numero,
        data: dataHoje(),
        clienteNome: document.getElementById('clienteNome').value,
        clienteEndereco: document.getElementById('clienteEndereco').value,
        clienteNumero: document.getElementById('clienteNumero').value,
        clienteBairro: document.getElementById('clienteBairro').value,
        clienteCidade: document.getElementById('clienteCidade').value,
        clienteEstado: document.getElementById('clienteEstado').value,
        clienteCEP: document.getElementById('clienteCEP').value,
        carrinho: [...sistema.carrinho],
        status: 'Aguardando aprovação'
    };
    sistema.orcamentos.push(orc);
    salvarNoNavegador();
    atualizarListaOrcamentos();
    alert('Orçamento salvo!');
}

function aprovarOrcamento(numero){
    const orc = sistema.orcamentos.find(o=>o.numero===numero);
    if(!orc) return alert('Orçamento não encontrado');
    orc.status='Aprovado';
    salvarNoNavegador();

    // Gerar pedido automático
    const pedidoNumero = gerarNumeroPedido();
    const pedido = {
        numero: pedidoNumero,
        dataAprovacao: dataHoje(),
        clienteNome: orc.clienteNome,
        clienteEndereco: orc.clienteEndereco,
        clienteNumero: orc.clienteNumero,
        clienteBairro: orc.clienteBairro,
        clienteCidade: orc.clienteCidade,
        clienteEstado: orc.clienteEstado,
        clienteCEP: orc.clienteCEP,
        carrinho: [...orc.carrinho],
        status: 'Produção'
    };
    sistema.pedidos.push(pedido);
    salvarNoNavegador();
    atualizarListaOrcamentos();
    atualizarListaPedidos();
    alert('Orçamento aprovado e pedido gerado!');
}

// ===============================
// WhatsApp
// ===============================
function enviarWhatsApp(){
    const cliente = document.getElementById('clienteWhatsApp').value.replace(/\D/g,'');
    if(!cliente) return alert('Informe WhatsApp do cliente');
    let msg = `Olá ${document.getElementById('clienteNome').value}, segue seu orçamento:\n`;
    sistema.carrinho.forEach(item=>{
        msg+=`${item.nome} x${item.qtd} (${item.medida}) - ${formatarMoeda(item.total)}\n`;
    });
    msg+=`Total: ${document.getElementById('totalGeral').textContent}`;
    const url = `https://wa.me/55${cliente}?text=${encodeURIComponent(msg)}`;
    window.open(url,'_blank');
}

// ===============================
// PDF DANFE (Orçamento e Pedido)
// ===============================
async function gerarPDFOrcamento(){
    await gerarPDF(true);
}

async function gerarPDFPedido(){
    await gerarPDF(false);
}

async function gerarPDF(isOrcamento){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p','mm','a4');
    const dataObj = isOrcamento ? sistema.orcamentos[sistema.orcamentos.length-1] : sistema.pedidos[sistema.pedidos.length-1];
    let y = 10;

    // Cabeçalho
    doc.setFontSize(14); doc.text("Prestige Comunicação Visual",10,y); y+=6;
    doc.setFontSize(10); doc.text("Rua Brasil, 304 - Rudge Ramos - São Bernardo do Campo - SP | PIX: 11922018290",10,y); y+=10;

    // Dados
    doc.setFontSize(12); doc.text(`${isOrcamento?'ORÇAMENTO':'PEDIDO'} Nº: ${dataObj.numero}`,10,y); y+=5;
    doc.setFontSize(10); doc.text(`Data: ${dataObj.dataAprovacao||dataObj.data}`,10,y); y+=5;
    doc.text(`Cliente: ${dataObj.clienteNome}`,10,y); y+=5;
    doc.text(`Endereço: ${dataObj.clienteEndereco} ${dataObj.clienteNumero}`,10,y); y+=5;
    doc.text(`Bairro: ${dataObj.clienteBairro}`,10,y); y+=5;
    doc.text(`Cidade/UF: ${dataObj.clienteCidade} / ${dataObj.clienteEstado}`,10,y); y+=5;
    doc.text(`CEP: ${dataObj.clienteCEP}`,10,y); y+=10;

    // Tabela
    doc.setFontSize(10);
    doc.line(10,y,200,y); y+=2;
    doc.text("Produto",10,y); doc.text("Qtd",120,y); doc.text("Medida",140,y); doc.text("Valor Unit.",160,y); doc.text("Total",190,y,{align:"right"}); y+=2;
    doc.line(10,y,200,y); y+=5;

    let totalGeral = 0;
    dataObj.carrinho.forEach(item=>{
        const valorUnit = item.total/item.qtd;
        totalGeral+=item.total;
        doc.text(item.nome,10,y);
        doc.text(String(item.qtd),120,y);
        doc.text(item.medida,140,y);
        doc.text(formatarMoeda(valorUnit),160,y);
        doc.text(formatarMoeda(item.total),190,y,{align:"right"});
        y+=7;
    });

    doc.line(10,y,200,y); y+=5;
    doc.setFontSize(12); doc.text(`TOTAL GERAL: ${formatarMoeda(totalGeral)}`,200,y,{align:"right"}); y+=15;
    doc.setFontSize(10); if(isOrcamento) doc.text("Prazo do orçamento: 7 dias úteis",10,y); y+=10;

    const qr = await gerarQRCodePIX(totalGeral);
    doc.addImage(qr,'PNG',150,y,50,50); y+=55;
    doc.text("Deus Seja Sempre Louvado! Tudo posso Naquele que me Fortalece!",105,y,{align:"center"});
    doc.save(`${isOrcamento?'orcamento':'pedido'}_${dataObj.numero}.pdf`);
}

async function gerarQRCodePIX(valor){
    return new Promise(resolve=>{
        const chavePIX="11922018290";
        const payload=`00020126580014BR.GOV.BCB.PIX0136${chavePIX}52040000530398654${Number(valor).toFixed(2)}5802BR5920Prestige Comunicacao6009Sao Paulo62070503***6304`;
        const div=document.createElement("div");
        new QRCode(div,{text:payload,width:150,height:150});
        setTimeout(()=>{ resolve(div.querySelector("img").src); },500);
    });
}
