
"use strict";

// ---------- DOM elements ----------
const taskFormSection = document.getElementById("task-form-section");
const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");

const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const dueDateInput = document.getElementById("task-due-date");
const priorityInput = document.getElementById("task-priority");
const statusInput = document.getElementById("task-status");

const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const priorityFilter = document.getElementById("priority-filter");

const STORAGE_KEY = "taskflow_tasks";

const VALID_STATUSES = ["To Do", "In Progress", "Completed"];
const VALID_PRIORITIES = ["Low", "Medium", "High"];

// ---------- Application state ----------
let tasks = loadTasks();
let editingTaskId = null;

// ---------- LocalStorage ----------
function loadTasks() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);

        if (!storedData) {
            return [];
        }

        const parsedData = JSON.parse(storedData);

        if (!Array.isArray(parsedData)) {
            console.warn("Saved task data is not an array. Starting with an empty list.");
            return [];
        }

        // Ignore malformed records rather than breaking the dashboard.
        return parsedData.filter(isValidStoredTask);
    } catch (error) {
        console.error("Could not load saved tasks:", error);
        return [];
    }
}

function isValidStoredTask(task) {
    return (
        task !== null &&
        typeof task === "object" &&
        typeof task.id === "string" &&
        typeof task.title === "string" &&
        task.title.trim().length > 0 &&
        typeof task.description === "string" &&
        typeof task.dueDate === "string" &&
        isValidDateString(task.dueDate) &&
        VALID_PRIORITIES.includes(task.priority) &&
        VALID_STATUSES.includes(task.status)
    );
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        return true;
    } catch (error) {
        console.error("Could not save tasks:", error);
        alert("Your changes could not be saved in this browser. Please check your browser storage settings.");
        return false;
    }
}

// ---------- Utility functions ----------
function isValidDateString(value) {
    if (value === "") {
        return true;
    }

    if (typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

function formatDate(dateString) {
    if (!dateString) {
        return "No due date";
    }

    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(date);
}

// Escape user-provided text before placing it into HTML.
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

function createTaskId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2)
    );
}

// ---------- Form controls ----------
function openTaskForm(task = null) {
    editingTaskId = task ? task.id : null;

    taskForm.reset();
    clearErrors();

    document.getElementById("form-heading").textContent =
        task ? "Edit Task" : "Add New Task";

    document.getElementById("save-task-button").textContent =
        task ? "Update Task" : "Save Task";

    if (task) {
        titleInput.value = task.title;
        descriptionInput.value = task.description;
        dueDateInput.value = task.dueDate;
        priorityInput.value = task.priority;
        statusInput.value = task.status;
    } else {
        priorityInput.value = "Medium";
        statusInput.value = "To Do";
    }

    taskFormSection.hidden = false;
    taskFormSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    titleInput.focus({ preventScroll: true });
}

function closeTaskForm() {
    taskForm.reset();
    taskFormSection.hidden = true;
    editingTaskId = null;
    clearErrors();
}

function clearErrors() {
    document.getElementById("title-error").textContent = "";
    document.getElementById("date-error").textContent = "";

    titleInput.removeAttribute("aria-invalid");
    dueDateInput.removeAttribute("aria-invalid");
}

function validateForm() {
    clearErrors();

    const title = titleInput.value.trim();
    const dueDate = dueDateInput.value;
    let isValid = true;

    if (!title) {
        document.getElementById("title-error").textContent =
            "Please enter a task title.";

        titleInput.setAttribute("aria-invalid", "true");
        isValid = false;
    } else if (title.length > 120) {
        document.getElementById("title-error").textContent =
            "The title cannot exceed 120 characters.";

        titleInput.setAttribute("aria-invalid", "true");
        isValid = false;
    }

    if (!isValidDateString(dueDate)) {
        document.getElementById("date-error").textContent =
            "Please enter a valid calendar date.";

        dueDateInput.setAttribute("aria-invalid", "true");
        isValid = false;
    }

    if (!VALID_PRIORITIES.includes(priorityInput.value)) {
        alert("Please select a valid priority.");
        isValid = false;
    }

    if (!VALID_STATUSES.includes(statusInput.value)) {
        alert("Please select a valid status.");
        isValid = false;
    }

    return isValid;
}

// ---------- Create and update tasks ----------
function handleFormSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    const title = titleInput.value.trim();

    const taskData = {
        title: title,
        description: descriptionInput.value.trim(),
        dueDate: dueDateInput.value,
        priority: priorityInput.value,
        status: statusInput.value
    };

    if (editingTaskId) {
        const index = tasks.findIndex(
            task => task.id === editingTaskId
        );

        if (index === -1) {
            alert("This task could not be found. Please try again.");
            closeTaskForm();
            return;
        }

        const updatedTasks = tasks.map(task =>
            task.id === editingTaskId
                ? { ...task, ...taskData }
                : task
        );

        const previousTasks = tasks;
        tasks = updatedTasks;

        if (!saveTasks()) {
            tasks = previousTasks;
            return;
        }
    } else {
        const newTask = {
            id: createTaskId(),
            ...taskData,
            createdAt: new Date().toISOString()
        };

        const previousTasks = tasks;
        tasks = [...tasks, newTask];

        if (!saveTasks()) {
            tasks = previousTasks;
            return;
        }
    }

    closeTaskForm();
    renderDashboard();
}

// ---------- Delete tasks ----------
function deleteTask(taskId) {
    const task = tasks.find(item => item.id === taskId);

    if (!task) {
        return;
    }

    const confirmed = window.confirm(
        `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) {
        return;
    }

    const previousTasks = tasks;
    tasks = tasks.filter(item => item.id !== taskId);

    if (!saveTasks()) {
        tasks = previousTasks;
        return;
    }

    renderDashboard();
}

// ---------- Change task status ----------
function changeTaskStatus(taskId, newStatus) {
    if (!VALID_STATUSES.includes(newStatus)) {
        renderDashboard();
        return;
    }

    const previousTasks = tasks;

    tasks = tasks.map(task =>
        task.id === taskId
            ? { ...task, status: newStatus }
            : task
    );

    if (!saveTasks()) {
        tasks = previousTasks;
    }

    renderDashboard();
}

// ---------- Search and filters ----------
function getFilteredTasks() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const selectedPriority = priorityFilter.value;

    return tasks.filter(task => {
        const matchesSearch =
            task.title.toLowerCase().includes(searchTerm);

        const matchesStatus =
            selectedStatus === "all" ||
            task.status === selectedStatus;

        const matchesPriority =
            selectedPriority === "all" ||
            task.priority === selectedPriority;

        return matchesSearch && matchesStatus && matchesPriority;
    });
}

// ---------- Render task cards ----------
function renderTasks() {
    const filteredTasks = getFilteredTasks();

    document.getElementById("visible-task-count").textContent =
        `${filteredTasks.length} ${filteredTasks.length === 1 ? "task" : "tasks"}`;

    if (filteredTasks.length === 0) {
        const hasTasks = tasks.length > 0;
        const heading = hasTasks ? "No matching tasks" : "No tasks yet";
        const message = hasTasks
            ? "Try changing your search or filters."
            : "Add your first task to get started.";

        taskList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✓</div>
                <h3>${heading}</h3>
                <p>${message}</p>
            </div>
        `;

        return;
    }

    taskList.innerHTML = filteredTasks.map(task => {
        const priorityClass = task.priority.toLowerCase().replace(/\s+/g, "-");
        const statusClass = task.status.toLowerCase().replace(/\s+/g, "-");

        return `
            <article class="task-card priority-${priorityClass}">
                <div class="task-details">
                    <h3 class="task-title">${escapeHTML(task.title)}</h3>

                    ${
                        task.description
                            ? `<p class="task-description">${escapeHTML(task.description)}</p>`
                            : ""
                    }

                    <div class="task-meta">
                        <span class="task-date">
                            <span aria-hidden="true">▦</span>
                            ${escapeHTML(formatDate(task.dueDate))}
                        </span>

                        <span class="priority-label priority-${priorityClass}">
                            <span aria-hidden="true">⚑</span>
                            ${escapeHTML(task.priority)}
                        </span>

                        <label>
                            <span class="sr-only">Status for ${escapeHTML(task.title)}</span>
                            <select
                                class="status-select status-${statusClass}"
                                data-action="status"
                                data-id="${escapeHTML(task.id)}"
                                aria-label="Change status for ${escapeHTML(task.title)}"
                            >
                                ${VALID_STATUSES.map(status => `
                                    <option value="${status}"
                                        ${task.status === status ? "selected" : ""}>
                                        ${status}
                                    </option>
                                `).join("")}
                            </select>
                        </label>
                    </div>
                </div>

                <div class="task-actions">
                    <button
                        type="button"
                        class="action-button edit-button"
                        data-action="edit"
                        data-id="${escapeHTML(task.id)}"
                        aria-label="Edit ${escapeHTML(task.title)}"
                        title="Edit task"
                    >✎</button>

                    <button
                        type="button"
                        class="action-button delete-button"
                        data-action="delete"
                        data-id="${escapeHTML(task.id)}"
                        aria-label="Delete ${escapeHTML(task.title)}"
                        title="Delete task"
                    >⌫</button>
                </div>
            </article>
        `;
    }).join("");
}

// ---------- Render dashboard statistics ----------
function renderStatistics() {
    const total = tasks.length;
    const pending = tasks.filter(task => task.status === "To Do").length;
    const inProgress = tasks.filter(task => task.status === "In Progress").length;
    const completed = tasks.filter(task => task.status === "Completed").length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("total-tasks").textContent = total;
    document.getElementById("pending-tasks").textContent = pending;
    document.getElementById("progress-tasks").textContent = inProgress;
    document.getElementById("completed-tasks").textContent = completed;

    document.getElementById("progress-percentage").textContent =
        `${percentage}% Completed`;

    document.getElementById("progress-fill").style.width =
        `${percentage}%`;

    const progressTrack = document.getElementById("progress-track");
    progressTrack.setAttribute("aria-valuenow", percentage);

    document.getElementById("progress-count").textContent =
        `${completed} of ${total} ${total === 1 ? "task" : "tasks"}`;
}

function renderDashboard() {
    renderStatistics();
    renderTasks();
}

// ---------- Navigation ----------
function showCompletedTasks() {
    statusFilter.value = "Completed";
    renderTasks();

    document.getElementById("tasks").scrollIntoView({
        behavior: "smooth"
    });

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");
    });

    document.getElementById("completed-link").classList.add("active");
}

function closeMobileMenu() {
    document.querySelector(".sidebar").classList.remove("open");
    document.getElementById("menu-toggle").setAttribute("aria-expanded", "false");
}

// ---------- Event listeners ----------
document.getElementById("add-task-button").addEventListener("click", () => {
    openTaskForm();
});

document.getElementById("sidebar-add").addEventListener("click", () => {
    closeMobileMenu();
    openTaskForm();
});

document.getElementById("cancel-task-button").addEventListener("click", closeTaskForm);
document.getElementById("close-form").addEventListener("click", closeTaskForm);
taskForm.addEventListener("submit", handleFormSubmit);

searchInput.addEventListener("input", renderTasks);
statusFilter.addEventListener("change", renderTasks);
priorityFilter.addEventListener("change", renderTasks);

titleInput.addEventListener("input", () => {
    if (titleInput.value.trim()) {
        document.getElementById("title-error").textContent = "";
        titleInput.removeAttribute("aria-invalid");
    }
});

dueDateInput.addEventListener("change", () => {
    if (isValidDateString(dueDateInput.value)) {
        document.getElementById("date-error").textContent = "";
        dueDateInput.removeAttribute("aria-invalid");
    }
});

// Event delegation handles buttons and status selectors in task cards.
taskList.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const taskId = button.dataset.id;
    const action = button.dataset.action;

    if (action === "edit") {
        const task = tasks.find(item => item.id === taskId);

        if (task) {
            openTaskForm(task);
        }
    }

    if (action === "delete") {
        deleteTask(taskId);
    }
});

taskList.addEventListener("change", event => {
    const select = event.target.closest('select[data-action="status"]');

    if (select) {
        changeTaskStatus(select.dataset.id, select.value);
    }
});

document.getElementById("completed-link").addEventListener("click", event => {
    event.preventDefault();
    closeMobileMenu();
    showCompletedTasks();
});

document.getElementById("menu-toggle").addEventListener("click", () => {
    const sidebar = document.querySelector(".sidebar");
    const isOpen = sidebar.classList.toggle("open");

    document.getElementById("menu-toggle").setAttribute(
        "aria-expanded",
        String(isOpen)
    );
});

document.querySelectorAll(".navigation a").forEach(link => {
    link.addEventListener("click", closeMobileMenu);
});

// ---------- Initial display ----------
renderDashboard();
