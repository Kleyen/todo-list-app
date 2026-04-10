// ─────────────────────────────────────────────
//  CONFIG — change this when backend is ready
// ─────────────────────────────────────────────
const API_URL = 'http://127.0.0.1:5000';
const USE_BACKEND = false; // flip to true once Flask is running


// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
let tasks  = [];       // array of task objects
let filter = 'all';    // 'all' | 'active' | 'completed'


// ─────────────────────────────────────────────
//  DOM REFERENCES
// ─────────────────────────────────────────────
const input         = document.getElementById('todo-input');
const addBtn        = document.getElementById('add-btn');
const todoList      = document.getElementById('todo-list');
const emptyState    = document.getElementById('empty-state');
const taskCount     = document.getElementById('task-count');
const clearBtn      = document.getElementById('clear-completed');
const filterButtons = document.querySelectorAll('.filter-btn');
const dateLabel     = document.getElementById('date-label');


// ─────────────────────────────────────────────
//  DATE
// ─────────────────────────────────────────────
function setDate() {
  const now = new Date();
  dateLabel.textContent = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
  });
}


// ─────────────────────────────────────────────
//  API CALLS  (used when USE_BACKEND = true)
// ─────────────────────────────────────────────

// GET /tasks  — load all tasks from database
async function fetchTasks() {
  const res  = await fetch(`${API_URL}/tasks`);
  const data = await res.json();
  tasks = data;
  render();
}

// POST /tasks  — save a new task
async function createTask(title) {
  const res  = await fetch(`${API_URL}/tasks`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ title }),
  });
  const data = await res.json();
  tasks.push(data);
  render();
}

// PUT /tasks/:id  — update a task (title or completed)
async function updateTask(id, changes) {
  await fetch(`${API_URL}/tasks/${id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(changes),
  });
}

// DELETE /tasks/:id  — remove a task
async function deleteTask(id) {
  await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
}


// ─────────────────────────────────────────────
//  LOCAL (no backend) — simple helpers
// ─────────────────────────────────────────────
function localAdd(title) {
  const task = {
    id:        Date.now(),       // temporary id using timestamp
    title,
    completed: false,
  };
  tasks.push(task);
  render();
}

function localToggle(id) {
  const task    = tasks.find(t => t.id === id);
  task.completed = !task.completed;
  render();
}

function localEdit(id, newTitle) {
  const task = tasks.find(t => t.id === id);
  task.title  = newTitle;
  render();
}

function localDelete(id) {
  tasks = tasks.filter(t => t.id !== id);
  render();
}


// ─────────────────────────────────────────────
//  ACTIONS — calls local or API depending on flag
// ─────────────────────────────────────────────
function handleAdd(title) {
  if (USE_BACKEND) {
    createTask(title);
  } else {
    localAdd(title);
  }
}

function handleToggle(id) {
  const task    = tasks.find(t => t.id === id);
  task.completed = !task.completed;
  if (USE_BACKEND) updateTask(id, { completed: task.completed });
  render();
}

function handleEdit(id, newTitle) {
  const task = tasks.find(t => t.id === id);
  task.title  = newTitle;
  if (USE_BACKEND) updateTask(id, { title: newTitle });
  render();
}

function handleDelete(id) {
  if (USE_BACKEND) deleteTask(id);
  tasks = tasks.filter(t => t.id !== id);
  render();
}

function handleClearCompleted() {
  const completed = tasks.filter(t => t.completed);
  if (USE_BACKEND) {
    completed.forEach(t => deleteTask(t.id));
  }
  tasks = tasks.filter(t => !t.completed);
  render();
}


// ─────────────────────────────────────────────
//  RENDER — builds the task list from state
// ─────────────────────────────────────────────
function render() {
  const filtered = tasks.filter(task => {
    if (filter === 'active')    return !task.completed;
    if (filter === 'completed') return  task.completed;
    return true;
  });

  todoList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.add('visible');
  } else {
    emptyState.classList.remove('visible');

    filtered.forEach(task => {
      const li = buildTaskElement(task);
      todoList.appendChild(li);
    });
  }

  // update footer count (always based on ALL tasks, not filtered)
  const remaining = tasks.filter(t => !t.completed).length;
  taskCount.textContent = `${remaining} ${remaining === 1 ? 'task' : 'tasks'} remaining`;
}


// ─────────────────────────────────────────────
//  BUILD TASK ELEMENT
// ─────────────────────────────────────────────
function buildTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (task.completed ? ' completed' : '');
  li.dataset.id = task.id;

  // --- Checkbox circle ---
  const checkBtn = document.createElement('button');
  checkBtn.className   = 'check-btn';
  checkBtn.textContent = task.completed ? '✓' : '';
  checkBtn.setAttribute('aria-label', 'Toggle complete');

  checkBtn.addEventListener('click', () => {
    handleToggle(task.id);
  });

  // --- Task text ---
  const textSpan = document.createElement('span');
  textSpan.className   = 'task-text';
  textSpan.textContent = task.title;

  // --- Action buttons ---
  const actions = document.createElement('div');
  actions.className = 'task-actions';

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.className  = 'icon-btn edit';
  editBtn.innerHTML  = `
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9.5 1.5l3 3L4 13H1v-3L9.5 1.5z"
            stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;
  editBtn.setAttribute('aria-label', 'Edit task');

  editBtn.addEventListener('click', () => startEditing(li, task, textSpan));

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'icon-btn delete';
  deleteBtn.innerHTML = `
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1 1l11 11M12 1L1 12"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;
  deleteBtn.setAttribute('aria-label', 'Delete task');

  deleteBtn.addEventListener('click', () => {
    li.classList.add('removing');
    setTimeout(() => handleDelete(task.id), 250);
  });

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(checkBtn);
  li.appendChild(textSpan);
  li.appendChild(actions);

  return li;
}


// ─────────────────────────────────────────────
//  INLINE EDIT
// ─────────────────────────────────────────────
function startEditing(li, task, textSpan) {
  const editInput = document.createElement('input');
  editInput.type      = 'text';
  editInput.className = 'edit-input';
  editInput.value     = task.title;
  editInput.maxLength = 120;

  li.replaceChild(editInput, textSpan);
  editInput.focus();
  editInput.select();

  function saveEdit() {
    const newTitle = editInput.value.trim();
    if (newTitle && newTitle !== task.title) {
      handleEdit(task.id, newTitle);
    } else {
      render(); // revert if empty or unchanged
    }
  }

  editInput.addEventListener('blur',    saveEdit);
  editInput.addEventListener('keydown', e => {
    if (e.key === 'Enter')  saveEdit();
    if (e.key === 'Escape') render();   // cancel edit
  });
}


// ─────────────────────────────────────────────
//  INPUT — add task
// ─────────────────────────────────────────────
function submitTask() {
  const title = input.value.trim();

  if (!title) {
    // shake animation feedback
    input.classList.remove('shake');
    void input.offsetWidth;           // force reflow to restart animation
    input.classList.add('shake');
    input.addEventListener('animationend', () => {
      input.classList.remove('shake');
    }, { once: true });
    return;
  }

  handleAdd(title);
  input.value = '';
  input.focus();
}

addBtn.addEventListener('click', submitTask);
input.addEventListener('keypress', e => {
  if (e.key === 'Enter') submitTask();
});


// ─────────────────────────────────────────────
//  FILTERS
// ─────────────────────────────────────────────
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filter = btn.dataset.filter;
    render();
  });
});


// ─────────────────────────────────────────────
//  CLEAR COMPLETED
// ─────────────────────────────────────────────
clearBtn.addEventListener('click', handleClearCompleted);


// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
setDate();

if (USE_BACKEND) {
  fetchTasks();   // load tasks from Flask database
} else {
  render();       // start with empty local state
}