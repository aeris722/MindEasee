import { auth, db } from "./common.js";
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  Timestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const textEl = document.getElementById("journal-text");
const moodEl = document.getElementById("journal-mood");
const listEl = document.getElementById("journal-list");

let currentUser = null;
let unsubscribeJournal = null;

/* ---------- AUTH READY ---------- */
auth.onAuthStateChanged(async user => {
  // Cleanup previous listener if exists
  if (unsubscribeJournal) {
    unsubscribeJournal();
    unsubscribeJournal = null;
  }

  if (!user) {
    currentUser = null;
    listEl.innerHTML = "<li><em>Please log in to see your journal</em></li>";
    return;
  }

  currentUser = user;
  loadEntries();
});

/* ---------- LOAD ENTRIES ---------- */
function loadEntries() {
  if (!currentUser) return;

  const q = query(
    collection(db, "users", currentUser.uid, "journal"),
    orderBy("createdAt", "desc")
  );

  // Use real-time listener instead of one-time fetch
  unsubscribeJournal = onSnapshot(q, (snap) => {
    listEl.innerHTML = "";

    if (snap.empty) {
      listEl.innerHTML = "<li><em>No journal entries yet. Write your first one!</em></li>";
      return;
    }

    snap.forEach(doc => {
      const d = doc.data();
      const li = document.createElement("li");
      
      // Sanitize text to prevent XSS
      const sanitizedText = d.text.replace(/[&<>"']/g, match => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[match]);

      li.innerHTML = `
        <strong>${d.mood || "No mood"}</strong><br>
        ${sanitizedText}<br>
        <small>${d.createdAt ? 
          new Date(d.createdAt.seconds * 1000).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : 
          'Unknown time'
        }</small>
        <hr>
      `;

      listEl.appendChild(li);
    });
  }, (error) => {
    console.error("Error loading journal:", error);
    listEl.innerHTML = "<li><em>Error loading entries. Please refresh.</em></li>";
  });
}

/* ---------- SAVE ENTRY ---------- */
document.getElementById("save-journal").onclick = async (e) => {
  e.preventDefault();
  
  if (!currentUser) {
    alert("Please wait for authentication to complete.");
    return;
  }

  const text = textEl.value.trim();
  if (!text) {
    alert("Please write something first!");
    textEl.focus();
    return;
  }

  // Show saving state
  const saveBtn = e.target;
  const originalText = saveBtn.textContent;
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  try {
    await addDoc(
      collection(db, "users", currentUser.uid, "journal"),
      {
        text,
        mood: moodEl.value || null,
        createdAt: Timestamp.now()
      }
    );

    // Clear form on success
    textEl.value = "";
    moodEl.value = "";
    textEl.focus();
  } catch (error) {
    console.error("Error saving journal:", error);
    alert(`Failed to save entry: ${error.message}`);
  } finally {
    // Restore button state
    saveBtn.disabled = false;
    saveBtn.textContent = originalText;
  }
};

// Add Enter key support for text area
textEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.ctrlKey) {
    document.getElementById("save-journal").click();
  }
});

// Form validation on input
textEl.addEventListener('input', () => {
  textEl.style.borderColor = textEl.value.trim() ? '#4CAF50' : '#f44336';
});

// Handle page visibility change (for mobile back button)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && currentUser) {
    loadEntries();
  }
});
