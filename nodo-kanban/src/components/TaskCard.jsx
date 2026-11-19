import React from 'react';
import { PRIORITIES, STATUSES, getHue, todayStr } from '../data/seed';

export default function TaskCard({ task, onEdit, onStatusChange, onDragStart }) {
  const isLate = Boolean(task.due && task.due < todayStr() && task.status < 2);

  return (
    <article
      className={`card p${task.priority}`}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={() => onEdit(task)}
      data-testid={`task-card-${task.id}`}
    >
      <div className="card-header">
        <b>{task.title}</b>
      </div>

      {task.tags.length > 0 && (
        <div className="tags-wrap">
          {task.tags.map((tag) => {
            const h = getHue(tag);
            return (
              <span
                key={tag}
                className="tg"
                style={{
                  background: `hsl(${h} 80% 50% / 0.16)`,
                  color: `hsl(${h} 70% 50%)`,
                }}
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}

      <div className="meta" style={{ marginTop: 8 }}>
        {task.assignee && (
          <span
            className="av"
            style={{ background: `hsl(${getHue(task.assignee)} 70% 50%)` }}
            title={task.assignee}
          >
            {task.assignee[0]}
          </span>
        )}
        <span>{PRIORITIES[task.priority]}</span>
        {task.due && <span className={isLate ? 'late' : ''}>{task.due}</span>}
        {task.comments.length > 0 && <span>💬 {task.comments.length}</span>}
      </div>

      <div
        className="card-status-row"
        onClick={(e) => e.stopPropagation()}
      >
        <label className="sr-only" htmlFor={`status-${task.id}`}>
          Cambiar estado de {task.title}
        </label>
        <select
          id={`status-${task.id}`}
          aria-label={`Estado de ${task.title}`}
          value={task.status}
          onChange={(e) => onStatusChange(task.id, Number(e.target.value))}
        >
          {STATUSES.map((st) => (
            <option key={st.id} value={st.id}>
              {st.label}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}