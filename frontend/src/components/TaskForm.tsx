import React, { useState, useEffect } from 'react';
import type { Task, Category } from '../types';

interface TaskFormProps {
  task: Task | null;
  categories: Category[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, categories, onSubmit, onCancel }) => {
  const [data, setData] = useState({
    title: '',
    description: '',
    category_id: '',
    priority: 1,
    due_date: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setData({
        title: task.title,
        description: task.description || '',
        category_id: task.category_id ? String(task.category_id) : '',
        priority: task.priority,
        due_date: task.due_date ? task.due_date.slice(0, 16) : '',
      });
    }
  }, [task]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.title.trim()) newErrors.title = 'Название обязательно';
    if (data.priority < 1 || data.priority > 5) newErrors.priority = 'Приоритет от 1 до 5';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: data.title.trim(),
      description: data.description.trim() || undefined,
      category_id: data.category_id ? parseInt(data.category_id) : undefined,
      priority: Number(data.priority),
      due_date: data.due_date ? new Date(data.due_date).toISOString() : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <h3>{task ? 'Редактировать задачу' : 'Новая задача'}</h3>

      <div className="form-group">
        <label htmlFor="title">Название *</label>
        <input
          id="title"
          type="text"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          placeholder="Что нужно сделать?"
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Описание</label>
        <textarea
          id="description"
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          placeholder="Детали задачи..."
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Категория</label>
          <select
            id="category"
            value={data.category_id}
            onChange={(e) => setData({ ...data, category_id: e.target.value })}
          >
            <option value="">Без категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">Приоритет *</label>
          <input
            id="priority"
            type="number"
            value={data.priority}
            onChange={(e) => setData({ ...data, priority: parseInt(e.target.value) || 1 })}
          />
          {errors.priority && <span className="form-error">{errors.priority}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="due_date">Срок выполнения</label>
        <input
          id="due_date"
          type="datetime-local"
          value={data.due_date}
          onChange={(e) => setData({ ...data, due_date: e.target.value })}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Отмена
        </button>
        <button type="submit" className="btn btn-primary">
          {task ? 'Сохранить' : 'Создать'}
        </button>
      </div>
    </form>
  );
};
