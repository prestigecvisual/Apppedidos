// ============================================
// DANFE CORE - MÓDULO PRINCIPAL
// ============================================

const DANFE_CONFIG = {
    // Dados da empresa (Prestige)
    empresa: {
        nome: "Prestige Comunicação Visual",
        nomeCompleto: "Isaac da Silva Bezerra",
        cnpjCpf: "14260367870",
        endereco: "Rua Brasil, 304",
        bairro: "Rudge Ramos",
        cidade: "São Bernardo do Campo",
        estado: "SP",
        cep: "09655-000",
        telefone: "(11) 92201-8290",
        email: "prestigecvisual@gmail.com",
        chavePIX: "11922018290",
        tipoChavePIX: "telefone" // telefone, cpf, cnpj, email, aleatorio
    },
    
    // Configurações do DANFE
    danfe: {
        serie: "001",
        viaCliente: true,      // Exibir "Via Cliente"
        prazoValidade: 7,      // Dias úteis de validade do orçamento
        mostrarQRCode: true,
        mostrarCodigoBarras: false,
        mostrarFraseFe: true
    },
    
    // Configurações de frete
    frete: {
        regioes: {
            "capital": { prefixos: ["010", "011", "012", "013", "014", "015"], valor: 0 },
            "grande_sp": { prefixos: ["08", "09"], valor: 15 },
            "interior": { prefixos: [], valor: 25, padrao: true }
        }
    }
};

// ============================================
// FUNÇÃO: GERAR PAYLOAD PIX COMPLETO (PADRÃO BACEN)
// ============================================
function gerarPayloadPIX(valor, identificador = "") {
    const chave = DANFE_CONFIG.empresa.chavePIX;
    const nomeEmpresa = DANFE_CONFIG.empresa.nome;
    const cidade = DANFE_CONFIG.empresa.cidade.replace(/\s/g, "");
    
    // Mapear tipo de chave PIX
    let tipoChave = "01"; // 01 = CPF, 02 = CNPJ, 03 = Telefone, 04 = Email, 05 = Aleatório
    if (DANFE_CONFIG.empresa.tipoChavePIX === "telefone") tipoChave = "03";
    else if (DANFE_CONFIG.empresa.tipoChavePIX === "cpf") tipoChave = "01";
    else if (DANFE_CONFIG.empresa.tipoChavePIX === "cnpj") tipoChave = "02";
    else if (DANFE_CONFIG.empresa.tipoChavePIX === "email") tipoChave = "04";
    
    // Montar payload conforme padrão BACEN
    let payload = "000201";                              // Payload format indicator
    payload += "26";                                     // Point of Initiation Method
    payload += "00";                                     // GUI
    payload += "14";                                     // BR.GOV.BCB.PIX
    payload += "BR.GOV.BCB.PIX";
    payload += tipoChave;                                // Tipo de chave
    payload += String(chave.length).padStart(2, "0");
    payload += chave;
    payload += "52040000";                               // Merchant Category Code
    payload += "5303986";                                // Transaction currency (BRL)
    
    // Valor com 2 casas decimais
    const valorFormatado = Number(valor).toFixed(2);
    const valorSemPonto = valorFormatado.replace(".", "");
    payload += "54" + String(valorSemPonto.length).padStart(2, "0") + valorSemPonto;
    
    payload += "5802BR";                                 // Country code
    payload += "59" + String(nomeEmpresa.length).padStart(2, "0") + nomeEmpresa;  // Merchant name
    payload += "60" + String(cidade.length).padStart(2, "0") + cidade;            // Merchant city
    
    if (identificador) {
        payload += "62";                                 // Additional data field
        payload += "05" + String(identificador.length).padStart(2, "0") + identificador;
    }
    
    payload += "6304";                                   // CRC16 field
    
    // Calcular CRC16 (função abaixo)
    const crc = calcularCRC16(payload);
    payload += crc;
    
    return payload;
}

// ============================================
// FUNÇÃO: CALCULAR CRC16 PARA PIX
// ============================================
function calcularCRC16(payload) {
    const polinomio = 0x1021;
    let resultado = 0xFFFF;
    
    for (let i = 0; i < payload.length; i++) {
        resultado ^= (payload.charCodeAt(i) << 8);
        for (let j = 0; j < 8; j++) {
            if (resultado & 0x8000) {
                resultado = (resultado << 1) ^ polinomio;
            } else {
                resultado = (resultado << 1);
            }
            resultado &= 0xFFFF;
        }
    }
    
    return (resultado).toString(16).toUpperCase().padStart(4, "0");
}

// ============================================
// FUNÇÃO: GERAR QR CODE PIX
// ============================================
async function gerarQRCodePIX(valor, elementoId, identificador = "") {
    const payload = gerarPayloadPIX(valor, identificador);
    const container = document.getElementById(elementoId);
    
    if (!container) return null;
    
    container.innerHTML = "";
    
    return new Promise((resolve) => {
        try {
            new QRCode(container, {
                text: payload,
                width: 120,
                height: 120,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            
            setTimeout(() => {
                const img = container.querySelector("img");
                resolve(img ? img.src : null);
            }, 300);
        } catch (error) {
            console.error("Erro ao gerar QR Code:", error);
            container.innerHTML = '<p style="color:red;">Erro ao gerar QR Code</p>';
            resolve(null);
        }
    });
}

// ============================================
// FUNÇÃO: CALCULAR FRETE POR CEP
// ============================================
function calcularFretePorCEP(cep) {
    const cepLimpo = cep.replace(/\D/g, "");
    const prefixo = cepLimpo.substring(0, 2);
    
    // Verificar capital
    if (DANFE_CONFIG.frete.regioes.capital.prefixos.includes(prefixo)) {
        return 0;
    }
    
    // Verificar grande SP
    if (DANFE_CONFIG.frete.regioes.grande_sp.prefixos.includes(prefixo)) {
        return 15;
    }
    
    // Interior/Outros
    return 25;
}

// ============================================
// FUNÇÃO: FORMATAR MOEDA
// ============================================
function formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2
    }).format(valor);
}

// ============================================
// FUNÇÃO: FORMATAR DATA
// ============================================
function formatarData(data, formato = "dd/mm/yyyy") {
    const d = data instanceof Date ? data : new Date();
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const ano = d.getFullYear();
    
    if (formato === "yyyy-mm-dd") return `${ano}-${mes}-${dia}`;
    return `${dia}/${mes}/${ano}`;
}

// ============================================
// FUNÇÃO: GERAR NÚMERO DO DANFE
// ============================================
function gerarNumeroDANFE() {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const sequencial = String(Math.floor(Math.random() * 99999)).padStart(5, "0");
    return `${ano}${mes}${sequencial}`;
}

// ============================================
// FUNÇÃO: GERAR CHAVE DE ACESSO (44 dígitos)
// ============================================
function gerarChaveAcesso() {
    const cnpj = "00000000000000"; // CNPJ da empresa (preencher)
    const modelo = "55"; // NF-e
    const serie = "001";
    const numero = String(Math.floor(Math.random() * 999999999)).padStart(9, "0");
    const tpEmissao = "1";
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const cnf = String(Math.floor(Math.random() * 99999999)).padStart(8, "0");
    
    return `${cnpj}${modelo}${serie}${numero}${tpEmissao}${ano}${mes}${cnf}`;
}

// ============================================
// FUNÇÃO: VALIDAR CPF
// ============================================
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto >= 10 ? 0 : resto;
    if (digito1 !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto >= 10 ? 0 : resto;
    
    return digito2 === parseInt(cpf.charAt(10));
}

// Exportar módulo (para uso com módulos ES6 ou global)
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        DANFE_CONFIG,
        gerarPayloadPIX,
        gerarQRCodePIX,
        calcularFretePorCEP,
        formatarMoeda,
        formatarData,
        gerarNumeroDANFE,
        gerarChaveAcesso,
        validarCPF
    };
}
