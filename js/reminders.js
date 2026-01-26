import { auth, db } from "./common.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let uid = null;

auth.onAuthStateChanged(async user => {
  if (!user) return;
  uid = user.uid;
  await generateReminders();
});

/* ---------- CORE LOGIC (RULE-BASED v1) ---------- */
async function generateReminders() {
  // Check last 3 check-ins
  const checkinsSnap = await getDocs(
    query(
      collection(db, "users", uid, "checkins")
    )
  );

  let highStressCount = 0;

  checkinsSnap.forEach(doc => {
    const d = doc.data();
    if (Number(d.stress) >= 7) highStressCount++;
  });

  if (highStressCount >= 3) {
    await saveReminder(
      "stress_pattern",
      "You’ve had high stress recently. A lighter day or rest might help."
    );
  }
}

/* ---------- SAVE REMINDER ---------- */
async function saveReminder(type, message) {
  const existing = await getDocs(
    query(
      collection(db, "users", uid, "reminders"),
      where("type", "==", type),
      where("dismissed", "==", false)
    )
  );

  if (!existing.empty) return; // avoid duplicates

  await addDoc(
    collection(db, "users", uid, "reminders"),
    {
      type,
      message,
      dismissed: false,
      createdAt: Timestamp.now()
    }
  );
}
