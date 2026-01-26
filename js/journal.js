import { auth, db } from "./common.js";
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const textEl = document.getElementById("journal-text");
const moodEl = document.getElementById("journal-mood");
const listEl = document.getElementById("journal-list");

let currentUser = null;

/* ---------- AUTH READY ---------- */
auth.onAuthStateChanged(async user => {
  if (!user) return;

  currentUser = user;
  loadEntries();
});

/* ---------- LOAD ENTRIES ---------- */
async function loadEntries() {
  const q = query(
    collection(db, "users", currentUser.uid, "journal"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  listEl.innerHTML = "";

  snap.forEach(doc => {
    const d = doc.data();
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${d.mood || "No mood"}</strong><br>
      ${d.text}<br>
      <small>${new Date(d.createdAt.seconds * 1000).toLocaleString()}</small>
      <hr>
    `;

    listEl.appendChild(li);
  });
}

/* ---------- SAVE ENTRY ---------- */
document.getElementById("save-journal").onclick = async () => {
  if (!currentUser) {
    alert("Auth not ready. Please wait a second.");
    return;
  }

  const text = textEl.value.trim();
  if (!text) {
    alert("Write something first");
    return;
  }

  await addDoc(
    collection(db, "users", currentUser.uid, "journal"),
    {
      text,
      mood: moodEl.value || null,
      createdAt: Timestamp.now()
    }
  );

  textEl.value = "";
  moodEl.value = "";

  await loadEntries();
};
