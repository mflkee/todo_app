import React from 'react';
import { Link } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const features = [
    {
      title: 'Управление задачами',
      description: 'Создавайте, редактируйте и организуйте задачи с удобным интерфейсом. Никаких сложностей — только продуктивность.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      ),
    },
    {
      title: 'ИИ-Прогнозирование',
      description: 'Наша модель машинного обучения анализирует ваши задачи и предсказывает время выполнения на основе истории.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
    },
    {
      title: 'Категории и фильтры',
      description: 'Группируйте задачи по категориям, фильтруйте по статусу и приоритету. Всегда найдете то, что нужно.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
        </svg>
      ),
    },
    {
      title: 'Приватность',
      description: 'Ваши данные хранятся локально в вашей инфраструктуре. Полный контроль и безопасность.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
  ];

  const steps = [
    { num: '01', title: 'Регистрация', desc: 'Создайте аккаунт за 30 секунд' },
    { num: '02', title: 'Создавайте задачи', desc: 'Добавляйте задачи с описанием и приоритетом' },
    { num: '03', title: 'Получайте прогнозы', desc: 'ИИ предскажет время выполнения каждой задачи' },
  ];

  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            AI-Powered Task Manager
          </div>
          <h1 className="hero-title">
            TaskFlow — умный помощник
            <br />
            <span className="gradient-text">для ваших задач</span>
          </h1>
          <p className="hero-subtitle">
            Создавайте задачи, управляйте временем и получайте прогнозы выполнения
            <br />
            на основе искусственного интеллекта.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Начать бесплатно
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Уже есть аккаунт
            </Link>
          </div>
        </div>
      </section>

      <section className="section features-section">
        <div className="section-header">
          <div className="section-badge">Возможности</div>
          <h2 className="section-title">Всё, что нужно для продуктивности</h2>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section steps-section">
        <div className="section-header">
          <div className="section-badge">Как это работает</div>
          <h2 className="section-title">Начните за 3 шага</h2>
        </div>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div key={i} className="step-card">
              <div className="step-num">{s.num}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section cta-section">
        <div className="cta-card">
          <h2 className="cta-title">Готовы повысить свою продуктивность?</h2>
          <p className="cta-desc">Присоединяйтесь к TaskFlow и начните управлять задачами по-новому.</p>
          <Link to="/register" className="btn btn-primary btn-large">
            Создать аккаунт
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <p>© 2026 TaskFlow. Итоговое задание по дисциплине «Разработка прототипов программных решений».</p>
        </div>
      </footer>
    </div>
  );
};
