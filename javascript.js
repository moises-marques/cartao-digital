// ====== INICIALIZAÇÃO DO FIREBASE (mantém, mas sem gravações automáticas) ======
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
  import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
  import { getDocs } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

  // --- CONFIGURAÇÃO DO FIREBASE ---
 const firebaseConfig = {
  apiKey: "AIzaSyBnYGuTFr7WVKvuKXWhW0jm9n5Ymao4HzU",
  authDomain: "cartao-digita.firebaseapp.com",
  projectId: "cartao-digita",
  storageBucket: "cartao-digita.firebasestorage.app",
  messagingSenderId: "406222781205",
  appId: "1:406222781205:web:5e05496f1759ac915ec71c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- FUNÇÃO PARA ENVIAR DADOS PARA O FIRESTORE ---
async function gravaEvento(nomeColecao, dados) {
  try {
    const ref = await addDoc(collection(db, nomeColecao), dados);
    console.log(`✅ Gravado em Firestore (${nomeColecao}):`, ref.id);
  } catch (err) {
    console.error("❌ Erro ao gravar no Firestore:", err);
  }
}

// --- FUNÇÃO PARA ATUALIZAR CONTADORES NA TELA ---
async function atualizarContadorFirestore(id, nomeColecao) {
  try {
    const q = await getDocs(collection(db, nomeColecao));
    const el = document.getElementById(id);
    if (el) el.textContent = q.size;
  } catch (erro) {
    console.error(`Erro ao atualizar contador ${id}:`, erro);
  }
}

// --- FUNÇÃO PRINCIPAL ---
document.addEventListener("DOMContentLoaded", () => {
  const btnSeguir = document.getElementById("btn-seguir");
  const btnSalvarContato = document.getElementById("btn-salvar");
  const btnSalvarAgenda = document.getElementById("btn-agenda");

  // Atualiza contadores assim que a página carrega
  atualizarContadorFirestore("seguidores-count", "seguidores");
  atualizarContadorFirestore("contatos-count", "contatosSalvos");
  atualizarContadorFirestore("cartao-count", "contatosAgenda");

  // --- BOTÃO SEGUIR ---
  if (btnSeguir) {
    btnSeguir.addEventListener("click", async () => {
      await gravaEvento("seguidores", { acao: "seguir", timestamp: new Date().toISOString() });
      atualizarContadorFirestore("seguidores-count", "seguidores");
    });
  }

  // --- BOTÃO SALVAR CONTATO ---
  if (btnSalvarContato) {
    btnSalvarContato.addEventListener("click", async () => {
      await gravaEvento("contatosSalvos", { acao: "salvar_contato", timestamp: new Date().toISOString() });
      atualizarContadorFirestore("contatos-count", "contatosSalvos");
      window.location.href = 'contato.vcf';
    });
  }

  // --- BOTÃO SALVAR NA AGENDA ---
  if (btnSalvarAgenda) {
    btnSalvarAgenda.addEventListener("click", async () => {
      // Aqui salvamos o número real e o nome
      await gravaEvento("contatosAgenda", {
        nome: "Moises Marques",
        telefone: "92981067676",
        timestamp: new Date().toISOString()
      });
      atualizarContadorFirestore("cartao-count", "contatosAgenda");
    });
  }
});


         
          /* -------------------- OFFLINE (QR do contato) -------------------- */

const btnOffline = document.querySelector('.offline-title');
const offlinePanel = document.getElementById('offlinePanel');
const offlineQrcodeContainer = document.getElementById('qrcode'); // se existir
const extraCardsList = document.querySelector('.extra-cards-list'); // adiciona essa linha

if (offlinePanel) offlinePanel.style.display = 'none';

if (btnOffline && offlinePanel) {
  btnOffline.addEventListener('click', () => {
    const isHidden = (offlinePanel.style.display === 'none' || offlinePanel.style.display === '');
    offlinePanel.style.display = isHidden ? 'block' : 'none';

    // 🔽 empurra a lista de cards pra baixo quando o QR aparece
    if (extraCardsList) {
      extraCardsList.style.marginTop = isHidden ? '0' : '0';
    }
  });
}

// Se houver container #qrcode e a lib QRCode estiver disponível, gera uma vez
if (offlineQrcodeContainer && typeof QRCode !== 'undefined') {
  // Protege para não regenerar
  if (!offlineQrcodeContainer.dataset.generated) {
    new QRCode(offlineQrcodeContainer, {
      text: "https://cartodigmoises.netlify.app/", // ajuste se quiser outro URL
      width: 150,
      height: 150,
      correctLevel: QRCode.CorrectLevel.H,
      render: "image"
    });
    offlineQrcodeContainer.dataset.generated = "true";
  }
}


  /* -------------------- SALVAR NA AGENDA / DOWNLOAD do contato.vcf -------------------- */
  // Se existir um link .btn-primary (âncora com download), mantém. Se houver botão extra "Salvar na Agenda", tenta localizar e ligar.
  const btnPrimary = document.querySelector('.btn-primary');
  if (btnPrimary) {
    btnPrimary.addEventListener('click', (e) => {
      // se for <a download> deixa o navegador lidar; se for botão, forçar download
      if (btnPrimary.tagName.toLowerCase() === 'a' && btnPrimary.hasAttribute('download')) {
        // o navegador já baixa
        return;
      } else {
        // tenta navegar para contato.vcf (se houver no servidor)
        window.location.href = 'contato.vcf';
      }
    });
  }

  document.querySelector('.btn-primary').addEventListener('click', function() {
    window.location.href = 'contato.vcf';
  });

                   /* -------------------- COMPARTILHAR / ENVIAR CARTÃO -------------------- */
  const shareBtn = document.getElementById('share-btn') || document.querySelector('.action-item#share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      // const url = window.location.href; 
      const url = "https://cartodigmoises.netlify.app/";
      if (navigator.share) {
        try {
          await navigator.share({ title: "Meu Cartão Digital", text: "Veja meu cartão de contato!", url });
        } catch (err) {
          console.log("Compartilhar cancelado/erro:", err);
        }
      } else {
        try {
          await navigator.clipboard.writeText(url);
          alert("Link do cartão copiado para a área de transferência!");
        } catch (err) {
          alert("Não foi possível copiar o link.");
        }
      }
    });
  }

  /* -------------------- WI-FI (mostrar imagem estática ou gerar) -------------------- */
  const wifiBtn = document.getElementById("wifi-btn");
  const wifiDiv = document.getElementById("wifi-qrcode");

  if (wifiDiv) {
    // garante layout inicial (oculto)
    if (!wifiDiv.style.display) wifiDiv.style.display = 'none';
  }

  if (wifiBtn && wifiDiv) {
    wifiBtn.addEventListener("click", () => {
      if (wifiDiv.style.display === "none" || wifiDiv.style.display === "") {
        // mostrar
        wifiDiv.style.display = "flex";
        wifiDiv.style.flexDirection = "column";
        wifiDiv.style.alignItems = "center";

        // se já tem uma IMG (colocada por você), mantém e não gera
        const existingImg = wifiDiv.querySelector('img');
        if (!existingImg) {
          // gera QR como imagem (se a lib estiver disponível)
          if (typeof QRCode !== 'undefined') {
            wifiDiv.innerHTML = ""; // limpa
            new QRCode(wifiDiv, {
              text: "WIFI:T:WPA;S=PMARQUES;P=130697Le@@;;",
              width: 150,
              height: 150,
              correctLevel: QRCode.CorrectLevel.H,
              render: "image"
            });
            const info = document.createElement("p");
            info.innerHTML = `<strong>Rede:</strong> PMARQUES<br><strong>Senha:</strong> 130697Le@@`;
            info.style.textAlign = "center";
            info.style.marginTop = "10px";
            wifiDiv.appendChild(info);
            wifiDiv.dataset.generated = "true";
          } else {
            // fallback: tenta mostrar uma imagem local se existir
            wifiDiv.innerHTML = `<img src="img/qrcodePMARQUES.jpeg" alt="QR Code Wi-Fi"><p style="text-align:center;margin-top:10px;"><strong>Rede:</strong> PMARQUES<br><strong>Senha:</strong> 130697Le@@</p>`;
          }
        }
      } else {
        // ocultar — não apaga sua imagem estática; só limpa se foi gerado por script
        wifiDiv.style.display = "none";
        if (wifiDiv.dataset.generated === "true") {
          wifiDiv.innerHTML = "";
          delete wifiDiv.dataset.generated;
        }
      }
    });
  }

  /* -------------------- TROCAR CONTATO (botão footer-highlight) -------------------- */
  const contatosList = [
    { nome: "Telefone", subtexto: "92 98106-7373" },
    { nome: "Email", subtexto: "mpm10433@gmail.com" },
    { nome: "Outro contato", subtexto: "92 99376-8612" }
  ];

  const btnTroca = document.querySelector(".btn-troca");
  const nomeContatoEl = document.querySelector(".extra-text-container .extra-text");
  const subContatoEl = document.querySelector(".extra-text-container .extra-subtext");

  if (btnTroca && nomeContatoEl && subContatoEl) {
    let idx = 0;
    function atualizaContato() {
      nomeContatoEl.textContent = contatosList[idx].nome;
      subContatoEl.textContent = contatosList[idx].subtexto;
    }
    atualizaContato();

    btnTroca.addEventListener("click", () => {
      idx = (idx + 1) % contatosList.length;
      atualizaContato();
    });
  }

  /* -------------------- BADGES: contador local (localStorage) -------------------- */
  // helper para ler/escrever (se você usar em outras partes)
  function storageGetInt(key) {
    return parseInt(localStorage.getItem(key) || "0", 10);
  }
  function storageSetInt(key, val) {
    localStorage.setItem(key, String(val));
  }

  /* -------------------- PIX (mostrar/esconder QR Code) -------------------- */
  const pixBtn = document.getElementById("pix-btn");
  const pixDiv = document.getElementById("pix-qrcode");

  if (pixBtn && pixDiv) {
    pixBtn.addEventListener("click", () => {
      const isHidden = pixDiv.style.display === "none" || pixDiv.style.display === "";
      pixDiv.style.display = isHidden ? "flex" : "none";
    });
  }

