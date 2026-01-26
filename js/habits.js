// --------------------
// HABITS WITH DAILY CHECKS
// --------------------

const habitInput = document.getElementById("habitInput");
const addHabitBtn = document.getElementById("addHabitBtn");
const habitsContainer = document.getElementById("habitsContainer");

// load habits
let habits = JSON.parse(localStorage.getItem("habits")) || [];

// save
function saveHabits() {
  localStorage.setItem("habits", JSON.stringify(habits));
}

// render
function renderHabits() {
  habitsContainer.innerHTML = "";

  if (habits.length === 0) {
    habitsContainer.innerHTML =
      "<p style='opacity:0.6'>No habits yet</p>";
    return;
  }

  habits.forEach((habit, hIndex) => {
    const card = document.createElement("section");
    card.className = "glass habit-card";

    const title = document.createElement("div");
    title.className = "habit-header";
    title.textContent = habit.name;

    const daysRow = document.createElement("div");
    daysRow.className = "days";

    habit.days.forEach((done, dIndex) => {
      const day = document.createElement("div");
      day.className = "day" + (done ? " done" : "");
      day.textContent = dIndex + 1;

      day.onclick = () => {
        habit.days[dIndex] = !habit.days[dIndex];
        saveHabits();
        renderHabits();
      };

      daysRow.appendChild(day);
    });

    card.appendChild(title);
    card.appendChild(daysRow);
    habitsContainer.appendChild(card);
  });
}

// add habit
addHabitBtn.onclick = () => {
  const name = habitInput.value.trim();
  if (!name) return;

  habits.push({
    name,
    days: Array(7).fill(false) // 7-day streak
  });

  habitInput.value = "";
  saveHabits();
  renderHabits();
};

// init
renderHabits();
