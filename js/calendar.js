import { auth, db } from "./common.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const calendarEl = document.getElementById("calendar");
const dayTasksEl = document.getElementById("day-tasks");
const selectedDateEl = document.getElementById("selected-date");

let uid = null;
let tasks = [];

auth.onAuthStateChanged(async user => {
  if (!user) return;
  uid = user.uid;
  await loadTasks();
  renderCalendar();
});

/* LOAD TASKS 1	2	3
4	5	6	7	8	9	10
11	12	13	14	15	16	17
18	19	20	21	22	23	24
25	26	27	28	29	30	31 */
async function loadTasks() {
  const snap = await getDocs(
    collection(db, "users", uid, "tasks")
  );

  tasks = [];
  snap.forEach(doc => tasks.push(doc.data()));
}

/* RENDER CALENDAR (SIMPLE MONTH VIEW) */
function renderCalendar() {
  calendarEl.innerHTML = "";

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendarEl.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const cell = document.createElement("div");
    cell.textContent = day;
    cell.className = "calendar-day";

    const hasTask = tasks.some(t => t.date === dateStr);
    if (hasTask) {
      const dot = document.createElement("div");
      dot.className = "task-dot";
      cell.appendChild(dot);
    }

    cell.onclick = () => showTasksForDate(dateStr);
    calendarEl.appendChild(cell);
  }
}

/* SHOW TASKS FOR A DAY */
function showTasksForDate(date) {
  selectedDateEl.textContent = date;
  dayTasksEl.innerHTML = "";

  const dayTasks = tasks.filter(t => t.date === date);

  if (dayTasks.length === 0) {
    dayTasksEl.innerHTML = "<li>No tasks</li>";
    return;
  }

  dayTasks.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `• ${t.text}`;
    dayTasksEl.appendChild(li);
  });
}
