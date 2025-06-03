// File: public/js/firebase-login.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-dominio.firebaseapp.com",
  projectId: "seu-projeto",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const backendUrl = "http://localhost:8000"; // Atualize conforme necessário

async function sendTokenToBackend(idToken) {
  const res = await fetch(`${backendUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken })
  });

  const data = await res.json();
  if (res.ok) {
    console.log("Usuário autenticado:", data);
    alert(`Bem-vindo ${data.email}`);
  } else {
    console.error("Erro na autenticação:", data);
    alert("Erro na autenticação: " + data.error);
  }
}

// Login com Google
export function loginComGoogle() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(result => result.user.getIdToken())
    .then(sendTokenToBackend)
    .catch(error => alert("Erro: " + error.message));
}

// Login com GitHub
export function loginComGitHub() {
  const provider = new GithubAuthProvider();
  signInWithPopup(auth, provider)
    .then(result => result.user.getIdToken())
    .then(sendTokenToBackend)
    .catch(error => alert("Erro: " + error.message));
}

// Login com E-mail/Senha
export function loginComEmailSenha(email, senha) {
  signInWithEmailAndPassword(auth, email, senha)
    .then(result => result.user.getIdToken())
    .then(sendTokenToBackend)
    .catch(error => alert("Erro: " + error.message));
}
