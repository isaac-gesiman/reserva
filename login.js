import { auth, db } from "./firebase.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithRedirect,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const btnLogin = document.getElementById("btnLogin");
const btnCadastro = document.getElementById("btnCadastro");
const btnGoogle = document.getElementById("btnGoogle");

async function salvarUsuario(user) {
    await setDoc(
        doc(db, "users", user.uid),
        {
            uid: user.uid,
            email: user.email,
            atualizadoEm: Date.now()
        },
        { merge: true }
    );
}

function mostrarErro(error) {
    console.error(error);

    if (error.code === "auth/invalid-credential") {
        alert("Email ou senha incorretos. Verifique se essa conta foi criada com Email/Senha.");
        return;
    }

    if (error.code === "auth/email-already-in-use") {
        alert("Esse email já está cadastrado. Tente entrar ou use Login com Google.");
        return;
    }

    if (error.code === "auth/too-many-requests") {
        alert("Muitas tentativas. Espere alguns minutos e tente novamente.");
        return;
    }

    if (error.code === "auth/popup-closed-by-user") {
        alert("A janela do Google foi fechada antes de concluir o login.");
        return;
    }

    alert("Erro: " + error.code);
}

btnLogin.addEventListener("click", async () => {
    const email = emailInput.value.trim().toLowerCase();
    const senha = senhaInput.value.trim();

    if (!email || !senha) {
        alert("Preencha email e senha.");
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);

        await salvarUsuario(userCredential.user);

        window.location.href = "./dashboard.html";

    } catch (error) {
        mostrarErro(error);
    }
});

btnCadastro.addEventListener("click", async () => {
    const email = emailInput.value.trim().toLowerCase();
    const senha = senhaInput.value.trim();

    if (!email || !senha) {
        alert("Preencha email e senha.");
        return;
    }
});

btnGoogle.addEventListener("click", async () => {
    try {
        const provider = new GoogleAuthProvider();

        await signInWithRedirect(auth, provider);

    } catch (error) {
        mostrarErro(error);
    }
});