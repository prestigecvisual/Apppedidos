const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Configurar transportador de e-mail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verificar conexão
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Erro na configuração do e-mail:", error);
    } else {
        console.log("✅ Servidor de e-mail pronto para envio");
    }
});

// ============================================
// ROTA: ENVIAR ORÇAMENTO
// ============================================
app.post("/api/enviar-orcamento", async (req, res) => {
    const { destinatario, dados, pdfBase64 } = req.body;
    
    if (!destinatario || !dados) {
        return res.status(400).json({ error: "Dados incompletos" });
    }
    
    try {
        // Gerar HTML do e-mail
        const htmlEmail = gerarHTMLOrcamento(dados);
        
        const mailOptions = {
            from: `"Prestige Comunicação Visual" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: `📄 Prestige - Seu Orçamento nº ${dados.numero}`,
            html: htmlEmail,
            text: gerarTextoOrcamento(dados)
        };
        
        // Adicionar PDF se fornecido
        if (pdfBase64) {
            mailOptions.attachments = [{
                filename: `orcamento_${dados.numero}.pdf`,
                content: pdfBase64,
                encoding: "base64"
            }];
        }
        
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ E-mail enviado para ${destinatario}: ${info.messageId}`);
        
        res.json({ success: true, messageId: info.messageId });
    } catch (error) {
        console.error("❌ Erro ao enviar e-mail:", error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ROTA: ENVIAR PEDIDO
// ============================================
app.post("/api/enviar-pedido", async (req, res) => {
    const { destinatario, dados } = req.body;
    
    if (!destinatario || !dados) {
        return res.status(400).json({ error: "Dados incompletos" });
    }
    
    try {
        const htmlEmail = gerarHTMLPedido(dados);
        
        const mailOptions = {
            from: `"Prestige Comunicação Visual" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: `🏭 Prestige - Seu Pedido nº ${dados.numero} - ${dados.status}`,
            html: htmlEmail,
            text: dados.corpo || ""
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ E-mail de pedido enviado para ${destinatario}`);
        
        res.json({ success: true, messageId: info.messageId });
    } catch (error) {
        console.error("❌ Erro ao enviar e-mail de pedido:", error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// FUNÇÃO: GERAR HTML DO ORÇAMENTO
// ============================================
function gerarHTMLOrcamento(dados) {
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e293b; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Prestige Comunicação Visual</h2>
            <p style="margin: 5px 0 0;">Sistema de Orçamentos</p>
        </div>
        
        <div style="padding: 20px;">
            <h3>Olá ${dados.clienteNome}!</h3>
            <p>Segue seu orçamento da Prestige Comunicação Visual:</p>
            
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p><strong>📋 ORÇAMENTO Nº:</strong> ${dados.numero}</p>
                <p><strong>📅 Data:</strong> ${dados.data}</p>
                <p><strong>💰 Total:</strong> <span style="font-size: 1.2em; color: #10b981;">R$ ${dados.total.toFixed(2)}</span></p>
            </div>
            
            <h4>Itens do Orçamento:</h4>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr><th style="border:1px solid #ddd; padding:8px; text-align:left;">Produto</th>
                        <th style="border:1px solid #ddd; padding:8px; text-align:center;">Qtd</th>
                        <th style="border:1px solid #ddd; padding:8px; text-align:right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${dados.itens.map(item => `
                    <tr>
                        <td style="border:1px solid #ddd; padding:8px;">${item.nome}${item.medida && item.medida !== "--" ? `<br><small>${item.medida}</small>` : ""}</td>
                        <td style="border:1px solid #ddd; padding:8px; text-align:center;">${item.qtd}</td>
                        <td style="border:1px solid #ddd; padding:8px; text-align:right;">R$ ${item.total.toFixed(2)}</td>
                    </tr>
                    `).join("")}
                </tbody>
                <tfoot>
                    <tr style="background:#f0f0f0;">
                        <td colspan="2" style="border:1px solid #ddd; padding:8px; text-align:right;"><strong>TOTAL</strong></td>
                        <td style="border:1px solid #ddd; padding:8px; text-align:right;"><strong>R$ ${dados.total.toFixed(2)}</strong></td>
                    </tr>
                </tfoot>
            </table>
            
            <p style="margin-top: 20px;"><strong>Forma de Pagamento:</strong> ${getFormaPagamentoTexto(dados.formaPagamento)}</p>
            <p><strong>Validade:</strong> ${dados.validade} dias úteis</p>
            
            <hr style="margin: 20px 0;">
            
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; text-align: center;">
                <p><strong>🔑 Pague com PIX</strong></p>
                <p>Chave PIX: <strong>${dados.chavePIX || "11922018290"}</strong></p>
                <p style="font-size: 0.9em;">Escaneie o QR Code no documento em anexo</p>
            </div>
            
            <p style="text-align: center; margin-top: 30px; font-style: italic;">
                "Deus Seja Sempre Louvado! Tudo posso Naquele que me Fortalece!"
            </p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center; font-size: 0.9em;">
                <p>${dados.empresa?.endereco || "Rua Brasil, 304 - Rudge Ramos"}<br>
                ${dados.empresa?.cidade || "São Bernardo do Campo"} - SP<br>
                📞 ${dados.empresa?.telefone || "(11) 92201-8290"} | 📧 ${dados.empresa?.email || "prestigecvisual@gmail.com"}</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

function gerarTextoOrcamento(dados) {
    let texto = `PRESTIGE COMUNICAÇÃO VISUAL\n`;
    texto += `${"=".repeat(40)}\n\n`;
    texto += `Olá ${dados.clienteNome},\n\n`;
    texto += `Orçamento nº ${dados.numero}\n`;
    texto += `Data: ${dados.data}\n`;
    texto += `Total: R$ ${dados.total.toFixed(2)}\n\n`;
    texto += `ITENS:\n`;
    dados.itens.forEach(item => {
        texto += `- ${item.nome}: ${item.qtd}x = R$ ${item.total.toFixed(2)}\n`;
    });
    texto += `\nForma de Pagamento: ${getFormaPagamentoTexto(dados.formaPagamento)}\n`;
    texto += `Chave PIX: ${dados.chavePIX || "11922018290"}\n\n`;
    texto += `Deus Seja Sempre Louvado!`;
    return texto;
}

function getFormaPagamentoTexto(forma) {
    const formas = {
        "pix": "PIX (sem juros)",
        "debito": "Débito",
        "credito_1x": "Crédito 1x (+1,5%)",
        "credito_3x": "Crédito 3x (+6%)",
        "credito_5x": "Crédito 5x (+7%)"
    };
    return formas[forma] || forma;
}

function gerarHTMLPedido(dados) {
    // Similar ao gerarHTMLOrcamento, mas para pedidos
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e293b; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Prestige Comunicação Visual</h2>
            <p style="margin: 5px 0 0;">Atualização do Pedido</p>
        </div>
        <div style="padding: 20px;">
            ${dados.corpo ? dados.corpo.replace(/\n/g, "<br>") : `<p>Olá ${dados.clienteNome}, seu pedido foi atualizado para: ${dados.status}</p>`}
        </div>
    </body>
    </html>
    `;
}

app.listen(PORT, () => {
    console.log(`🚀 Servidor Prestige rodando na porta ${PORT}`);
    console.log(`📧 E-mail configurado: ${process.env.EMAIL_USER}`);
});
