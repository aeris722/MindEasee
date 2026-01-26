# MindEase – Wellness & Productivity Dashboard

A lightweight, Firebase‑backed web app that combines mood tracking, journaling, task management, period tracking, and gentle reminders into a single glassmorphism‑styled dashboard.

This README explains what the app does, how to run it, how to use each feature, and ideas for future improvements.

---

## 1. Features

### Authentication & User Accounts

- Email/password sign up and login using Firebase Authentication (`auth.js` + `index.html`)
- Session persistence via `browserLocalPersistence` so users stay logged in across refreshes
- Protected pages (dashboard, check‑in, journal, etc.) using a shared `common.js` guard that redirects to `index.html` when not authenticated

### Main Dashboard (`dashboard.html` + `dashboard.js`)

- Shows today’s date and a quick snapshot of:
  - Last mood check‑in (mood, sleep, stress, period info)
  - A gentle reminder, generated automatically if recent stress has been high
  - A customizable daily quote saved per user in Firestore
- “Edit quote” button lets the user update their own motivational message

### Daily Check‑in (`checkin.html` + `checkin.js`)

- Log a daily mental/physical state with:
  - Mood (chosen via mood buttons)
  - Stress (slider with live value display)
  - Sleep (text or number input)
  - Period status (drop‑down / input)
  - Energy level (number)
  - Focus level (number)
  - Optional short journal note
- Data is saved in Firestore under `users/{uid}/checkins/{YYYY-MM-DD}`
- After saving, user is redirected back to the dashboard

### Journal (`journal.html` + `journal.js`)

- Simple, private journaling page tied to the logged‑in user
- Each entry stores:
  - Mood
  - Free‑text note
  - Timestamp
- Entries are listed in reverse chronological order (newest first)

### Tasks & To‑Do (`todo.html` + `todo.js`)

- Create tasks with:
  - Text/title
  - Priority (mapped to emojis: 🔴 high, 🟡 medium, 🔵 low)
  - Optional due date (defaults to “today” if not set)
- Firestore collection per user: `users/{uid}/tasks`
- Features:
  - Mark tasks as completed (with line‑through styling and completion time)
  - Delete tasks
  - Basic styling with flexible, card‑like layout

### Calendar View (`calendar.html` + `calendar.js`)

- Month view calendar that:
  - Highlights days that have tasks (using small “dots”)
  - Shows a list of tasks for a selected date in a sidebar/section
- Tasks are pulled from the same Firestore collection used by the To‑Do page

### Habits Tracker (`habits.html` + `habits.js`)

- Local (browser) habit tracking using `localStorage`
- Add named habits (e.g., “Swim practice”, “Read 20 minutes”)
- Each habit gets a simple 7‑day row:
  - Toggle each day as done/not done
  - Visual, compact 7‑day streak board
- No login required to persist habits (stored per browser)

### Period Tracking & Analytics (`period.html`, `period.js`, `period-analytics.js`, `period-privacy.js`)

**Logging cycles**

- Log period cycles with:
  - Start date (required)
  - End date (optional)
  - Flow
  - Pain level (0–10)
  - Mood
  - Sleep
- Saved in Firestore under `users/{uid}/periods` with timestamps

**History & summary**

- History list shows past cycles with:
  - Start date
  - Flow, pain, mood, sleep
  - Auto‑calculated bleeding days when end date is present

**Analytics (patterns & graphs)**

- Cycle length analysis (requires ≥ 2 cycles)
  - Calculates rough cycle length between logged periods
  - Shows minimum, maximum, and average length
  - Simple bar chart to visualize cycle lengths over time
- Pain trends
  - Bar graph of pain levels per logged period
  - Short insight text (e.g., “Pain tends to be stronger…” vs “Pain levels are manageable…”)
- Mood patterns
  - Aggregated counts per mood
  - Displayed as “pills” like `happy (3)`, `tired (5)`, etc.

**Privacy controls**

- Separate control to delete all stored period data for the current user
- One‑click wipe of `users/{uid}/periods` after confirmation

### Gentle Reminders (`reminders.js` + `dashboard.js`)

- Rule‑based generation of reminders from recent check‑ins:
  - Example: If 3 or more recent check‑ins have stress ≥ 7, creates a “stress_pattern” reminder
- Reminders saved under `users/{uid}/reminders` with:
  - `type` (rule id)
  - `message`
  - `dismissed` flag
  - `createdAt`
- Dashboard displays the first non‑dismissed reminder

### Focus Mode (`focus.html`)

- Dedicated page for focused work / study
- Designed as a clean, distraction‑reduced layout with supporting UI
- Exact controls depend on the HTML content (e.g., timers, tasks, focus tips), but it is independent from Firestore logic and meant for “deep work” sessions

---

## 2. Tech Stack

- **Frontend**
  - HTML, CSS (glassmorphism styling), vanilla JavaScript
- **Backend / Services**
  - Firebase Authentication (email/password)
  - Firebase Firestore (cloud NoSQL database)
- **Data storage**
  - Firestore for most user data (check‑ins, tasks, journal, period cycles, reminders, user quote)
  - `localStorage` for habits (so they work offline and without Firestore)

---

## 3. Project Structure

High‑level file overview:

- `index.html` – Landing/sign‑in / sign‑up page
- `dashboard.html` – Main dashboard UI
- `checkin.html` – Daily mood & state check‑in form
- `journal.html` – Personal journal page
- `todo.html` – Task / to‑do list page
- `calendar.html` – Monthly calendar view of tasks
- `habits.html` – Local habit tracker
- `focus.html` – Focus mode page
- `period.html` – Period logging, analytics, and privacy controls

JavaScript modules:

- `auth.js`
  - Initializes Firebase app + Auth for the login page
  - Implements `login()` and `signup()` handlers
  - Configures session persistence

- `common.js`
  - Initializes Firebase app + Auth + Firestore for “inner” pages
  - Enforces auth guard (redirect to `index.html` if not logged in)
  - Exposes `auth` and `db` exports used by all other JS modules
  - Adds global `logout()` function

- `dashboard.js`
  - Reads last check‑in and reminder for the current user
  - Loads/saves the user’s custom quote

- `checkin.js`
  - Handles mood selection, stress slider, and form submission
  - Saves one document per day in `users/{uid}/checkins`

- `journal.js`
  - Loads and displays journal entries
  - Handles adding new entries to `users/{uid}/journal`

- `todo.js`
  - Creates, lists, updates, and deletes tasks in `users/{uid}/tasks`
  - Supports priorities, completion, and optional dates

- `calendar.js`
  - Displays a monthly calendar with dots on days that have tasks
  - Shows tasks for the selected date

- `habits.js`
  - Manages an array of habits in `localStorage`
  - Renders each habit with a 7‑day clickable row

- `period.js`
  - Saves new period logs and displays a reverse‑chronological history

- `period-analytics.js`
  - Computes cycle lengths and summarises patterns
  - Renders cycle length graph, pain graph, and mood pill counts

- `period-privacy.js`
  - Deletes all documents in `users/{uid}/periods` on user request

- `reminders.js`
  - Scans recent check‑ins to generate rule‑based reminders in Firestore

---

## 4. Getting Started (Local Development)

### 4.1. Prerequisites

- Node.js is **not** strictly required (pure front‑end + CDN‑hosted Firebase), but a simple static server is recommended.
- A Firebase project:
  - Enable **Authentication → Email/Password**
  - Enable **Firestore Database**

### 4.2. Configure Firebase

1. Create a Firebase project in the Firebase console.
2. Copy your web app config from **Project settings → General → Your apps (Web)**.
3. Replace `firebaseConfig` in **both**:
   - `auth.js`
   - `common.js`
4. Make sure the project’s `authDomain`, `projectId`, etc. match exactly.

### 4.3. Run locally

1. Place all files in a single folder (or your preferred structure as long as paths in `<script>` tags are correct).
2. Use any static server:
   - VS Code “Live Server” extension
   - `python -m http.server` (Python 3)
   - Or host via Firebase Hosting / GitHub Pages
3. Open `index.html` in the browser via the server URL (not via `file://`, otherwise some auth/redirects may behave unexpectedly).

### 4.4. First login

1. Go to the sign‑up form on `index.html`.
2. Enter an email and password.
3. After successful sign‑up, you will be redirected to `dashboard.html`.
4. From now on, you will stay logged in until you explicitly log out.

---

## 5. How to Use Each Feature

### 5.1. Dashboard

- Once logged in, you land on `dashboard.html`.
- You will see:
  - Today’s date
  - “Last check‑in” summary if you have already completed a check‑in
  - A gentle reminder if the system detected a stress pattern
  - A daily quote section
- Click “Edit quote” to set your own motivational or reflective quote. It saves to your Firestore `users/{uid}` document.

### 5.2. Daily Check‑in

1. Navigate to the Check‑in page (`checkin.html`).
2. Select a mood by clicking one of the mood buttons.
3. Adjust the stress slider; the current numeric value appears next to it.
4. Fill in sleep, period info, energy, focus, and optional journal text.
5. Click **Submit**:
   - Your data for today is saved in Firestore.
   - You are redirected back to the dashboard.
   - Resetting the form allows you to check in again on a different day.

### 5.3. Journal

1. Open `journal.html`.
2. Choose an optional mood tag for the entry.
3. Write your note in the text area.
4. Save the entry; it appears at the top of the list.
5. Scroll to see older entries. Each entry shows mood, text, and timestamp.

### 5.4. Tasks & Calendar

**Creating tasks (To‑Do page)**

1. Go to `todo.html`.
2. Type a task description.
3. Select a priority color (maps to red/yellow/blue emoji).
4. Optionally choose a date (e.g., deadline or scheduled day). If left empty, today’s date is used.
5. Click **Add**.
6. The task appears in the list:
   - Checkbox toggles completion
   - Trash icon deletes the task after confirmation

**Viewing tasks on the calendar**

1. Go to `calendar.html`.
2. The current month is rendered:
   - Empty cells for leading days before the first of the month
   - Each day shows its number; days with tasks show a small dot
3. Click a day to:
   - Highlight it
   - Display the list of tasks for that date in the side panel/section

### 5.5. Habits Tracker

1. Open `habits.html`.
2. Enter a habit name (e.g., “Drink 2L water”, “Practice swimming starts”).
3. Click **Add**:
   - A new card appears with a row of 7 days (1–7).
4. Click on each day to toggle it as done (`.done` styling).
5. Habits are stored in `localStorage`:
   - They persist in the same browser even without login
   - They will reset if local storage is cleared or a different browser/device is used

### 5.6. Period Tracking & Analytics

**Logging periods**

1. Open `period.html`.
2. Under “Log period”:
   - Set **Start date** (required).
   - Optionally set **End date** once your period ends.
   - Select **Flow**.
   - Set **Pain level** on a 0–10 scale.
   - Optionally choose **Mood** and **Sleep**.
3. Click **Save**.
4. The new entry appears in your period history list.

**Viewing patterns**

- **Cycle summary**:
  - After logging at least two períodos, the analytics compute approximate cycle length.
  - You will see:
    - Typical range (e.g., 25–32 days)
    - Average cycle length
    - Context that variation is normal, especially in teenage years.
- **Pain & mood trends**:
  - Pain graph shows bars for pain level per cycle.
  - Text insight summarises if your pain is generally high vs manageable.
  - Mood summary shows how often each mood appears across cycles as labelled pills.

**Privacy controls**

- In the “Privacy & Control” section:
  - Click the delete button to erase all your logged period data.
  - Confirm the dialog; all `users/{uid}/periods` documents are deleted.
  - This cannot be undone.

### 5.7. Gentle Reminders

- Reminders are created automatically based on recent check‑ins.
- For example, if your stress values have been high in multiple recent logs, a reminder suggests lighter days or rest.
- Only one active reminder per type is kept to avoid spam.
- The dashboard shows the first non‑dismissed reminder (future UI can add “dismiss” functionality).

### 5.8. Focus Mode

- Navigate to `focus.html` to enter a dedicated focus workspace.
- Use it for:
  - Deep work sessions
  - Study blocks
  - Distraction‑free tasks
- The exact options (timers, sections) are defined by the HTML layout and can be customized further.

---

## 6. Data Model (Firestore Collections)

Per user (`users/{uid}`):

- `users` (top‑level)
  - `quote`: string (daily quote)
- `users/{uid}/checkins`
  - `{date}` (e.g. `2026-01-26`):
    - `mood`, `stress`, `sleep`, `period`, `energy`, `focus`, `journal`, `createdAt`
- `users/{uid}/journal`
  - Auto‑id documents:
    - `mood`, `text`, `createdAt`
- `users/{uid}/tasks`
  - Auto‑id documents:
    - `text`, `priority`, `date`, `completed`, `completedAt`, `createdAt`
- `users/{uid}/periods`
  - Auto‑id documents:
    - `startDate`, `endDate`, `flow`, `pain`, `mood`, `sleep`, `createdAt`
- `users/{uid}/reminders`
  - Auto‑id documents:
    - `type`, `message`, `dismissed`, `createdAt`

Habits are stored separately in `localStorage` under a `habits` key with objects like:

```json
{
  "name": "Drink water",
  "days": [false, true, false, ...] // 7 elements
}
