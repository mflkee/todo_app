import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../../src/pages/LandingPage';

describe('LandingPage', () => {
  it('should render hero section with title', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/TaskFlow — умный помощник/i)).toBeInTheDocument();
    expect(screen.getByText(/для ваших задач/i)).toBeInTheDocument();
  });

  it('should render features section', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Управление задачами/i)).toBeInTheDocument();
    expect(screen.getByText(/ИИ-Прогнозирование/i)).toBeInTheDocument();
    expect(screen.getByText(/Категории и фильтры/i)).toBeInTheDocument();
    expect(screen.getByText(/Приватность/i)).toBeInTheDocument();
  });

  it('should have links to auth pages', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /начать бесплатно/i })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /уже есть аккаунт/i })).toHaveAttribute('href', '/login');
  });

  it('should render steps section', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Регистрация/i)).toBeInTheDocument();
    const stepTitles = screen.getAllByText(/Создавайте задачи/i);
    expect(stepTitles.length).toBeGreaterThanOrEqual(1);
    const predictionTitles = screen.getAllByText(/Получайте прогнозы/i);
    expect(predictionTitles.length).toBeGreaterThanOrEqual(1);
  });
});
