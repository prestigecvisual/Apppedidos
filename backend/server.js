const express = require('express');
const cors = require('cors');
const { enviarOrcamentoEmail, enviarPedidoEmail } = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rota para envio de orçamento
app.post('/api/enviar-orcamento', async (req, res) => {
    const { destinatario, dados, pdfBase64 } = req.body;

    if (!destinatario || !dados) {
        return res.status(400).json({ error: 'Dados incompletos' });
    }

    const resultado = await enviarOrcamentoEmail(destinatario, dados, pdfBase64);
    
    if (resultado.success) {
        res.json({ success: true, messageId: resultado.messageId });
    } else {
        res.status(500).json({ error: resultado.error });
    }
});

// Rota para envio de pedido
app.post('/api/enviar-pedido', async (req, res) => {
    const { destinatario, dados } = req.body;

    if (!destinatario || !dados) {
        return res.status(400).json({ error: 'Dados incompletos' });
    }

    const resultado = await enviarPedidoEmail(destinatario, dados);
    
    if (resultado.success) {
        res.json({ success: true, messageId: resultado.messageId });
    } else {
        res.status(500).json({ error: resultado.error });
    }
});

// Rota de teste
app.get('/api/teste', (req, res) => {
    res.json({ message: 'Servidor Prestige funcionando!' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor Prestige rodando na porta ${PORT}`);
    console.log(`📧 Email configurado: ${process.env.EMAIL_USER || 'prestigecvisual@gmail.com'}`);
});
