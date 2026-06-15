import { auth, db } from "./firebase.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
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

if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const senha = senhaInput.value.trim();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, senha);

            await salvarUsuario(userCredential.user);

            window.location.href = "./dashboard.html";

        } catch (error) {
            alert("Erro ao entrar: " + error.code);
        }
    });
}

if (btnCadastro) {
    btnCadastro.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const senha = senhaInput.value.trim();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);

            await salvarUsuario(userCredential.user);

            window.location.href = "./dashboard.html";

        } catch (error) {
            alert("Erro ao criar conta: " + error.code);
        }
    });
}

if (btnGoogle) {
    btnGoogle.addEventListener("click", async () => {
        try {
            const provider = new GoogleAuthProvider();

            const userCredential = await signInWithPopup(auth, provider);

            await salvarUsuario(userCredential.user);

            window.location.href = "./dashboard.html?v=40";

        } catch (error) {
            alert("Erro Google: " + error.code);
        }
    });
}