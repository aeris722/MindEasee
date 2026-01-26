import { auth, db } from "./common.js";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("todo.js loaded");

/* ---------- LOCAL DATE HELPER ---------- */
function getLocalDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/* ---------- ELEMENTS ------------------------- */
const textEl = document.getElementById("task-text");
const priorityEl = document.getElementById("task-priority");
const dateEl = document.getElementById("task-date"); // optional calendar date
const listEl = document.getElementById("task-list");
const addBtn = document.getElementById("add-task");

if (!textEl || !priorityEl || !listEl || !addBtn) {
  console.error("❌ Todo HTML elements missing");
}

let uid = null;

/* ---------- AUTH ---------- */
auth.onAuthStateChanged(user => {
  if (!user) return;
  uid = user.uid;
  loadTasks();
});

/* ---------- LOAD TASKS ---------- */
async function loadTasks() {
  if (!uid || !listEl) return;

  listEl.innerHTML = "";

  const snap = await getDocs(
    collection(db, "users", uid, "tasks")
  );

  snap.forEach(docc => {
    renderTask(docc.id, docc.data());
  });
}

/* ---------- RENDER TASK ---------- */
function renderTask(id, data) {
  const li = document.createElement("li");

  li.style.display = "flex";
  li.style.alignItems = "center";
  li.style.gap = "10px";
  li.style.padding = "10px";
  li.style.marginBottom = "8px";
  li.style.borderRadius = "10px";
  li.style.background = "rgba(255,255,255,0.6)";

  const emoji =
    data.priority === "red"
      ? "🔴"
      : data.priority === "yellow"
      ? "🟡"
      : "🔵";

  const label = document.createElement("span");
  label.textContent = `${emoji} ${data.text}`;

  if (data.completed) {
    label.style.textDecoration = "line-through";
    label.style.opacity = "0.6";
  }

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = data.completed;

  checkbox.onchange = async () => {
    await updateDoc(
      doc(db, "users", uid, "tasks", id),
      {
        completed: checkbox.checked,
        completedAt: checkbox.checked
          ? Timestamp.now()
          : null
      }
    );

    label.style.textDecoration =
      checkbox.checked ? "line-through" : "none";
    label.style.opacity =
      checkbox.checked ? "0.6" : "1";
  };

  const delBtn = document.createElement("button");
  delBtn.textContent = "🗑️";
  delBtn.style.border = "none";
  delBtn.style.background = "transparent";
  delBtn.style.cursor = "pointer";

  delBtn.onclick = async () => {
    if (!confirm("Delete this task?")) return;

    await deleteDoc(
      doc(db, "users", uid, "tasks", id)
    );

    loadTasks();
  };

  li.appendChild(label);
  li.appendChild(checkbox);
  li.appendChild(delBtn);
  listEl.appendChild(li);
}

/* ---------- ADD TASK ---------- */
addBtn.addEventListener("click", async () => {
  if (!uid) {
    alert("User not ready");
    return;
  }

  const text = textEl.value.trim();
  if (!text) {
    alert("Enter a task");
    return;
  }

  // ✅ If user picked a date → use it
  // ✅ Else → fallback to today (local)
  const taskDate =
    dateEl?.value || getLocalDate();

  await addDoc(
    collection(db, "users", uid, "tasks"),
    {
      text,
      priority: priorityEl.value,
      date: taskDate,
      completed: false,
      completedAt: null,
      createdAt: Timestamp.now()
    }
  );

  textEl.value = "";
  if (dateEl) dateEl.value = "";

  loadTasks();
});
