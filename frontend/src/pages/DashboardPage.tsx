import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Task, TaskFilter, Category, TaskStatus } from '../types';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { CategoryManager } from '../components/CategoryManager';

export const DashboardPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<TaskFilter>({ page: 1, page_size: 10, sort_by: 'created_at' });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getTasks(filter);
      setTasks(data);
      setStats({
        total: data.length,
        pending: data.filter((t) => t.status === 'pending').length,
        completed: data.filter((t) => t.status === 'completed').length,
      });
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch {
      // handle error
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreateTask = async (data: any) => {
    setError('');
    try {
      await api.createTask(data);
      setShowForm(false);
      loadTasks();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка создания задачи');
    }
  };

  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;
    setError('');
    try {
      await api.updateTask(editingTask.id, data);
      setEditingTask(null);
      setShowForm(false);
      loadTasks();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка обновления задачи');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Удалить задачу?')) return;
    try {
      await api.deleteTask(id);
      loadTasks();
    } catch {
      // handle error
    }
  };

  const handleCompleteTask = async (id: string) => {
    const duration = prompt('Сколько минут заняло выполнение?', '30');
    if (duration === null) return;
    try {
      await api.completeTask(id, { actual_duration: parseInt(duration) || 30 });
      loadTasks();
    } catch {
      // handle error
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCreateCategory = async (name: string) => {
    try {
      await api.createCategory(name);
      loadCategories();
    } catch {
      // handle error
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await api.deleteCategory(id);
      loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка удаления категории');
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Дашборд</h1>
          <p>Управляйте своими задачами</p>
        </div>
        <div className="dashboard-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setShowCategories(!showCategories)}
          >
            Категории
          </button>
          <button
            className="btn btn-primary"
            onClick={() => { setEditingTask(null); setShowForm(true); }}
          >
            + Новая задача
          </button>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Всего задач</div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">В ожидании</div>
        </div>
        <div className="stat-card stat-completed">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Выполнено</div>
        </div>
      </div>

      {showCategories && (
        <CategoryManager
          categories={categories}
          onCreate={handleCreateCategory}
          onDelete={handleDeleteCategory}
          onClose={() => setShowCategories(false)}
        />
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {error && <div className="auth-error">{error}</div>}
            <TaskForm
              task={editingTask}
              categories={categories}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={() => { setShowForm(false); setEditingTask(null); }}
            />
          </div>
        </div>
      )}

      <div className="filter-bar">
        <select
          value={filter.status || ''}
          onChange={(e) => setFilter({ ...filter, status: (e.target.value as TaskStatus) || undefined, page: 1 })}
        >
          <option value="">Все статусы</option>
          <option value="pending">В ожидании</option>
          <option value="completed">Выполнено</option>
        </select>

        <select
          value={filter.category_id || ''}
          onChange={(e) => setFilter({ ...filter, category_id: e.target.value ? parseInt(e.target.value) : undefined, page: 1 })}
        >
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={filter.priority || ''}
          onChange={(e) => setFilter({ ...filter, priority: e.target.value ? parseInt(e.target.value) : undefined, page: 1 })}
        >
          <option value="">Все приоритеты</option>
          {[1, 2, 3, 4, 5].map((p) => (
            <option key={p} value={p}>Приоритет {p}</option>
          ))}
        </select>

        <select
          value={filter.sort_by}
          onChange={(e) => setFilter({ ...filter, sort_by: e.target.value })}
        >
          <option value="created_at">По дате создания</option>
          <option value="priority">По приоритету</option>
          <option value="due_date">По сроку</option>
        </select>
      </div>

      <TaskList
        tasks={tasks}
        loading={loading}
        categories={categories}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onComplete={handleCompleteTask}
        onView={(id) => navigate(`/tasks/${id}`)}
      />
    </div>
  );
};
