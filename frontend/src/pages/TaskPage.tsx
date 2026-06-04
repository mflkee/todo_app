import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Task, Category } from '../types';

export const TaskPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadTask();
    loadCategories();
  }, [id]);

  const loadTask = async () => {
    try {
      const data = await api.getTask(id!);
      setTask(data);
    } catch {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch {
      // handle error
    }
  };

  const handlePredict = async () => {
    if (!id) return;
    try {
      const result = await api.predictTask(id);
      setPrediction(result.predicted_duration_minutes);
    } catch {
      // handle error
    }
  };

  const handleComplete = async () => {
    if (!id) return;
    const duration = prompt('Сколько минут заняло выполнение?', '30');
    if (duration === null) return;
    try {
      await api.completeTask(id, { actual_duration: parseInt(duration) || 30 });
      loadTask();
    } catch {
      // handle error
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Удалить задачу?')) return;
    try {
      await api.deleteTask(id);
      navigate('/dashboard');
    } catch {
      // handle error
    }
  };

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return 'Без категории';
    return categories.find((c) => c.id === categoryId)?.name || 'Неизвестно';
  };

  const getPriorityLabel = (priority: number) => {
    const labels = ['', 'Низкий', 'Ниже среднего', 'Средний', 'Высокий', 'Критический'];
    return labels[priority] || priority;
  };

  const getPriorityClass = (priority: number) => {
    if (priority <= 2) return 'priority-low';
    if (priority <= 3) return 'priority-medium';
    return 'priority-high';
  };

  if (loading) {
    return (
      <div className="task-page">
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="task-page">
        <div className="empty-state">Задача не найдена</div>
      </div>
    );
  }

  return (
    <div className="task-page">
      <div className="task-detail-card">
        <div className="task-detail-header">
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
            ← Назад
          </button>
          <div className="task-actions">
            {task.status === 'pending' && (
              <button className="btn btn-success" onClick={handleComplete}>
                ✓ Выполнить
              </button>
            )}
            <button className="btn btn-danger" onClick={handleDelete}>
              Удалить
            </button>
          </div>
        </div>

        <div className="task-detail-content">
          <div className={`task-status-badge status-${task.status}`}>
            {task.status === 'pending' ? 'В ожидании' : 'Выполнено'}
          </div>

          <h1 className="task-detail-title">{task.title}</h1>

          {task.description && (
            <p className="task-detail-description">{task.description}</p>
          )}

          <div className="task-meta-grid">
            <div className="task-meta-item">
              <label>Категория</label>
              <span>{getCategoryName(task.category_id)}</span>
            </div>
            <div className="task-meta-item">
              <label>Приоритет</label>
              <span className={getPriorityClass(task.priority)}>
                {getPriorityLabel(task.priority)}
              </span>
            </div>
            <div className="task-meta-item">
              <label>Создано</label>
              <span>{new Date(task.created_at).toLocaleDateString('ru-RU')}</span>
            </div>
            {task.due_date && (
              <div className="task-meta-item">
                <label>Срок</label>
                <span>{new Date(task.due_date).toLocaleDateString('ru-RU')}</span>
              </div>
            )}
            {task.actual_duration && (
              <div className="task-meta-item">
                <label>Фактическое время</label>
                <span>{task.actual_duration} мин</span>
              </div>
            )}
          </div>

          {task.status === 'pending' && (
            <div className="prediction-section">
              <h3>ИИ-Прогноз</h3>
              {prediction !== null ? (
                <div className="prediction-result">
                  <div className="prediction-value">{prediction} мин</div>
                  <p>Предсказанное время выполнения на основе истории</p>
                </div>
              ) : (
                <button className="btn btn-secondary" onClick={handlePredict}>
                  Получить прогноз времени
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
