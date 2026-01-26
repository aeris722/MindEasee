import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* 🔴 SAME firebaseConfig AS auth.js */
const firebaseConfig = {
  apiKey: "AIzaSyCcYEEa9JOMWBZ0MkFJceX7z7iDwaRzle0",
  authDomain: "mindease-bb9e4.firebaseapp.com",
  projectId: "mindease-bb9e4",
  appId: "1:92953988198:web:d8c17ee0149be4d258f1a7",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ✅ FORCE SESSION TO PERSIST */
setPersistence(auth, browserLocalPersistence);

/* 🔐 WAIT FOR AUTH TO RESOLVE */
let authChecked = false;

onAuthStateChanged(auth, user => {
  if (!authChecked) {
    authChecked = true;

    if (!user) {
      window.location.replace("index.html");
    }
  }
});

/* 🚪 LOGOUT */
window.logout = function () {
  signOut(auth).then(() => {
    window.location.replace("index.html");
  });
};
// 🔹 Export helpers for dashboard & other pages
export { auth, db };

