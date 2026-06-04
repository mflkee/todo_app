export interface User {
  id: string;
  first_name: string;
  last_name: string;
  login: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Category {
  id: number;
  name: string;
  user_id?: string;
}

export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category_id?: number;
  user_id: string;
  status: TaskStatus;
  priority: number;
  due_date?: string;
  actual_duration?: number;
  created_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  category_id?: number;
  priority: number;
  due_date?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  category_id?: number;
  priority?: number;
  due_date?: string;
}

export interface TaskComplete {
  actual_duration: number;
}

export interface TaskFilter {
  status?: TaskStatus;
  category_id?: number;
  priority?: number;
  sort_by?: string;
  page: number;
  page_size: number;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  login: string;
  password: string;
}

export interface ChangePassword {
  old_password: string;
  new_password: string;
}
