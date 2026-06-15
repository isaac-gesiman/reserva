import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    addDoc,
    onSnapshot,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

console.log("dashboard.js carregou");

const containerListas = document.querySelector(".listas-container");
const plusBtn = document.querySelector(".plus-btn");

onAuthStateChanged(auth, (usuario) => {

    if (!usuario) {
        window.location.href = "login.html";
        return;
    }

    carregarListas(usuario);

    if (plusBtn) {
        plusBtn.addEventListener("click", () => {
            criarLista(usuario);
        });
    }

});

function carregarListas(usuario) {

    if (!containerListas) return;

    containerListas.innerHTML = "";

    const listasRef = collection(db, "listas");

    const qDono = query(
        listasRef,
        where("donoUid", "==", usuario.uid)
    );

    const qCompartilhadas = query(
        listasRef,
        where("colaboradores", "array-contains", usuario.email)
    );

    onSnapshot(qDono, (snapshotDono) => {

        containerListas.innerHTML = "";

        snapshotDono.forEach((docSnap) => {
            criarCardLista(docSnap.id, docSnap.data());
        });

        onSnapshot(qCompartilhadas, (snapshotCompartilhadas) => {

            snapshotCompartilhadas.forEach((docSnap) => {
                criarCardLista(docSnap.id, docSnap.data());
            });

        });

    });

}

function criarCardLista(id, lista) {

    const card = document.createElement("div");

    card.className = "lista-card";

    card.innerText = lista.nome;

    card.addEventListener("click", () => {

        localStorage.setItem("listaAtual", id);

        window.location.href = "lista.html";

    });

    containerListas.appendChild(card);

}

async function criarLista(usuario) {

    const docRef = await addDoc(
        collection(db, "listas"),
        {
            nome: "Nova Lista",
            donoUid: usuario.uid,
            donoEmail: usuario.email,
            colaboradores: [],
            criadaEm: Date.now()
        }
    );

    localStorage.setItem("listaAtual", docRef.id);

    window.location.href = "lista.html";

}