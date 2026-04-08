const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurar transportador do Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verificar conexão
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Erro na configuração do email:', error);
    } else {
        console.log('✅ Servidor de email pronto para envio');
    }
});

/**
 * Enviar orçamento por email
 * @param {string} destinatario - Email do cliente
 * @param {object} dados - Dados do orçamento
 * @param {string} pdfBase64 - PDF em base64 (opcional)
 */
async function enviarOrcamentoEmail(destinatario, dados, pdfBase64 = null) {
    try {
        const assunto = `📄 Prestige - Seu Orçamento nº ${dados.numero}`;
        
        const corpo = `
            Olá ${dados.clienteNome || 'cliente'},

            Segue seu orçamento da Prestige Comunicação Visual.

            📋 ORÇAMENTO Nº: ${dados.numero}
            📅 Data: ${dados.data}
            💰 Total: R$ ${dados.total.toFixed(2)}
            📝 Status: ${dados.status || 'Aguardando aprovação'}

            Para aprovar este orçamento, entre em contato conosco:
            📞 (11) 92201-8290
            📧 prestigecvisual@gmail.com

            ---
            Prestige Comunicação Visual
            Rua Brasil, 304 - Rudge Ramos - São Bernardo do Campo - SP
            Deus Seja Sempre Louvado! Tudo posso Naquele que me Fortalece!
        `;

        const mailOptions = {
            from: `"Prestige Comunicação Visual" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: assunto,
            text: corpo,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px;">
                    <h2 style="color: #1e293b;">Prestige Comunicação Visual</h2>
                    <h3>Orçamento nº ${dados.numero}</h3>
                    <p><strong>Cliente:</strong> ${dados.clienteNome}</p>
                    <p><strong>Data:</strong> ${dados.data}</p>
                    <p><strong>Total:</strong> <span style="color: #10b981; font-size: 1.2em;">R$ ${dados.total.toFixed(2)}</span></p>
                    
                    <h4>Itens do Orçamento:</h4>
                    <table style="width:100%; border-collapse: collapse;">
                        <thead>
                            <tr><th style="border:1px solid #ddd; padding:8px;">Produto</th>
                                <th style="border:1px solid #ddd; padding:8px;">Qtd</th>
                                <th style="border:1px solid #ddd; padding:8px;">Medida</th>
                                <th style="border:1px solid #ddd; padding:8px;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dados.itens ? dados.itens.map(item => `
                                <tr>
                                    <td style="border:1px solid #ddd; padding:8px;">${item.nome}</td>
                                    <td style="border:1px solid #ddd; padding:8px;">${item.qtd}</td>
                                    <td style="border:1px solid #ddd; padding:8px;">${item.medida || '-'}</td>
                                    <td style="border:1px solid #ddd; padding:8px;">R$ ${item.total.toFixed(2)}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="4">Nenhum item</td></tr>'}
                        </tbody>
                    </table>

                    <hr>
                    <p style="text-align: center; font-size: 0.9em;">
                        Rua Brasil, 304 - Rudge Ramos - São Bernardo do Campo - SP<br>
                        (11) 92201-8290<br>
                        <em>Deus Seja Sempre Louvado! Tudo posso Naquele que me Fortalece!</em>
                    </p>
                </div>
            `
        };

        // Adicionar PDF anexo se fornecido
        if (pdfBase64) {
            mailOptions.attachments = [{
                filename: `orcamento_${dados.numero}.pdf`,
                content: pdfBase64,
                encoding: 'base64'
            }];
        }

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email enviado para ${destinatario}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Erro ao enviar email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Enviar pedido por email
 * @param {string} destinatario - Email do cliente
 * @param {object} dados - Dados do pedido
 */
async function enviarPedidoEmail(destinatario, dados) {
    try {
        const assunto = `🏭 Prestige - Seu Pedido nº ${dados.numero} foi ${dados.status}`;
        
        const corpo = `
            Olá ${dados.clienteNome || 'cliente'},

            Seu pedido na Prestige Comunicação Visual foi ${dados.status}.

            📦 PEDIDO Nº: ${dados.numero}
            📅 Data de criação: ${dados.dataCriacao}
            📅 Última atualização: ${dados.dataAtualizacao || dados.dataCriacao}
            💰 Valor total: R$ ${dados.total.toFixed(2)}
            📍 Status atual: ${dados.status}

            Para acompanhar seu pedido, entre em contato conosco:
            📞 (11) 92201-8290
            📧 prestigecvisual@gmail.com

            ---
            Prestige Comunicação Visual
            Rua Brasil, 304 - Rudge Ramos - São Bernardo do Campo - SP
        `;

        const mailOptions = {
            from: `"Prestige Comunicação Visual" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: assunto,
            text: corpo,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px;">
                    <h2 style="color: #1e293b;">Prestige Comunicação Visual</h2>
                    <h3>Pedido nº ${dados.numero}</h3>
                    
                    <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 10px 0;">
                        <p><strong>Status:</strong> ${dados.status}</p>
                        <p><strong>Cliente:</strong> ${dados.clienteNome}</p>
                        <p><strong>Data de criação:</strong> ${dados.dataCriacao}</p>
                        <p><strong>Total:</strong> <span style="color: #10b981; font-size: 1.2em;">R$ ${dados.total.toFixed(2)}</span></p>
                    </div>

                    <hr>
                    <p style="text-align: center; font-size: 0.9em;">
                        Rua Brasil, 304 - Rudge Ramos - São Bernardo do Campo - SP<br>
                        (11) 92201-8290
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email de pedido enviado para ${destinatario}`);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Erro ao enviar email de pedido:', error);
        return { success: false, error: error.message };
    }
}

module.exports = { enviarOrcamentoEmail, enviarPedidoEmail };
