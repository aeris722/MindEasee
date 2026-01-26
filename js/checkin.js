import { auth, db } from "./common.js";
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const energyEl = document.getElementById("energy");
  const focusEl = document.getElementById("focus");
  const journalEl = document.getElementById("journal");

  let selectedMood = null;

  /* ---------- MOOD SELECTION ---------- */
  document.querySelectorAll(".mood-options button").forEach(btn => {
    btn.onclick = () => {
      selectedMood = btn.dataset.mood;
      document
        .querySelectorAll(".mood-options button")
        .forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    };
  });

  /* ---------- STRESS SLIDER ---------- */
  const stressInput = document.getElementById("stress");
  const stressValue = document.getElementById("stress-value");

  stressInput.oninput = () => {
    stressValue.textContent = stressInput.value;
  };

  /* ---------- SUBMIT ---------- */
  document.getElementById("submit-checkin").onclick = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Not logged in");
      return;
    }

    if (!selectedMood) {
      alert("Please select a mood");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const data = {
      date: today,

      mood: selectedMood,
      stress: Number(stressInput.value),
      sleep: document.getElementById("sleep").value,
      period: document.getElementById("period").value || null,

      energy: Number(energyEl.value),
      focus: Number(focusEl.value),

      journal: journalEl.value.trim() || null,

      createdAt: new Date()
    };

    /* 🔥 THIS WAS MISSING */
    await setDoc(
      doc(db, "users", user.uid, "checkins", today),
      data
    );

    journalEl.value = "";
    alert("Check-in saved 🌱");
    window.location.href = "dashboard.html";
  };

});
