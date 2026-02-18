const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.token = null;
      localStorage.removeItem('hr-calibration-auth');
      window.location.href = '/login';
      throw new Error('Authentication expired');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  login(username: string, password: string) {
    return this.request<{ token: string; user: { id: number; username: string; role: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  register(username: string, password: string) {
    return this.request<{ token: string; user: { id: number; username: string; role: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  getMe() {
    return this.request<{ user: { id: number; username: string; role: string; created_at: string } }>('/auth/me');
  }

  // Employees
  getEmployees() {
    return this.request<{ employees: any[] }>('/employees');
  }

  bulkImportEmployees(employees: any[]) {
    return this.request<{ employees: any[] }>('/employees/bulk', {
      method: 'POST',
      body: JSON.stringify({ employees }),
    });
  }

  updateEmployee(id: string, updates: Record<string, any>) {
    return this.request<{ employee: any }>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  toggleFreezeEmployee(id: string) {
    return this.request<{ employee: any }>(`/employees/${id}/freeze`, {
      method: 'PATCH',
    });
  }

  deleteAllEmployees() {
    return this.request<{ message: string }>('/employees', {
      method: 'DELETE',
    });
  }

  // Settings
  getSettings() {
    return this.request<{ targetPercentages: any; deviationThreshold: number; theme: string }>('/settings');
  }

  updateSettings(settings: Record<string, any>) {
    return this.request<{ targetPercentages: any; deviationThreshold: number; theme: string }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Admin
  getUsers() {
    return this.request<{ users: any[] }>('/admin/users');
  }

  createUser(username: string, password: string, role: string) {
    return this.request<{ user: any }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    });
  }

  deleteUser(id: number) {
    return this.request<{ message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
