// ✅ Ask for Notification permission on page load
if (Notification.permission !== "granted") {
    Notification.requestPermission().catch(err => console.error("Notification permission error:", err));
}

// ✅ Detect current task type based on URL
let storageKey = "tasks";
if (location.pathname.includes("personal.html")) {
    storageKey = "personalTasks";
} else if (location.pathname.includes("professional.html")) {
    storageKey = "professionalTasks";
}

// ✅ Load tasks from specific storage key
let tasks = JSON.parse(localStorage.getItem(storageKey)) || [];
let timers = {}; // Store active timers

// ✅ Add Task
const addTask = (event) => {
    event.preventDefault();
    const taskInput = document.querySelector("input");
    const text = taskInput.value.trim();

    if (text) {
        tasks.push({ text, completed: false, timer: null });
        taskInput.value = "";
        saveTasks();
        updateTasksList();
    }
};

// ✅ Update Task List
const updateTasksList = () => {
    const taskList = document.querySelector(".task-list");
    if (!taskList) return;
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        const listItem = document.createElement("li");
        listItem.className = "taskItem";

        let timerText = "";
        if (task.timer !== null) {
            const h = Math.floor(task.timer / 3600);
            const m = Math.floor((task.timer % 3600) / 60);
            const s = task.timer % 60;
            timerText = `Time left: ${h}h ${m}m ${s < 10 ? "0" : ""}${s}s`;
        }

        listItem.innerHTML = `
            <div class="task" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                <div>
                    <input type="checkbox" class="checkbox" ${task.completed ? "checked" : ""} onclick="toggleTask(${index})"/>
                    <p class="${task.completed ? 'completed' : ''}" id="task-text-${index}">${task.text}</p>
                </div>
                <div class="icons">
                    <button onclick="editTask(${index})">✏</button>
                    <button onclick="deleteTask(${index})">❌</button>
                    <button onclick="markCompleted(${index})">✅</button>
                    <button onclick="setTimer(${index})">⏳</button>
                </div>
            </div>
            <p id="timer-${index}" class="timer-text">${timerText}</p>
        `;
        taskList.appendChild(listItem);
    });

    updateProgress();
};

// ✅ Task functions
const toggleTask = (index) => {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    updateTasksList();
};

const editTask = (index) => {
    const newText = prompt("Edit task:", tasks[index].text);
    if (newText !== null) {
        tasks[index].text = newText.trim();
        saveTasks();
        updateTasksList();
    }
};

const deleteTask = (index) => {
    clearTimer(index);
    tasks.splice(index, 1);
    saveTasks();
    updateTasksList();
};

const markCompleted = (index) => {
    tasks[index].completed = true;
    saveTasks();
    updateTasksList();
};

// ✅ Timer functionality
const setTimer = (index) => {
    const input = prompt("Set timer (in format HH:MM):");
    if (!input) return;

    const parts = input.split(":");
    if (parts.length !== 2) return alert("Enter time in HH:MM format.");

    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || minutes < 0) {
        return alert("Invalid time format. Use 1:30 for 1 hour 30 minutes.");
    }

    const totalSeconds = (hours * 3600) + (minutes * 60);

    clearTimer(index);
    tasks[index].timer = totalSeconds;
    saveTasks();
    updateTasksList();

    timers[index] = setInterval(() => {
        if (tasks[index].timer > 0) {
            tasks[index].timer--;
            const h = Math.floor(tasks[index].timer / 3600);
            const m = Math.floor((tasks[index].timer % 3600) / 60);
            const s = tasks[index].timer % 60;
            document.getElementById(`timer-${index}`).textContent =
                `Time left: ${h}h ${m}m ${s < 10 ? "0" : ""}${s}s`;
            saveTasks();
        } else {
            clearInterval(timers[index]);
            delete timers[index];

            const taskName = tasks[index]?.text || "Unnamed Task";
            tasks[index].timer = null;
            updateTasksList();
            saveTasks();

            if (Notification.permission === "granted") {
                try {
                    new Notification("⏰ Time's up!", {
                        body: `Task: ${taskName}`,
                        icon: "https://cdn-icons-png.flaticon.com/512/1827/1827392.png"
                    });
                } catch (err) {
                    console.error("Notification error:", err);
                    alert(`Time's up for task: ${taskName}`);
                }
            } else {
                alert(`Time's up for task: ${taskName}`);
            }
        }
    }, 1000);
};

const clearTimer = (index) => {
    if (timers[index]) {
        clearInterval(timers[index]);
        delete timers[index];
    }
    if (tasks[index]) {
        tasks[index].timer = null;
    }
};

// ✅ Save to Local Storage
const saveTasks = () => {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
};

// ✅ Update Progress Bar
const updateProgress = () => {
    const progressBar = document.getElementById("progress");
    const progressNumbers = document.getElementById("numbers");
    const completed = tasks.filter(task => task.completed).length;
    const total = tasks.length;
    const percentage = total ? (completed / total) * 100 : 0;

    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressNumbers) progressNumbers.textContent = `${completed} / ${total}`;
};

// ✅ Hamburger Menu Toggle
const hamburgerBtn = document.getElementById("hamburgerBtn");
const menu = document.getElementById("menu");

if (hamburgerBtn && menu) {
    hamburgerBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        menu.classList.toggle("show-menu");
    });

    document.addEventListener("click", function (event) {
        if (!menu.contains(event.target) && event.target !== hamburgerBtn) {
            menu.classList.remove("show-menu");
        }
    });
}

// ✅ Mood-based Suggestions
const emojis = document.querySelectorAll(".emojis span");
const moodMessage = document.getElementById("mood-message");

if (emojis && moodMessage) {
    emojis.forEach((emoji) => {
        emoji.addEventListener("click", () => {
            const mood = emoji.getAttribute("data-mood");
            let message = "";

            switch (mood) {
                case "happy":
                    message = "You’re full of energy! Knock off 2 quick tasks now 💪";
                    break;
                case "neutral":
                    message = "Maybe ease into the day. Start with one light task ☕";
                    break;
                case "sad":
                    message = "It's okay to take a break. Breathe, then do something small 🧘";
                    break;
            }

            moodMessage.textContent = message;
        });
    });
}

// ✅ Load Everything on Start
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    if (form) form.addEventListener("submit", addTask);
    updateTasksList();
});
