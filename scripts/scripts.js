// ===== Datos =====
const STATUSES = ['todo', 'doing', 'done'];
const NAMES = { todo: 'Pendiente', doing: 'En progreso', done: 'Hecho' };
const PRIORITIES = { alta: 'Alta', media: 'Media', baja: 'Baja' };
const STORAGE_KEY = 'kanban-tareas';

// Tareas de ejemplo para que el tablero no se vea vacío la primera vez
const EXAMPLES = [
  { title: 'Subir el portafolio a Netlify', priority: 'alta', status: 'doing' },
  { title: 'Terminar el chat con IA', priority: 'media', status: 'todo' },
  { title: 'Sacar un certificado de Cisco', priority: 'baja', status: 'todo' },
  { title: 'Corregir la ortografía del portafolio', priority: 'media', status: 'done' },
];

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (e) {}
  return EXAMPLES.map(task => ({ ...task, id: newId() }));
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch (e) {}
}

let tasks = load();

// ===== Elementos de la página =====
const board = document.getElementById('board');
const form = document.getElementById('new-task');
const titleInput = document.getElementById('task-title');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  // textContent y no innerHTML: si alguien escribe <script> en una tarea, se muestra como texto
  if (text !== undefined) node.textContent = text;
  return node;
}

// ===== Dibujar el tablero =====
function actionButton(action, symbol, label, hidden) {
  const btn = el('button', 'icon-btn', symbol);
  btn.type = 'button';
  btn.dataset.action = action;
  btn.setAttribute('aria-label', label);
  btn.disabled = hidden;
  return btn;
}

function card(task, newCardId) {
  const index = STATUSES.indexOf(task.status);
  const prev = STATUSES[index - 1];
  const next = STATUSES[index + 1];
  const li = el('li', 'task');
  li.draggable = true;
  li.dataset.id = task.id;
  li.dataset.priority = task.priority;
  if (task.id === newCardId) li.classList.add('enter');

  const actions = el('div', 'task-actions');
  actions.append(
    actionButton('left', '←', prev ? `Mover a ${NAMES[prev]}` : '', !prev),
    actionButton('right', '→', next ? `Mover a ${NAMES[next]}` : '', !next),
    actionButton('delete', '✕', 'Eliminar tarea', false),
  );
  li.append(el('span', 'priority', PRIORITIES[task.priority]), el('p', 'task-title', task.title), actions);
  return li;
}

function render(newCardId) {
  STATUSES.forEach(status => {
    const list = board.querySelector(`.list[data-status="${status}"]`);
    const columnTasks = tasks.filter(t => t.status === status);
    list.replaceChildren(...columnTasks.map(t => card(t, newCardId)));
    board.querySelector(`[data-count="${status}"]`).textContent = columnTasks.length;
  });
  document.getElementById('clear-done').hidden = !tasks.some(t => t.status === 'done');
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  const task = { id: newId(), title, priority: document.getElementById('task-priority').value, status: 'todo' };
  tasks.push(task);
  save();
  render(task.id);
  form.reset();
  titleInput.focus();
});

render();