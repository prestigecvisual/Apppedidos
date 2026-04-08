// ==========================================
// WHATSAPP
// ==========================================
function enviarWhatsApp() {
    const numero = "5511922018290";

    const cliente = document.getElementById("clienteNome").value;
    const total = document.getElementById("totalGeral").innerText;

    const msg = `Olá ${cliente}, segue seu orçamento.\nTotal: R$ ${total}`;

    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`);
}

// ==========================================
// EMAIL
// ==========================================
function enviarEmail() {
    const cliente = document.getElementById("clienteNome").value;
    const total = document.getElementById("totalGeral").innerText;

    const assunto = "Orçamento Prestige";
    const corpo = `Olá ${cliente}, segue seu orçamento. Total: R$ ${total}`;

    window.location.href =
        `mailto:prestigecvisual@gmail.com?subject=${assunto}&body=${encodeURIComponent(corpo)}`;
}
