// 🔹 IMPORTS (ONLY AT TOP)
import { auth, db } from "common.js";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  where,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ---------- DATE ---------- */
document.getElementById("today-date").textContent =
  new Date().toDateString();

/* ---------- LOAD DASHBOARD DATA ---------- */
auth.onAuthStateChanged(async user => {
  if (!user) return;

  const uid = user.uid;

  // 🧠 Load last check-in
  const checkinRef = collection(db, "users", uid, "checkins");
  const q = query(checkinRef, orderBy("date", "desc"), limit(1));
  const snap = await getDocs(q);

  if (!snap.empty) {
    const data = snap.docs[0].data();

    document.getElementById("mood-value").textContent =
      data.mood || "—";

    document.getElementById("sleep-value").textContent =
      data.sleep || "—";

    document.getElementById("stress-value").textContent =
      data.stress || "—";

    document.getElementById("cycle-value").textContent =
      data.period || "—";
  }
    // 🔔 Load gentle reminder
    const reminderSnap = await getDocs(
    query(
        collection(db, "users", uid, "reminders"),
        where("dismissed", "==", false)
    )
    );

    if (!reminderSnap.empty) {
    document.getElementById("reminder-text").textContent =
        reminderSnap.docs[0].data().message;
    }


  // 📝 Load saved quote
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists() && userDoc.data().quote) {
    document.getElementById("daily-quote").textContent =
      userDoc.data().quote;
  }
});

/* ---------- EDIT & SAVE QUOTE ---------- */
document.getElementById("edit-quote").onclick = () => {
  auth.onAuthStateChanged(async user => {
    if (!user) {
      alert("Please login again");
      return;
    }

    const newQuote = prompt("Enter your quote:");
    if (!newQuote) return;

    await updateDoc(doc(db, "users", user.uid), {
      quote: newQuote
    });

    document.getElementById("daily-quote").textContent = newQuote;
  });
};
