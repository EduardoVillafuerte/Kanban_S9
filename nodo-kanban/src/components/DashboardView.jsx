import React from 'react';
import { PRIORITIES, STATUSES, TEAM, todayStr } from '../data/seed';

export default function DashboardView({ tasks, activityLog }) {
  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.status === 2).length;
  const inProgressCount = tasks.filter((t) => t.status === 1).length;
  const lateTasks = tasks.filter((t) => t.due && t.due < todayStr() && t.status < 2);
  const percent = total ? Math.round((doneCount / total) * 100) : 0;

  const renderBars = (items) =>
    items.map(([label, count]) => (
      <div className="br" key={label}>
        <span style={{ width: 90 }}>{label}</span>
        <i style={{ width: `${total ? (count / total) * 100 : 0}%` }} />
        <span>{count}</span>
      </div>
    ));

  return (
    <div>
      <div className="box">
        <h3 style={{ marginTop: 0 }}>Resumen del proyecto</h3>
        <p style={{ marginBottom: 0 }}>
          Hay {total} tareas y {doneCount} están en estado Completado.{' '}
          {lateTasks.length > 0
            ? `Atención: ${lateTasks.length} vencida(s).`
            : 'No hay tareas vencidas.'}
        </p>
      </div>

      <div className="grid">
        <div className="box">
          <div className="big">{percent}%</div>
          completado ({doneCount}/{total})
        </div>
        <div className="box">
          <div className="big" style={{ color: 'var(--hi)' }}>
            {lateTasks.length}
          </div>
          tareas vencidas
        </div>
        <div className="box">
          <div className="big">{inProgressCount}</div>
          en progreso
        </div>
      </div>

      <div className="grid">
        <div className="box">
          <h3 style={{ marginTop: 0 }}>Por estado</h3>
          {renderBars(
            STATUSES.map((s) => [s.label, tasks.filter((t) => t.status === s.id).length])
          )}
        </div>
        <div className="box">
          <h3 style={{ marginTop: 0 }}>Por responsable</h3>
          {renderBars(
            TEAM.map((m) => [m, tasks.filter((t) => t.assignee === m).length])
          )}
        </div>
        <div className="box">
          <h3 style={{ marginTop: 0 }}>Por prioridad</h3>
          {renderBars(
            PRIORITIES.map((p, i) => [p, tasks.filter((t) => t.priority === i).length])
          )}
        </div>
      </div>

      <div className="box">
        <h3 style={{ marginTop: 0 }}>Actividad reciente</h3>
        {activityLog.length === 0 ? (
          <span className="meta">Aún no hay actividad registrada.</span>
        ) : (
          activityLog.map((entry, idx) => (
            <div key={idx} className="cm">
              {entry}
            </div>
          ))
        )}
      </div>
    </div>
  );
}