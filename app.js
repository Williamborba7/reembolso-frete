// ==========================================
// 1. IMPORTAÇÕES E CONFIGURAÇÃO DO FIREBASE
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";

// SUA NOVA CONFIGURAÇÃO ATUALIZADA
const firebaseConfig = {
  apiKey: "AIzaSyDdZwbUgDA_KpR-IAd94atqd8VKLHYbRd0",
  authDomain: "sistema-reembolsos-c57a9.firebaseapp.com",
  projectId: "sistema-reembolsos-c57a9",
  storageBucket: "sistema-reembolsos-c57a9.firebasestorage.app",
  messagingSenderId: "104296328504",
  appId: "1:104296328504:web:dc3aedb28e5d1a75fe25cd"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ==========================================
// 2. MÁSCARAS DE FORMATAÇÃO
// ==========================================
document.getElementById('telefone').addEventListener('input', function (e) {
    let valor = e.target.value.replace(/\D/g, '');
    let formatado = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
    formatado = formatado.replace(/(\d)(\d{4})$/, '$1-$2');
    e.target.value = formatado;
});

document.getElementById('cnpj').addEventListener('input', function (e) {
    let valor = e.target.value.replace(/\D/g, '');
    valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
    valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    e.target.value = valor;
});

document.getElementById('placa').addEventListener('input', function (e) {
    let valor = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (valor.length > 3) {
        valor = valor.replace(/^([A-Z0-9]{3})([A-Z0-9]+)/, '$1-$2');
    }
    e.target.value = valor;
});

document.getElementById('valor').addEventListener('input', function (e) {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor === '') {
        e.target.value = '';
        return;
    }
    valor = parseInt(valor, 10) / 100;
    e.target.value = valor.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
});

// ==========================================
// 3. ENVIO PARA O BANCO DE DADOS E STORAGE
// ==========================================
document.getElementById('form-reembolso').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const botao = document.querySelector('button[type="submit"]');
    botao.innerText = "Enviando... Aguarde";
    botao.disabled = true;

    try {
        const arquivo = document.getElementById('comprovante').files[0];
        
        // 1. Upload da foto
        const nomeArquivo = Date.now() + '-' + arquivo.name;
        const referenciaStorage = ref(storage, 'comprovantes/' + nomeArquivo);
        await uploadBytes(referenciaStorage, arquivo);
        
        // 2. Pega o link da foto
        const linkFoto = await getDownloadURL(referenciaStorage);

        // 3. Monta os dados
        const dadosReembolso = {
            motorista: document.getElementById('motorista').value,
            telefone: document.getElementById('telefone').value,
            cnpj: document.getElementById('cnpj').value,
            cliente: document.getElementById('cliente').value,
            placa: document.getElementById('placa').value,
            nf: document.getElementById('nf').value,
            dt: document.getElementById('dt').value,
            paletes: document.getElementById('paletes').value,
            valor: document.getElementById('valor').value,
            tipoPix: document.getElementById('tipoPix').value,
            chavePix: document.getElementById('chavePix').value,
            fotoComprovante: linkFoto,
            dataEnvio: new Date().toLocaleString('pt-BR')
        };

        // 4. Salva no banco de dados
        await addDoc(collection(db, "pedidos"), dadosReembolso);

        alert("Reembolso enviado com sucesso!");
        document.getElementById('form-reembolso').reset();

    } catch (erro) {
        console.error("Erro detalhado:", erro);
        alert("Ocorreu um erro ao enviar. Verifique o console ou tente novamente.");
    } finally {
        botao.innerText = "Enviar Solicitação";
        botao.disabled = false;
    }
});