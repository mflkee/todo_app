import React, { useState } from 'react';
import type { Category } from '../types';

interface CategoryManagerProps {
  categories: Category[];
  onCreate: (name: string) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onCreate,
  onDelete,
  onClose,
}) => {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError('Название категории обязательно');
      return;
    }
    setError('');
    onCreate(newName.trim());
    setNewName('');
  };

  return (
    <div className="category-manager">
      <div className="category-manager-header">
        <h3>Категории</h3>
        <button className="btn-icon" onClick={onClose}>✕</button>
      </div>

      <form onSubmit={handleSubmit} className="category-form">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Новая категория"
        />
        <button type="submit" className="btn btn-primary">Добавить</button>
      </form>

      {error && <div className="form-error">{error}</div>}

      <div className="category-list">
        {categories.length === 0 ? (
          <p className="empty-hint">Категорий пока нет</p>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="category-item">
              <span className="category-dot" />
              <span>{cat.name}</span>
              <button
                className="btn-icon btn-icon-sm"
                onClick={() => onDelete(cat.id)}
                title="Удалить категорию"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
