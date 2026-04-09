
const todoInput = document.getElementById('todo-input');
const addButton = document.getElementById('add-button');
const todoList = document.getElementById('todo-list');
const taskCount = document.getElementById('task-count');

function updateTaskCount() {
  const count = todoList.children.length;
  taskCount.textContent = `${count} ${count === 1 ? 'task' : 'tasks'}`;
}

function addTodo() {
  const text = todoInput.value.trim();
  
  if (text === '') return;

  const li = document.createElement('li');

  li.innerHTML = `
    <span class="check-btn">✓</span>
    <span class="todo-text">${text}</span>
    <button class="delete-btn">✕</button>
  `;

  // Mark as complete
  li.querySelector('.check-btn').addEventListener('click', () => {
    li.classList.toggle('completed');
  });

  // Delete task
  li.querySelector('.delete-btn').addEventListener('click', () => {
    li.style.opacity = '0';
    setTimeout(() => {
      li.remove();
      updateTaskCount();
    }, 300);
  });

  todoList.appendChild(li);
  todoInput.value = '';
  updateTaskCount();
}

// Add button click
addButton.addEventListener('click', addTodo);

// Press Enter key
todoInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTodo();
  }
});

// Initialize
updateTaskCount();