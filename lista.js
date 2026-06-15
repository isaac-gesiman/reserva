import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

console.log("lista.js carregou");

const nomeListaInput = document.getElementById("nomeLista");
const listaItens = document.getElementById("listaItens");
const addBtn = document.getElementById("addItem");

const btnVoltar = document.getElementById("btnVoltar");
const btnApagarLista = document.getElementById("btnApagarLista");

const listaAtualId = localStorage.getItem("listaAtual");

onAuthStateChanged(auth, (usuario) => {

    if (!usuario) {
        window.location.href = "login.html";
        return;
    }

    if (!listaAtualId) {
        window.location.href = "dashboard.html";
        return;
    }

    carregarLista(usuario);
    carregarItens();

});

async function carregarLista(usuario) {

    const listaRef = doc(db, "listas", listaAtualId);

    const listaSnap = await getDoc(listaRef);

    if (!listaSnap.exists()) {
        alert("Lista não encontrada.");
        window.location.href = "dashboard.html";
        return;
    }

    const lista = listaSnap.data();

    const colaboradores = lista.colaboradores || [];

    const temAcesso =
        lista.donoUid === usuario.uid ||
        colaboradores.includes(usuario.email);

    if (!temAcesso) {
        alert("Você não tem acesso a esta lista.");
        window.location.href = "dashboard.html";
        return;
    }

    nomeListaInput.value = lista.nome;

    nomeListaInput.addEventListener("input", async () => {

        await updateDoc(listaRef, {
            nome: nomeListaInput.value
        });

    });

    carregarColaboradores(listaRef);

}

function carregarItens() {

    const itensRef = collection(
        db,
        "listas",
        listaAtualId,
        "itens"
    );

    onSnapshot(itensRef, (snapshot) => {

        listaItens.innerHTML = "";

        snapshot.forEach((docSnap) => {

            const item = docSnap.data();

            const div = document.createElement("div");

            div.className = "item";

            div.innerHTML = `
                <div class="check ${item.concluido ? "done" : ""}"></div>

                <div style="flex:1;">
                    ${item.nome}
                </div>

                <div>
                    ${item.qtd || 1}
                </div>

                <button class="delete">
                    🗑
                </button>
            `;

            div.querySelector(".check").addEventListener("click", async () => {

                await updateDoc(
                    doc(db, "listas", listaAtualId, "itens", docSnap.id),
                    {
                        concluido: !item.concluido
                    }
                );

            });

            div.querySelector(".delete").addEventListener("click", async () => {

                await deleteDoc(
                    doc(db, "listas", listaAtualId, "itens", docSnap.id)
                );

            });

            listaItens.appendChild(div);

        });

    });

}

if (addBtn) {

    addBtn.addEventListener("click", async () => {

        const nome =
            document.getElementById("itemNome").value.trim();

        const qtd =
            document.getElementById("itemQtd").value.trim();

        if (!nome) return;

        await addDoc(
            collection(db, "listas", listaAtualId, "itens"),
            {
                nome,
                qtd,
                concluido: false,
                criadoEm: Date.now()
            }
        );

        document.getElementById("itemNome").value = "";
        document.getElementById("itemQtd").value = "";

    });

}

function carregarColaboradores(listaRef) {

    const shareInput = document.querySelector(".share-form input");
    const shareBtn = document.querySelector(".share-form button");
    const usuariosDiv = document.querySelector(".usuarios");

    if (!shareInput || !shareBtn || !usuariosDiv) return;

    onSnapshot(listaRef, (snapshot) => {

        const lista = snapshot.data();

        usuariosDiv.innerHTML = "";

        const colaboradores = lista.colaboradores || [];

        colaboradores.forEach((email) => {

            const div = document.createElement("div");

            div.className = "colaborador";

            div.innerHTML = `
                <span>${email}</span>
                <button>🗑</button>
            `;

            div.querySelector("button").addEventListener("click", async () => {

                await updateDoc(listaRef, {
                    colaboradores: arrayRemove(email)
                });

            });

            usuariosDiv.appendChild(div);

        });

    });

    shareBtn.addEventListener("click", async () => {

        const email = shareInput.value.trim().toLowerCase();

        if (!email) return;

        await updateDoc(listaRef, {
            colaboradores: arrayUnion(email)
        });

        shareInput.value = "";

    });

}

if (btnVoltar) {

    btnVoltar.addEventListener("click", () => {
        window.location.href = "dashboard.html?v=40";
    });

}

if (btnApagarLista) {

    btnApagarLista.addEventListener("click", async () => {

        if (!confirm("Deseja apagar esta lista?")) return;

        await deleteDoc(
            doc(db, "listas", listaAtualId)
        );

        localStorage.removeItem("listaAtual");

        window.location.href = "dashboard.html";

    });

}