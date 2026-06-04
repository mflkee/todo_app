import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from '../../src/pages/RegisterPage';
import { AuthProvider } from '../../src/context/AuthContext';
import { api } from '../../src/api';

vi.mock('../../src/api');

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render registration form', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/имя/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/фамилия/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/логин/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^пароль$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/подтвердите пароль/i)).toBeInTheDocument();
  });

  it('should show error when passwords do not match', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/имя/i), 'Иван');
    await userEvent.type(screen.getByLabelText(/фамилия/i), 'Иванов');
    await userEvent.type(screen.getByLabelText(/логин/i), 'ivanov');
    await userEvent.type(screen.getByLabelText(/^пароль$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/подтвердите пароль/i), 'different');
    await userEvent.click(screen.getByRole('button', { name: /создать аккаунт/i }));

    await waitFor(() => {
      expect(screen.getByText(/пароли не совпадают/i)).toBeInTheDocument();
    });
  });

  it('should show error when password is too short', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/имя/i), 'Иван');
    await userEvent.type(screen.getByLabelText(/фамилия/i), 'Иванов');
    await userEvent.type(screen.getByLabelText(/логин/i), 'ivanov');
    await userEvent.type(screen.getByLabelText(/^пароль$/i), '123');
    await userEvent.type(screen.getByLabelText(/подтвердите пароль/i), '123');
    await userEvent.click(screen.getByRole('button', { name: /создать аккаунт/i }));

    await waitFor(() => {
      expect(screen.getByText(/пароль должен содержать минимум 6 символов/i)).toBeInTheDocument();
    });
  });

  it('should call register with valid data', async () => {
    vi.mocked(api.register).mockResolvedValue({
      id: '1',
      first_name: 'Иван',
      last_name: 'Иванов',
      login: 'ivanov',
      created_at: new Date().toISOString(),
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/имя/i), 'Иван');
    await userEvent.type(screen.getByLabelText(/фамилия/i), 'Иванов');
    await userEvent.type(screen.getByLabelText(/логин/i), 'ivanov');
    await userEvent.type(screen.getByLabelText(/^пароль$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/подтвердите пароль/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /создать аккаунт/i }));

    await waitFor(() => {
      expect(api.register).toHaveBeenCalledWith({
        first_name: 'Иван',
        last_name: 'Иванов',
        login: 'ivanov',
        password: 'password123',
      });
    });
  });
});
