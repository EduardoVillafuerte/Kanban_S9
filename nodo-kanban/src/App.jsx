import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  PRIORITIES,
  STATUSES,
  TEAM,
  createInitialProjects,
  getHue,
  normalizeText,
  todayStr,
} from './data/seed';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import DashboardView from './components/DashboardView';

const STORAGE_KEY = 'nodo_react_v1';

const loadInitialState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback si localStorage no está disponible
  }
  return {
    projects: createInitialProjects(),
    currentProjectIdx: 0,
    theme: 'dark',
    activityLog: [],
  };
};

export default function App() {
  const initial = useMemo(() => loadInitialState(), []);
  const [projects, setProjects] = useState(initial.projects);
  const [currentProjectIdx, setCurrentProjectIdx] = useState(initial.currentProjectIdx);
  const [theme, setTheme] = useState(initial.theme);
  const [activityLog, setActivityLog] = useState(initial.activityLog);

  const [view, setView] = useState('board');
  const [filters, setFilters] = useState({
    q: '',
    assignees: [],
    priorities: [],
    tags: [],
    late: false,
  });
  const [dragOverCol, setDragOverCol] = useState(null);
  const [modalTask, setModalTask] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const searchInputRef = useRef(null);
  const currentProject = projects[currentProjectIdx] || projects[0];

  // Persistir cambios en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ projects, currentProjectIdx, theme, activityLog })
      );
    } catch {
      // ignorar errores de cuota
    }
  }, [projects, currentProjectIdx, theme, activityLog]);

  // Aplicar tema al documento
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Atajo de teclado / o Ctrl+K para buscar
  useEffect(() => {
    const onKeyDown = (ev) => {
      const isInput = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '');
      if ((ev.key === 'k' && (ev.ctrlKey || ev.metaKey)) || (ev.key === '/' && !isInput)) {
        if (searchInputRef.current) {
          ev.preventDefault();
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    window.clearTimeout(window.__nodoToastTimer);
    window.__nodoToastTimer = window.setTimeout(() => setToastMsg(''), 3000);
  };

  const addLog = (text) => {
    const time = new Date().toLocaleTimeString();
    setActivityLog((prev) => [`Juan ${text} · ${time}`, ...prev].slice(0, 30));
  };

  const updateCurrentTasks = (updater) => {
    setProjects((prev) =>
      prev.map((proj, idx) =>
        idx === currentProjectIdx ? { ...proj, tasks: updater(proj.tasks) } : proj
      )
    );
  };

  // Crear o editar tarea
  const handleSaveTask = (taskData) => {
    if (taskData.id) {
      updateCurrentTasks((tasks) =>
        tasks.map((t) => (t.id === taskData.id ? { ...t, ...taskData } : t))
      );
      addLog(`editó «${taskData.title}»`);
      showToast('Tarea actualizada');
    } else {
      const allIds = projects.flatMap((p) => p.tasks.map((t) => t.id));
      const nextId = Math.max(0, ...allIds) + 1;
      updateCurrentTasks((tasks) => [...tasks, { ...taskData, id: nextId }]);
      addLog(`creó «${taskData.title}»`);
      showToast('Tarea creada');
    }
    setModalTask(null);
  };

  // Eliminar tarea
  const handleDeleteTask = (taskId) => {
    const target = currentProject.tasks.find((t) => t.id === taskId);
    updateCurrentTasks((tasks) => tasks.filter((t) => t.id !== taskId));
    if (target) addLog(`eliminó «${target.title}»`);
    showToast('Tarea eliminada');
    setModalTask(null);
  };

  // Cambiar estado de una tarea
  const handleStatusChange = (taskId, newStatus) => {
    const target = currentProject.tasks.find((t) => t.id === taskId);
    if (!target || target.status === newStatus) return;

    updateCurrentTasks((tasks) =>
      tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    const statusLabel = STATUSES.find((s) => s.id === newStatus)?.label || '';
    addLog(`movió «${target.title}» a ${statusLabel}`);
    showToast(`Movida a ${statusLabel}`);
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', String(taskId));
  };

  const handleDrop = (e, statusId) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = Number(e.dataTransfer.getData('text/plain'));
    if (taskId) handleStatusChange(taskId, statusId);
  };

  const handleNewProject = () => {
    const name = window.prompt('Nombre del nuevo proyecto:');
    if (!name || !name.trim()) return;
    const newProj = { id: Date.now(), name: name.trim(), tasks: [] };
    setProjects((prev) => [...prev, newProj]);
    setCurrentProjectIdx(projects.length);
    addLog(`creó el proyecto ${newProj.name}`);
  };

  const toggleFilter = (key, value) => {
    setFilters((prev) => {
      const list = prev[key];
      const next = list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
      return { ...prev, [key]: next };
    });
  };

  const clearFilters = () =>
    setFilters({ q: '', assignees: [], priorities: [], tags: [], late: false });

  const allTags = useMemo(
    () => [...new Set(currentProject.tasks.flatMap((t) => t.tags))].sort(),
    [currentProject.tasks]
  );

  const filteredTasks = useMemo(() => {
    const atTokens = [];
    const hashTokens = [];
    const bangTokens = [];
    const textTokens = [];

    normalizeText(filters.q)
      .split(/\s+/)
      .filter(Boolean)
      .forEach((tok) => {
        if (tok.startsWith('@')) atTokens.push(tok.slice(1));
        else if (tok.startsWith('#')) hashTokens.push(tok.slice(1));
        else if (tok.startsWith('!')) bangTokens.push(tok.slice(1));
        else textTokens.push(tok);
      });

    const normPriorities = PRIORITIES.map(normalizeText);

    return currentProject.tasks.filter((task) => {
      const haystack = normalizeText(
        `${task.title} ${task.description} ${task.assignee} ${task.tags.join(' ')}`
      );

      const matchesText = textTokens.every((k) => haystack.includes(k));
      const matchesAt = atTokens.every((k) => normalizeText(task.assignee).startsWith(k));
      const matchesHash = hashTokens.every((k) =>
        task.tags.some((g) => normalizeText(g).startsWith(k))
      );
      const matchesBang = bangTokens.every((k) =>
        normPriorities[task.priority].startsWith(k)
      );
      const matchesAssigneePill =
        filters.assignees.length === 0 || filters.assignees.includes(task.assignee);
      const matchesPriorityPill =
        filters.priorities.length === 0 || filters.priorities.includes(task.priority);
      const matchesTagPill =
        filters.tags.length === 0 || filters.tags.some((g) => task.tags.includes(g));
      const matchesLate =
        !filters.late || Boolean(task.due && task.due < todayStr() && task.status < 2);

      return (
        matchesText &&
        matchesAt &&
        matchesHash &&
        matchesBang &&
        matchesAssigneePill &&
        matchesPriorityPill &&
        matchesTagPill &&
        matchesLate
      );
    });
  }, [currentProject.tasks, filters]);

  const calendarTasks = useMemo(
    () =>
      currentProject.tasks
        .filter((t) => t.due)
        .sort((a, b) => (a.due > b.due ? 1 : -1)),
    [currentProject.tasks]
  );

  return (
    <div>
      {/* Barra superior */}
      <header id="top">
        <span className="logo">Nodo</span>

        <select
          aria-label="Seleccionar proyecto"
          value={currentProjectIdx}
          onChange={(e) => setCurrentProjectIdx(Number(e.target.value))}
        >
          {projects.map((p, idx) => (
            <option key={p.id} value={idx}>
              {p.name}
            </option>
          ))}
        </select>

        <button onClick={handleNewProject}>+ Proyecto</button>

        <nav className="nav">
          <button className={view === 'board' ? 'on' : ''} onClick={() => setView('board')}>
            Tablero
          </button>
          <button className={view === 'dash' ? 'on' : ''} onClick={() => setView('dash')}>
            Dashboard
          </button>
          <button className={view === 'cal' ? 'on' : ''} onClick={() => setView('cal')}>
            Calendario
          </button>
        </nav>

        <span className="sp" />

        <button onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>
          {theme === 'dark' ? '☀️ Claro' : '🌙 Oscuro'}
        </button>

        <button className="p" onClick={() => setModalTask({ status: 0, priority: 1 })}>
          + Nueva tarea
        </button>
      </header>

      {/* Barra de filtros en vista Tablero */}
      {view === 'board' && (
        <section id="bar">
          <div className="hero">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                ref={searchInputRef}
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                placeholder="Búsqueda inteligente: texto, @persona, #etiqueta, !prioridad (atajo: /)"
              />
            </div>

            <div className="filter-row">
              {[2, 1, 0].map((idx) => (
                <button
                  key={idx}
                  className={`pill ${filters.priorities.includes(idx) ? 'on' : ''}`}
                  onClick={() => toggleFilter('priorities', idx)}
                >
                  {['🟢', '🟡', '🔴'][idx]} {PRIORITIES[idx]}
                </button>
              ))}

              <button
                className={`pill ${filters.late ? 'on' : ''}`}
                onClick={() => setFilters((f) => ({ ...f, late: !f.late }))}
              >
                ⏰ Vencidas
              </button>

              <span className="divider" />

              {TEAM.map((member) => {
                const active = filters.assignees.includes(member);
                return (
                  <button
                    key={member}
                    className={`avatar-btn ${active ? 'active' : ''}`}
                    title={member}
                    onClick={() => toggleFilter('assignees', member)}
                  >
                    <span
                      className="av"
                      style={{
                        background: `hsl(${getHue(member)} 70% 50%)`,
                        width: 28,
                        height: 28,
                      }}
                    >
                      {member[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="filter-row">
              {allTags.map((tag) => {
                const h = getHue(tag);
                const active = filters.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    className={`tag-btn ${active ? 'active' : ''}`}
                    onClick={() => toggleFilter('tags', tag)}
                  >
                    <span
                      className="tg"
                      style={{
                        background: `hsl(${h} 80% 50% / 0.16)`,
                        color: `hsl(${h} 70% 50%)`,
                      }}
                    >
                      {tag}
                    </span>
                  </button>
                );
              })}
              <span className="sp" />
              <span className="meta">
                {filteredTasks.length} / {currentProject.tasks.length} tareas
              </span>
              <button onClick={clearFilters}>Limpiar</button>
            </div>
          </div>
        </section>
      )}

      {/* Contenido principal */}
      <main id="main">
        {view === 'board' && (
          <>
            {filteredTasks.length === 0 && (
              <div className="box" style={{ textAlign: 'center' }}>
                Ninguna tarea coincide con los filtros actuales.
              </div>
            )}

            <div className="cols">
              {STATUSES.map((col) => {
                const colTasks = filteredTasks.filter((t) => t.status === col.id);
                return (
                  <section
                    key={col.id}
                    className={`col ${dragOverCol === col.id ? 'ov' : ''}`}
                    data-testid={`column-${col.key}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverCol(col.id);
                    }}
                    onDragLeave={() => setDragOverCol(null)}
                    onDrop={(e) => handleDrop(e, col.id)}
                  >
                    <h3>
                      {col.label} <span>{colTasks.length}</span>
                    </h3>
                    {colTasks.length === 0 ? (
                      <div className="meta">Arrastra tareas aquí.</div>
                    ) : (
                      colTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={setModalTask}
                          onStatusChange={handleStatusChange}
                          onDragStart={handleDragStart}
                        />
                      ))
                    )}
                  </section>
                );
              })}
            </div>
          </>
        )}

        {view === 'dash' && (
          <DashboardView tasks={currentProject.tasks} activityLog={activityLog} />
        )}

        {view === 'cal' && (
          <div className="box">
            <h3 style={{ marginTop: 0 }}>Próximos vencimientos</h3>
            {calendarTasks.length === 0 ? (
              <p className="meta">Sin tareas con fecha límite.</p>
            ) : (
              calendarTasks.map((task) => (
                <div key={task.id} className="cm">
                  <b>{task.due}</b> · {task.title}{' '}
                  <span className="meta">
                    ({task.assignee || 'sin responsable'} · {STATUSES[task.status].label})
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Modal de creación / edición */}
      {modalTask && (
        <TaskModal
          task={modalTask}
          onClose={() => setModalTask(null)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}

      {/* Toast */}
      {toastMsg && (
        <div id="toast">
          <div>{toastMsg}</div>
        </div>
      )}
    </div>
  );
}