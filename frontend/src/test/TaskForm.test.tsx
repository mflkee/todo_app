import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '../../src/components/TaskForm';
import type { Category } from '../../src/types';

describe('TaskForm', () => {
  const categories: Category[] = [
    { id: 1, name: 'Работа', user_id: '1' },
    { id: 2, name: 'Личное', user_id: '1' },
  ];

  it('should render empty form for new task', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TaskForm
        task={null}
        categories={categories}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('Новая задача')).toBeInTheDocument();
    expect(screen.getByLabelText(/название/i)).toHaveValue('');
    expect(screen.getByLabelText(/приоритет/i)).toHaveValue(1);
  });

  it('should show validation error for empty title', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TaskForm
        task={null}
        categories={categories}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /создать/i }));

    await waitFor(() => {
      expect(screen.getByText(/название обязательно/i)).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should show validation error for invalid priority', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TaskForm
        task={null}
        categories={categories}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    await userEvent.type(screen.getByLabelText(/название/i), 'Test Task');
    fireEvent.change(screen.getByLabelText(/приоритет/i), { target: { value: '10' } });
    await userEvent.click(screen.getByRole('button', { name: /создать/i }));

    await waitFor(() => {
      expect(screen.getByText(/приоритет от 1 до 5/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TaskForm
        task={null}
        categories={categories}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    await userEvent.type(screen.getByLabelText(/название/i), 'Купить продукты');
    await userEvent.type(screen.getByLabelText(/описание/i), 'Молоко, хлеб');
    await userEvent.selectOptions(screen.getByLabelText(/категория/i), '1');
    fireEvent.change(screen.getByLabelText(/приоритет/i), { target: { value: '2' } });
    await userEvent.click(screen.getByRole('button', { name: /создать/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Купить продукты',
          description: 'Молоко, хлеб',
          category_id: 1,
          priority: 2,
        })
      );
    });
  });

  it('should fill form with task data when editing', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    const task = {
      id: '1',
      title: 'Существующая задача',
      description: 'Описание',
      category_id: 2,
      user_id: '1',
      status: 'pending' as const,
      priority: 3,
      created_at: new Date().toISOString(),
    };

    render(
      <TaskForm
        task={task}
        categories={categories}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('Редактировать задачу')).toBeInTheDocument();
    expect(screen.getByLabelText(/название/i)).toHaveValue('Существующая задача');
    expect(screen.getByLabelText(/приоритет/i)).toHaveValue(3);
  });

  it('should call onCancel when cancel button clicked', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(
      <TaskForm
        task={null}
        categories={categories}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /отмена/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
