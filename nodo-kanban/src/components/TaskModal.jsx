import React, { useState } from 'react';
import { PRIORITIES, STATUSES, TEAM } from '../data/seed';

export default function TaskModal({ task, onClose, onSave, onDelete }) {
  const isEditing = Boolean(task?.id);

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [assignee, setAssignee] = useState(task?.assignee || '');
  const [priority, setPriority] = useState(task?.priority ?? 1);
  const [status, setStatus] = useState(task?.status ?? 0);
  const [due, setDue] = useState(task?.due || '');
  const [tagsText, setTagsText] = useState((task?.tags || []).join(', '));
  const [comments, setComments] = useState(task?.comments || []);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('El título es obligatorio.');
      return;
    }

    const parsedTags = tagsText
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    onSave({
      id: task?.id,
      title: cleanTitle,
      description: description.trim(),
      assignee,
      priority: Number(priority),
      status: Number(status),
      due,
      tags: [...new Set(parsedTags)],
      comments,
    });
  };

  const handleAddComment = () => {
    const clean = newComment.trim();
    if (!clean) return;
    setComments((prev) => [
      ...prev,
      { id: `c-${Date.now()}`, user: 'Juan', text: clean, at: Date.now() },
    ]);
    setNewComment('');
  };

  const handleDeleteComment = (commentId) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return (
    <div className="ov2" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="md" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: 0 }}>
          {isEditing ? `Editar tarea #${task.id}` : 'Nueva tarea'}
        </h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="task-title">Título</label>
          <input
            id="task-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            placeholder="Ej. Implementar pruebas unitarias"
            autoFocus
          />
          {error && <p className="late" style={{ margin: '4px 0 0' }}>{error}</p>}

          <label htmlFor="task-desc">Descripción</label>
          <textarea
            id="task-desc"
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles adicionales..."
          />

          <div className="row">
            <div>
              <label htmlFor="task-assignee">Responsable</label>
              <select
                id="task-assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="">Sin asignar</option>
                {TEAM.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="task-priority">Prioridad</label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              >
                {PRIORITIES.map((p, idx) => (
                  <option key={p} value={idx}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <div>
              <label htmlFor="task-status">Estado</label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(Number(e.target.value))}
              >
                {STATUSES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="task-due">Fecha límite</label>
              <input
                id="task-due"
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </div>
          </div>

          <label htmlFor="task-tags">Etiquetas (separadas por coma)</label>
          <input
            id="task-tags"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="frontend, urgente, qa"
          />

          {isEditing && (
            <div style={{ marginTop: 12 }}>
              <h3 style={{ margin: '10px 0 4px', fontSize: 14 }}>Comentarios</h3>
              {comments.length === 0 ? (
                <p className="meta">Sin comentarios.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="cm">
                    <div className="meta">
                      <b>{c.user}</b>
                      <span className="sp" />
                      <button
                        type="button"
                        className="x"
                        style={{ padding: '1px 8px', fontSize: 12 }}
                        onClick={() => handleDeleteComment(c.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                    <div>{c.text}</div>
                  </div>
                ))
              )}

              <div className="row" style={{ marginTop: 8 }}>
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <button type="button" style={{ flex: 0 }} onClick={handleAddComment}>
                  Enviar
                </button>
              </div>
            </div>
          )}

          <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
            <button type="button" style={{ flex: 0 }} onClick={onClose}>
              Cerrar
            </button>
            {isEditing && (
              <button
                type="button"
                className="x"
                style={{ flex: 0 }}
                onClick={() => onDelete(task.id)}
              >
                Eliminar
              </button>
            )}
            <button type="submit" className="p" style={{ flex: 0 }}>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}