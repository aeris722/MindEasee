import { auth, db } from "./common.js";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const summaryEl = document.getElementById("cycle-summary");
const graphEl = document.getElementById("cycle-graph");
const painGraphEl = document.getElementById("pain-graph");
const painInsightEl = document.getElementById("pain-insight");
const moodSummaryEl = document.getElementById("mood-summary");

let uid = null;

/* ---------- AUTH ---------- */
auth.onAuthStateChanged(user => {
  if (!user) return;
  uid = user.uid;
  analyzeCycles();
});

/* ---------- ANALYZE ---------- */
async function analyzeCycles() {
  const snap = await getDocs(
    query(
      collection(db, "users", uid, "periods"),
      orderBy("startDate", "asc")
    )
  );

  const periods = [];
  snap.forEach(doc => periods.push(doc.data()));

  /* ---------- PAIN TREND (needs ≥1 entry) ---------- */
  if (painGraphEl && painInsightEl) {
    painGraphEl.innerHTML = "";
    painInsightEl.textContent = "";

    const painValues = periods
      .map(p => p.pain)
      .filter(p => typeof p === "number");

    if (painValues.length > 0) {
      painValues.forEach(val => {
        const bar = document.createElement("div");
        bar.className = "pain-bar";
        bar.style.height = `${val * 8}px`;
        bar.title = `Pain ${val}/10`;
        painGraphEl.appendChild(bar);
      });

      const avgPain =
        painValues.reduce((a, b) => a + b, 0) / painValues.length;

      painInsightEl.textContent =
        avgPain >= 6
          ? "Pain tends to be stronger during your periods. Rest and gentle care may help."
          : "Pain levels are generally manageable, but listening to your body still matters.";
    } else {
      painInsightEl.textContent =
        "Log pain levels to see trends over time.";
    }
  }

  /* ---------- MOOD PATTERN ---------- */
  if (moodSummaryEl) {
    moodSummaryEl.innerHTML = "";

    const moodCounts = {};
    periods.forEach(p => {
      if (p.mood) {
        moodCounts[p.mood] = (moodCounts[p.mood] || 0) + 1;
      }
    });

    Object.keys(moodCounts).forEach(mood => {
      const pill = document.createElement("span");
      pill.className = "mood-pill";
      pill.textContent = `${mood} (${moodCounts[mood]})`;
      moodSummaryEl.appendChild(pill);
    });
  }

  /* ---------- CYCLE ANALYSIS (needs ≥2 entries) ---------- */
  if (periods.length < 2 || !summaryEl || !graphEl) {
    if (summaryEl) {
      summaryEl.textContent =
        "Log at least 2 cycles to see cycle patterns.";
    }
    return;
  }

  const cycleLengths = [];

  for (let i = 1; i < periods.length; i++) {
    const prev = new Date(periods[i - 1].startDate);
    const curr = new Date(periods[i].startDate);

    const diff =
      (curr - prev) / (1000 * 60 * 60 * 24);

    if (diff >= 15 && diff <= 60) {
      cycleLengths.push(Math.round(diff));
    }
  }

  if (cycleLengths.length === 0) {
    summaryEl.textContent =
      "Your cycle pattern is still forming. This is common in the early years.";
    graphEl.innerHTML = "";
    return;
  }

  const min = Math.min(...cycleLengths);
  const max = Math.max(...cycleLengths);
  const avg =
    cycleLengths.reduce((a, b) => a + b, 0) /
    cycleLengths.length;

  summaryEl.textContent =
    min === max
      ? `Your cycle has been fairly consistent so far (~${min} days).`
      : `Your cycle usually falls between ${min}–${max} days (average ~${Math.round(
          avg
        )} days). Some variation is normal during teenage years.`;

  renderGraph(cycleLengths);
}

/* ---------- GRAPH ---------- */
function renderGraph(data) {
  graphEl.innerHTML = "";

  data.forEach((val, index) => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "center";
    wrapper.style.marginRight = "10px";

    const bar = document.createElement("div");
    bar.style.height = `${val * 3}px`;
    bar.style.width = "24px";
    bar.style.background = "#c7d2fe";
    bar.style.borderRadius = "8px";
    bar.title = `${val} days`;

    const days = document.createElement("small");
    days.textContent = `${val}d`;

    const label = document.createElement("small");
    label.textContent = `C${index + 1}`;

    wrapper.appendChild(bar);
    wrapper.appendChild(days);
    wrapper.appendChild(label);

    graphEl.appendChild(wrapper);
  });

  graphEl.style.display = "flex";
  graphEl.style.alignItems = "flex-end";
}
