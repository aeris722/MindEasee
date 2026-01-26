import { auth, db } from "./common.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const deleteBtn = document.getElementById("delete-period-data");
/* This may not be private due to no encrytption with firebase */
let uid = null;

auth.onAuthStateChanged(user => {
  if (!user) return;
  uid = user.uid;
});

deleteBtn?.addEventListener("click", async () => {
  if (!uid) return;

  const ok = confirm(
    "Are you sure you want to delete all your period data?"
  );
  if (!ok) return;

  const snap = await getDocs(
    collection(db, "users", uid, "periods")
  );

  for (const d of snap.docs) {
    await deleteDoc(
      doc(db, "users", uid, "periods", d.id)
    );
  }

  alert("Your period data has been deleted.");
  location.reload();
});
