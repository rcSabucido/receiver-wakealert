const API_BASE_URL = import.meta.env.VITE_API_URL;

export type ReceiverUser = {
  receiver_user_id: number;
  username: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: ReceiverUser;
};

export type AlertItem = {
  id: number;
  firstName: string;
  lastName: string;
  latitude: string;
  longitude: string;
  location: string;
  alertTime: string;
  isCompleted: boolean;
};

class AlertAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    return data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
  }

  async getAlerts(): Promise<AlertItem[]> {
    const response = await fetch(`${this.baseUrl}/alerts`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
  }

  async getAlert(id: number): Promise<AlertItem> {
    const response = await fetch(`${this.baseUrl}/alert/${id}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch alert');
    return response.json();
  }

  async updateAlert(id: number, data: Partial<AlertItem>): Promise<AlertItem> {
    const response = await fetch(`${this.baseUrl}/alert/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update alert');
    return response.json();
  }
}

export const alertAPI = new AlertAPI(API_BASE_URL);