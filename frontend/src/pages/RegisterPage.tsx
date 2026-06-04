import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({
    first_name: '',
    last_name: '',
    login: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (data.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (data.password !== data.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    try {
      await register({
        first_name: data.first_name,
        last_name: data.last_name,
        login: data.login,
        password: data.password,
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Создать аккаунт</h1>
            <p>Начните управлять задачами умно</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">Имя</label>
                <input
                  id="first_name"
                  type="text"
                  value={data.first_name}
                  onChange={(e) => setData({ ...data, first_name: e.target.value })}
                  required
                  placeholder="Имя"
                />
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Фамилия</label>
                <input
                  id="last_name"
                  type="text"
                  value={data.last_name}
                  onChange={(e) => setData({ ...data, last_name: e.target.value })}
                  required
                  placeholder="Фамилия"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login">Логин</label>
              <input
                id="login"
                type="text"
                value={data.login}
                onChange={(e) => setData({ ...data, login: e.target.value })}
                required
                placeholder="Придумайте логин"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                id="password"
                type="password"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                required
                placeholder="Минимум 6 символов"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Подтвердите пароль</label>
              <input
                id="confirmPassword"
                type="password"
                value={data.confirmPassword}
                onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                required
                placeholder="Повторите пароль"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Создание...' : 'Создать аккаунт'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
