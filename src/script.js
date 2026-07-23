// nacist z pameti nebo default
let tasks = JSON.parse(localStorage.getItem('soft_flow_tasks')) || [
    {
        id: 1,
        title: 'Submit Math Homework',
        desc: 'Finish calculus integration exercises from chapter 4.',
        category: 'school',
        priority: 'high',
        time: 'Today 5:00 PM',
        tags: ['math', 'homework'],
        starred: true,
        done: false,
        createdAt: Date.now() - 3600000
    },
    {
        id: 2,
        title: 'Quarterly Team Sync',
        desc: 'Review project goals and present Q3 roadmap.',
        category: 'work',
        priority: 'medium',
        time: 'Tomorrow 10:00 AM',
        tags: ['meeting', 'roadmap'],
        starred: false,
        done: false,
        createdAt: Date.now() - 7200000
    },
    {
        id: 3,
        title: 'Buy Groceries & Stationery',
        desc: 'Notebooks, purple gel pens, organic milk, and berries.',
        category: 'shopping',
        priority: 'low',
        time: 'This weekend',
        tags: ['errands'],
        starred: false,
        done: true,
        createdAt: Date.now() - 86400000
    }
];

// filtry
let currentTab = 'active';
let currentCategory = 'all';

// ulozit uikoly
function saveToStorage() {
    localStorage.setItem('soft_flow_tasks', JSON.stringify(tasks));
}

// ulozit poznamky
function saveQuickNotes() {
    const val = document.getElementById('quick-notepad').value;
    localStorage.setItem('soft_flow_notes', val);
}

// nacist poznamky
function loadQuickNotes() {
    const val = localStorage.getItem('soft_flow_notes');
    if (val) document.getElementById('quick-notepad').value = val;
}

// hlavni vykresleni
function renderTasks() {
    const grid = document.getElementById('task-grid');
    const searchVal = document.getElementById('search-input')?.value.toLowerCase() || '';
    const priorityFilter = document.getElementById('priority-filter')?.value || 'all';
    const sortBy = document.getElementById('sort-select')?.value || 'newest';

    if (!grid) return;

    // filtr zalozky
    let filtered = tasks.filter(task => {
        if (currentTab === 'active') return !task.done;
        if (currentTab === 'completed') return task.done;
        if (currentTab === 'starred') return task.starred;
        return true;
    });

    // filtr kategorie
    if (currentCategory !== 'all') {
        filtered = filtered.filter(task => task.category === currentCategory);
    }

    // filtr priority
    if (priorityFilter !== 'all') {
        filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // vyhledavani
    if (searchVal.trim() !== '') {
        filtered = filtered.filter(task => 
            task.title.toLowerCase().includes(searchVal) ||
            task.desc.toLowerCase().includes(searchVal) ||
            task.tags.some(tag => tag.toLowerCase().includes(searchVal))
        );
    }

    // radit
    filtered.sort((a, b) => {
        if (sortBy === 'newest') return b.createdAt - a.createdAt;
        if (sortBy === 'oldest') return a.createdAt - b.createdAt;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'priority') {
            const map = { high: 3, medium: 2, low: 1 };
            return map[b.priority] - map[a.priority];
        }
        return 0;
    });

    updateMetrics();

    // prazdny stav
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-feather-pointed"></i></div>
                <p>No tasks found in this view.</p>
            </div>`;
        return;
    }

    // render do html
    grid.innerHTML = filtered.map(task => {
        const catDetails = {
            work: { label: 'Work', icon: 'fa-briefcase', class: 'cat-work' },
            school: { label: 'School', icon: 'fa-graduation-cap', class: 'cat-school' },
            personal: { label: 'Personal', icon: 'fa-user', class: 'cat-personal' },
            shopping: { label: 'Shopping', icon: 'fa-basket-shopping', class: 'cat-shopping' }
        }[task.category] || { label: 'General', icon: 'fa-tag', class: 'cat-personal' };

        const priorityLabel = {
            low: 'Low',
            medium: 'Medium',
            high: 'High'
        }[task.priority] || 'Medium';

        return `
        <div class="task-card priority-${task.priority} ${task.done ? 'done' : ''}">
            <div class="card-top">
                <span class="category-badge ${catDetails.class}">
                    <i class="fas ${catDetails.icon}"></i> ${catDetails.label}
                </span>

                <div class="card-actions">
                    <button class="btn-action btn-star ${task.starred ? 'is-starred' : ''}" 
                            onclick="toggleStar(${task.id})" 
                            title="Star task">
                        <i class="fas fa-star"></i>
                    </button>

                    <button class="btn-action btn-check ${task.done ? 'is-done' : ''}" 
                            onclick="toggleDone(${task.id})" 
                            title="${task.done ? 'Mark active' : 'Mark completed'}">
                        <i class="fas ${task.done ? 'fa-circle-check' : 'fa-check'}"></i>
                    </button>

                    <button class="btn-action btn-delete" 
                            onclick="deleteTask(${task.id})" 
                            title="Delete task">
                        <i class="fas fa-trash-can"></i>
                    </button>
                </div>
            </div>

            <div class="card-body">
                <h3 class="card-title">${escapeHtml(task.title)}</h3>
                <p class="card-desc">${escapeHtml(task.desc)}</p>
            </div>

            ${task.tags && task.tags.length > 0 ? `
            <div class="card-tags">
                ${task.tags.map(tag => `<span class="tag-pill">#${escapeHtml(tag.trim())}</span>`).join('')}
            </div>
            ` : ''}

            <div class="card-footer">
                <span class="priority-indicator p-${task.priority}">
                    <i class="fas fa-flag"></i> ${priorityLabel}
                </span>
                <span class="time-stamp">
                    <i class="far fa-clock"></i> ${escapeHtml(task.time)}
                </span>
            </div>
        </div>
        `;
    }).join('');
}

// pocitadla
function updateMetrics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.done).length;
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-pending').innerText = pending;
    document.getElementById('stat-completed').innerText = completed;
    document.getElementById('stat-percentage').innerText = `${percentage}%`;

    document.getElementById('progress-text').innerText = `${percentage}%`;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
}

// zmena kategorie
function setCategoryFilter(category) {
    currentCategory = category;
    document.querySelectorAll('.cat-filter').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    renderTasks();
}

// zmena zalozky
function switchTab(tab) {
    currentTab = tab;
    document.getElementById('tab-active').classList.toggle('active', tab === 'active');
    document.getElementById('tab-completed').classList.toggle('active', tab === 'completed');
    document.getElementById('tab-starred').classList.toggle('active', tab === 'starred');
    renderTasks();
}

// otevrit modal
function openModal() {
    document.getElementById('modal-overlay').classList.add('open');
}

// zavrit modal
function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    document.getElementById('input-title').value = '';
    document.getElementById('input-desc').value = '';
    document.getElementById('input-time').value = '';
    document.getElementById('input-tags').value = '';
}

// novy ukol
function addTask() {
    const title = document.getElementById('input-title').value.trim();
    const desc = document.getElementById('input-desc').value.trim() || 'No description provided';
    const category = document.getElementById('input-category').value;
    const priority = document.getElementById('input-priority').value;
    const time = document.getElementById('input-time').value.trim() || 'No due time';
    const tagsInput = document.getElementById('input-tags').value.trim();

    // kontrolovat nazev
    if (title === '') {
        alert('Please enter a task title.');
        return;
    }

    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0) : [];

    const newTask = {
        id: Date.now(),
        title,
        desc,
        category,
        priority,
        time,
        tags,
        starred: false,
        done: false,
        createdAt: Date.now()
    };

    tasks.unshift(newTask);
    saveToStorage();
    closeModal();
    renderTasks();
}

// splnit
function toggleDone(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.done = !task.done;
        saveToStorage();
        renderTasks();
    }
}

// hvezdicka
function toggleStar(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.starred = !task.starred;
        saveToStorage();
        renderTasks();
    }
}

// smazat
function deleteTask(id) {
    if (confirm('Delete this task permanently?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveToStorage();
        renderTasks();
    }
}

// smazat hotove
function clearCompleted() {
    if (confirm('Clear all completed tasks?')) {
        tasks = tasks.filter(t => !t.done);
        saveToStorage();
        renderTasks();
    }
}

// export
function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "tasks_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// dark mode
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const icon = document.getElementById('theme-icon');
    if (document.body.classList.contains('dark-theme')) {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// osetreni xss
function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}

// init
document.addEventListener('DOMContentLoaded', () => {
    loadQuickNotes();
    renderTasks();
});