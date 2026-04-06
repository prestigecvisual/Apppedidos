// ========================================================
// APP.JS - PRESTIGE COMUNICAÇÃO VISUAL
// ========================================================

// ===============================
// 🚀 INICIALIZAÇÃO
// ===============================
window.onload = () => { 
    try {
        carregarDoNavegador();

        // 🔥 Produtos
        popularProdutos();

        const select = document.getElementById("produto");
        if (select && select.options.length > 0) select.selectedIndex = 0;

        toggleMedidas();

        atualizarDataRef();
        atualizarListaOrcamentos();
        atualizarListaPedidos();
        calcularTotais();

    } catch (erro) {
        console.error("Erro ao iniciar sistema:", erro);
    }
};

// ===============================
// 📌 FORMATAÇÃO E UTILS
// ===============================
function formatarMoeda(valor){
    return Number(valor).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}

function dataHoje(){
    const hoje = new Date();
    return `${String(hoje.getDate()).padStart(2,'0')}/${String(hoje.getMonth()+1).padStart(2,'0')}/${hoje.getFullYear()}`;
}

function gerarNumeroDocumento(tipo) {
    const hoje = new Date();
    const dd = String(hoje.getDate()).padStart(2,'0');
    const mm = String(hoje.getMonth()+1).padStart(2,'0');
    const yyyy = hoje.getFullYear();

    if(tipo === "orcamento") {
        sistema.contadorOrcamento = (sistema.contadorOrcamento || 0) + 1;
        salvarNoNavegador();
        return `${dd}${mm}${yyyy}${sistema.contadorOrcamento}`;
    }
    if(tipo === "pedido") {
        sistema.contadorPedido = (sistema.contadorPedido || 0) + 1;
        salvarNoNavegador();
        return `${dd}${mm}${yyyy}${sistema.contadorPedido}`;
    }
}

// ===============================
// 📦 PRODUTOS
// ===============================
function cadastrarNovoProduto(){
    const nome = document.getElementById("novoProdutoNome").value.trim();
    const preco = Number(document.getElementById("novoProdutoPreco").value);
    if(nome && preco){
        sistema.produtos.push({nome, preco, tipo:"unid"});
        salvarNoNavegador();
        popularProdutos();
        document.getElementById("novoProdutoNome").value = "";
        document.getElementById("novoProdutoPreco").value = "";
    }
}

function popularProdutos(){
    const select = document.getElementById("produto");
    select.innerHTML = '<option value="">Selecione o produto</option>';
    sistema.produtos.forEach((p,i)=>{
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = `${p.nome} - ${formatarMoeda(p.preco)} (${p.tipo})`;
        select.appendChild(opt);
    });
}

// ===============================
// ⚖️ MEDIDAS
// ===============================
function toggleMedidas(){
    const select = document.getElementById("produto");
    const index = select.value;
    const produto = sistema.produtos[index];
    if(produto && produto.tipo === "m2"){
        document.getElementById("largura").disabled = false;
        document.getElementById("altura").disabled = false;
    } else {
        document.getElementById("largura").disabled = true;
        document.getElementById("altura").disabled = true;
    }
}

// ===============================
// 🧮 CÁLCULO DE PRODUTOS
// ===============================
function calcularProduto(){
    const select = document.getElementById("produto");
    const index = select.value;
    const qtd = Number(document.getElementById("quantidade").value);
    const largura = Number(document.getElementById("largura").value)/100;
    const altura = Number(document.getElementById("altura").value)/100;

    if(index === "") return 0;

    const produto = sistema.produtos[index];
    let total = produto.preco * qtd;
    if(produto.tipo==="m2") total = produto.preco * largura * altura * qtd;
    return total;
}

// ===============================
// 📄 QR CODE PIX
// ===============================
function gerarQRCodePIX(valor){
    return new Promise(resolve=>{
        const chavePIX="11922018290";
        const payload=`00020126580014BR.GOV.BCB.PIX0136${chavePIX}52040000530398654${Number(valor).toFixed(2)}5802BR5920Prestige Comunicacao6009Sao Paulo62070503***6304`;

        const div = document.createElement("div");
        new QRCode(div,{text:payload,width:150,height:150});
        setTimeout(()=>resolve(div.querySelector("img").src),500);
    });
}

// ===============================
// 🏠 CEP / FRETE
// ===============================
async function buscarCEP(cep){
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    const resp = await fetch(url);
    const data = await resp.json();
    document.getElementById("clienteEndereco").value = data.logradouro || "";
    document.getElementById("clienteBairro").value = data.bairro || "";
    document.getElementById("clienteCidade").value = data.localidade || "";
    document.getElementById("clienteEstado").value = data.uf || "";
}

function calcularFrete(){
    const cep = document.getElementById("clienteCEP").value;
    const cidade = document.getElementById("clienteCidade").value.toLowerCase();
    const estado = document.getElementById("clienteEstado").value.toLowerCase();

    if(cidade.includes("são paulo") && estado==="sp") return 0;
    if(["guarulhos","osasco","santo andré","são bernardo do campo","são caetano do sul"].some(c=>cidade.includes(c))) return 20;
    return 50; // exterior ou interior
}

// ===============================
// 🛒 CARRINHO
// ===============================
function adicionarItem(){
    const select = document.getElementById("produto");
    const index = select.value;
    if(index==="") return alert("Selecione um produto");

    const produto = sistema.produtos[index];
    const qtd = Number(document.getElementById("quantidade").value);
    const largura = Number(document.getElementById("largura").value)/100;
    const altura = Number(document.getElementById("altura").value)/100;
    let total = produto.preco * qtd;
    if(produto.tipo==="m2") total = produto.preco * largura * altura * qtd;

    sistema.carrinho.push({
        nome: produto.nome,
        qtd,
        medida: produto.tipo==="m2"? `${document.getElementById("largura").value}x${document.getElementById("altura").value} cm`:"",
        total
    });
    salvarNoNavegador();
    atualizarCarrinho();
}

function atualizarCarrinho(){
    const div = document.getElementById("listaItens");
    div.innerHTML="";
    sistema.carrinho.forEach((item,i)=>{
        const el = document.createElement("div");
        el.textContent=`${item.nome} - Qtd: ${item.qtd} - Medida: ${item.medida} - Total: ${formatarMoeda(item.total)}`;
        div.appendChild(el);
    });
}

// ===============================
// 💰 TOTAIS
// ===============================
function calcularTotais(){
    const totalItens = sistema.carrinho.reduce((acc,i)=>acc+i.total,0);
    const frete = calcularFrete();
    const totalGeral = totalItens + frete;
    return {totalItens,frete,totalGeral};
}

// ===============================
// 📅 DATA / ORÇAMENTO
// ===============================
function atualizarDataRef(){
    document.getElementById("resultado").textContent=`Data: ${dataHoje()}`;
}

function salvarOrcamento(){
    const cliente = document.getElementById("clienteNome").value;
    const cep = document.getElementById("clienteCEP").value;

    const total = calcularTotais().totalGeral;
    const numero = gerarNumeroDocumento("orcamento");

    sistema.orcamentos.push({
        numero,
        dataCriacao: dataHoje(),
        cliente,
        clienteEndereco: document.getElementById("clienteEndereco").value,
        clienteNumero: document.getElementById("clienteNumero")?.value || "",
        clienteBairro: document.getElementById("clienteBairro")?.value || "",
        clienteCidade: document.getElementById("clienteCidade")?.value || "",
        clienteEstado: document.getElementById("clienteEstado")?.value || "",
        clienteCEP: cep,
        status: "Aguardando aprovação",
        itens: [...sistema.carrinho],
        total
    });

    sistema.carrinho = [];
    salvarNoNavegador();
    atualizarListaOrcamentos();
}

// ===============================
// ✅ APROVAÇÃO / PEDIDOS
// ===============================
function aprovarOrcamento(index){
    const o = sistema.orcamentos[index];
    o.status = "Aprovado";
    o.dataAprovacao = dataHoje();

    // Cria pedido automaticamente
    const numeroPedido = gerarNumeroDocumento("pedido");
    sistema.pedidos.push({...o, numero: numeroPedido, status:"Em Produção"});
    salvarNoNavegador();
    atualizarListaOrcamentos();
    atualizarListaPedidos();
}

// ===============================
// 📞 WHATSAPP
// ===============================
function enviarWhatsApp(index,tipo="orcamento"){
    const doc = tipo==="orcamento"? sistema.orcamentos[index] : sistema.pedidos[index];
    let msg = `Olá ${doc.cliente}, segue seu ${tipo} nº ${doc.numero} total ${formatarMoeda(doc.total)}.`;
    const url = `https://api.whatsapp.com/send?phone=5511922018290&text=${encodeURIComponent(msg)}`;
    window.open(url,"_blank");
}

// ===============================
// 📝 LISTAS / STATUS
// ===============================
function atualizarListaOrcamentos(){
    const div = document.getElementById("listaOrcamentos");
    div.innerHTML="";
    sistema.orcamentos.forEach((o,i)=>{
        const el = document.createElement("div");
        el.innerHTML=`<b>${o.numero}</b> - ${o.cliente} - ${o.status} <button onclick="aprovarOrcamento(${i})">Aprovar</button> <button onclick="enviarWhatsApp(${i},'orcamento')">WhatsApp</button>`;
        div.appendChild(el);
    });
}

function atualizarListaPedidos(){
    const div = document.getElementById("listaPedidos");
    div.innerHTML="";
    sistema.pedidos.forEach((p,i)=>{
        const el = document.createElement("div");
        el.innerHTML=`<b>${p.numero}</b> - ${p.cliente} - ${p.status} <button onclick="enviarWhatsApp(${i},'pedido')">WhatsApp</button>`;
        div.appendChild(el);
    });
}

function proximoStatus(index){
    const p = sistema.pedidos[index];
    const statuses = ["Em Produção","Andamento","Entregue"];
    const idx = statuses.indexOf(p.status);
    p.status = statuses[(idx+1)%statuses.length];
    salvarNoNavegador();
    atualizarListaPedidos();
}
