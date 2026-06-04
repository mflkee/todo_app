import React from 'react';
import type { Task, Category } from '../types';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  categories: Category[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onView: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading,
  categories,
  onEdit,
  onDelete,
  onComplete,
  onView,
}) => {
  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return null;
    return categories.find((c) => c.id === categoryId)?.name;
  };

  const getPriorityClass = (priority: number) => {
    if (priority <= 2) return 'priority-low';
    if (priority <= 3) return 'priority-medium';
    return 'priority-high';
  };

  const getPriorityLabel = (priority: number) => {
    const labels = ['', 'Низкий', 'Ниже среднего', 'Средний', 'Высокий', 'Критический'];
    return labels[priority] || priority;
  };

  if (loading) {
    return (
      <div className="task-list-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>Задач пока нет</p>
        <p className="empty-hint">Создайте первую задачу, чтобы начать</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`task-card ${task.status === 'completed' ? 'task-completed' : ''}`}
          onClick={() => onView(task.id)}
        >
          <div className="task-card-content">
            <div className="task-card-header">
              <div className="task-card-title">{task.title}</div>
              <div className="task-card-badges">
                <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                  {getPriorityLabel(task.priority)}
                </span>
                <span className={`status-badge status-${task.status}`}>
                  {task.status === 'pending' ? 'В ожидании' : 'Выполнено'}
                </span>
              </div>
            </div>

            {task.description && (
              <p className="task-card-desc">{task.description}</p>
            )}

            <div className="task-card-footer">
              <div className="task-card-meta">
                {getCategoryName(task.category_id) && (
                  <span className="task-category">{getCategoryName(task.category_id)}</span>
                )}
                <span className="task-date">
                  {new Date(task.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>

              <div className="task-card-actions" onClick={(e) => e.stopPropagation()}>
                {task.status === 'pending' && (
                  <button
                    className="btn-icon btn-success"
                    onClick={() => onComplete(task.id)}
                    title="Выполнить"
                  >
                    ✓
                  </button>
                )}
                <button
                  className="btn-icon"
                  onClick={() => onEdit(task)}
                  title="Редактировать"
                >
                  ✎
                </button>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => onDelete(task.id)}
                  title="Удалить"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
