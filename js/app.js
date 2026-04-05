<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prestige Comunicação Visual - Sistema de Pedidos</title>
    <link rel="stylesheet" href="css/style.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="js/db.js"></script>
</head>
<body style="background-color: #f1f5f9; font-family: sans-serif; margin: 0;">

    <header style="background: #1e293b; color: white; padding: 30px 0; border-bottom: 4px solid #3b82f6; text-align: center;">
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
            <img src="img/logo.png" alt="Prestige Logo" style="max-height: 90px; width: auto; margin-bottom: 10px;">
            <h1 style="margin: 0; font-size: 1.5em; color: #3b82f6;">PRESTIGE COMUNICAÇÃO VISUAL</h1>
            <p style="margin: 5px 0; font-size: 0.9em; opacity: 0.9;">
                Rua Brasil, 304 - Rudge Ramos - São Bernardo do Campo - SP<br>
                Contato: (11) 92201-82909
            </p>
            <div style="margin-top: 15px; font-size: 0.8em; color: #94a3b8;">
                Ref. Orçamento: <span id="numeroOrcamento" style="color: white; font-weight: bold;">--/--</span>
            </div>
        </div>
    </header>

    <main style="max-width: 1200px; margin: 20px auto; padding: 20px; display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 20px;">
        
        <div class="col-esquerda">
            <section style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ddd;">
                <h3 style="margin-top: 0;">+ Cadastrar Novo Produto na Tabela</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <input type="text" id="novoProdNome" placeholder="Nome do Item" style="grid-column: span 2; padding: 10px;">
                    <input type="number" id="novoProdPreco" placeholder="Preço (R$)" style="padding: 10px;">
                    <select id="novoProdTipo" style="padding: 10px;">
                        <option value="m2">Por m²</option>
                        <option value="unid">Por Unidade</option>
                    </select>
                    <button onclick="cadastrarNovoProduto()" style="grid-column: span 2; background: #10b981; color: white; border: none; padding: 12px; cursor: pointer; border-radius: 4px;">Salvar na Tabela</button>
                </div>
            </section>

            <section style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ddd;">
                <h3 style="margin-top: 0;">Dados do Cliente</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <input type="text" id="clienteNome" placeholder="Nome / Razão Social" style="grid-column: span 2; padding: 10px;">
                    <input type="text" id="clienteDoc" placeholder="CPF / CNPJ" style="padding: 10px;">
                    <input type="text" id="clienteCEP" oninput="calcularTotais()" placeholder="CEP" style="padding: 10px;">
                    <input type="text" id="clienteEndereco" placeholder="Rua/Avenida, Bairro, Cidade" style="grid-column: span 2; padding: 10px;">
                </div>
            </section>

            <section style="background: #eff6ff; padding: 20px; border-radius: 8px; border: 1px solid #3b82f6;">
                <h3 style="margin-top: 0; color: #1e40af;">Calculadora de Pedido</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <select id="produto" onchange="toggleMedidas()" style="grid-column: span 2; padding: 10px;"></select>
                    <div id="medidasInput" style="grid-column: span 2; display: flex; gap: 10px;">
                        <input type="number" id="largura" placeholder="Largura (cm)" value="100" style="flex: 1; padding: 10px;">
                        <input type="number" id="altura" placeholder="Altura (cm)" value="100" style="flex: 1; padding: 10px;">
                    </div>
                    <input type="number" id="quantidade" placeholder="Qtd" value="1" style="grid-column: span 2; padding: 10px;">
                    <button onclick="adicionarItem()" style="grid-column: span 2; background: #3b82f6; color: white; border: none; padding: 12px; cursor: pointer; border-radius: 4px;">Adicionar ao Carrinho</button>
                </div>
            </section>
        </div>

        <div class="col-direita">
            <section style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; position: sticky; top: 20px;">
                <h3 style="margin-top: 0;">Resumo do Orçamento</h3>
                <div id="listaItens" style="min-height: 100px; border-bottom: 1px solid #eee; margin-bottom: 15px;">
                    </div>
                
                <label style="font-size: 0.8em; color: #666;">Forma de Pagamento:</label>
                <select id="formaPagamento" onchange="calcularTotais()" style="width: 100%; padding: 10px; margin-bottom: 15px;">
                    <option value="pix">PIX / Dinheiro (-5%)</option>
                    <option value="debito" selected>Débito</option>
                    <option value="credito_3x">Crédito 3x (+6%)</option>
                    <option value="credito_5x">Crédito 5x (+7%)</option>
                </select>

                <div style="background: #f8fafc; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
                    <p style="display: flex; justify-content: space-between; margin: 5px 0;"><span>Frete:</span> <span>R$ <span id="frete">0.00</span></span></p>
                    <p style="display: flex; justify-content: space-between; margin: 5px 0;"><span>Taxa/Desc:</span> <span>R$ <span id="desconto">0.00</span></span></p>
                    <hr>
                    <h4 style="display: flex; justify-content: space-between; margin: 10px 0;"><span>Total Geral:</span> <span>R$ <span id="totalGeral">0.00</span></span></h4>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button onclick="salvarOrcamento()" style="background: #64748b; color: white; border: none; padding: 12px; cursor: pointer; border-radius: 4px;">Salvar</button>
                    <button id="gerarPDF" style="background: #ef4444; color: white; border: none; padding: 12px; cursor: pointer; border-radius: 4px;">Gerar PDF</button>
                </div>
            </section>
        </div>
    </main>

    <script src="js/app.js"></script>
</body>
</html>
