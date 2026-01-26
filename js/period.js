

import { auth, db } from "./common.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const historyEl = document.getElementById("period-history");

let uid = null;

/* AUTH- For trail case only */
auth.onAuthStateChanged(user => {
  if (!user) return;
  uid = user.uid;
  loadHistory();
});

/* SAVE PERIOD */
document.getElementById("save-period").onclick = async () => {
  if (!uid) return alert("Auth not ready");

  const start = document.getElementById("start-date").value;
  if (!start) return alert("Start date is required");

  const data = {
    startDate: start,
    endDate: document.getElementById("end-date").value || null,
    flow: document.getElementById("flow").value || null,
    pain: Number(document.getElementById("pain").value),
    mood: document.getElementById("mood").value || null,
    sleep: document.getElementById("sleep").value || null,
    createdAt: Timestamp.now()
  };

  await addDoc(
    collection(db, "users", uid, "periods"),
    data
  );

  loadHistory();
};

/* LOAD HISTORY */
async function loadHistory() {
  historyEl.innerHTML = "";

  const snap = await getDocs(
    query(
      collection(db, "users", uid, "periods"),
      orderBy("startDate", "desc")
    )
  );

  snap.forEach(doc => {
    const d = doc.data();
    const li = document.createElement("li");

    const bleedDays =
      d.endDate
        ? Math.max(
            1,
            (new Date(d.endDate) - new Date(d.startDate)) /
              (1000 * 60 * 60 * 24) + 1
          )
        : "—";

    li.innerHTML = `
      <strong>${d.startDate}</strong>
      <br>Flow: ${d.flow || "—"}
      <br>Pain: ${d.pain}/10
      <br>Mood: ${d.mood || "—"}
      <br>Sleep: ${d.sleep || "—"}
      <br>Bleeding days: ${bleedDays}
      <hr>
    `;

    historyEl.appendChild(li);
  });
}
