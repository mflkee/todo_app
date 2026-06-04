import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type { Token, AuthCredentials, RegisterData, Task, TaskCreate, TaskUpdate, TaskComplete, Category, TaskFilter, ChangePassword, User } from './types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && originalRequest) {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const response = await this.client.post<Token>('/v1/auth/refresh', { refresh_token: refreshToken });
              const { access_token, refresh_token } = response.data;
              localStorage.setItem('access_token', access_token);
              localStorage.setItem('refresh_token', refresh_token);
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              return this.client(originalRequest);
            } catch {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: AuthCredentials): Promise<Token> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    const response = await this.client.post<Token>('/v1/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  }

  async register(data: RegisterData): Promise<User> {
    const response = await this.client.post<User>('/v1/auth/register', data);
    return response.data;
  }

  async changePassword(data: ChangePassword): Promise<void> {
    await this.client.post('/v1/auth/change-password', data);
  }

  async getTasks(filter: TaskFilter): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filter.status) params.append('status', filter.status);
    if (filter.category_id) params.append('category_id', String(filter.category_id));
    if (filter.priority) params.append('priority', String(filter.priority));
    if (filter.sort_by) params.append('sort_by', filter.sort_by);
    params.append('page', String(filter.page));
    params.append('page_size', String(filter.page_size));
    const response = await this.client.get<Task[]>(`/v1/tasks/?${params.toString()}`);
    return response.data;
  }

  async getTask(id: string): Promise<Task> {
    const response = await this.client.get<Task>(`/v1/tasks/${id}`);
    return response.data;
  }

  async createTask(data: TaskCreate): Promise<Task> {
    const response = await this.client.post<Task>('/v1/tasks/', data);
    return response.data;
  }

  async updateTask(id: string, data: TaskUpdate): Promise<Task> {
    const response = await this.client.put<Task>(`/v1/tasks/${id}`, data);
    return response.data;
  }

  async deleteTask(id: string): Promise<void> {
    await this.client.delete(`/v1/tasks/${id}`);
  }

  async completeTask(id: string, data: TaskComplete): Promise<Task> {
    const response = await this.client.patch<Task>(`/v1/tasks/${id}/complete`, data);
    return response.data;
  }

  async predictTask(id: string): Promise<{ predicted_duration_minutes: number }> {
    const response = await this.client.get(`/v1/tasks/predict/${id}`);
    return response.data;
  }

  async getCategories(): Promise<Category[]> {
    const response = await this.client.get<Category[]>('/v1/tasks/categories');
    return response.data;
  }

  async createCategory(name: string): Promise<Category> {
    const response = await this.client.post<Category>('/v1/tasks/categories', { name });
    return response.data;
  }

  async deleteCategory(id: number): Promise<void> {
    await this.client.delete(`/v1/tasks/categories/${id}`);
  }

  async healthCheck(): Promise<{ status: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const api = new ApiClient();
