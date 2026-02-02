import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* 🔴 PASTE YOUR FIREBASE CONFIG HERE */
const firebaseConfig = {
  apiKey: "AIzaSyCcYEEa9JOMWBZ0MkFJceX7z7iDwaRzle0",
  authDomain: "mindease-bb9e4.firebaseapp.com",
  projectId: "mindease-bb9e4",
  storageBucket: "mindease-bb9e4.firebasestorage.app",
  messagingSenderId: "92953988198",
  appId: "1:92953988198:web:d8c17ee0149be4d258f1a7",
  measurementId: "G-RXS79G7XK4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
import { setPersistence, browserLocalPersistence } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

setPersistence(auth, browserLocalPersistence);


/* LOGIN */
window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(err => alert(err.message));
};

/* SIGNUP */
window.signup = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(err => alert(err.message));
};

