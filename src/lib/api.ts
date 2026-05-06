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
  AlertID: number;
  Latitude: string;
  Longitude: string;
  AlertTime: string;
  VictimID: number;
  isCompleted: boolean;
  isDeleted: boolean;
};

export type VictimDetails = {
  victimId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: string;
  age: number;
  primaryContact: string;
  address: string;
  pregnancyStatus: string;
  organDonor: string;
  lastDiagnosis: string;
  diagnosisDate: string;
  placeOfDiagnosis: string;
  allergies: string;
  medication: string;
  medicalHistory: string;
  medicalNote: string;
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
    const data = await response.json();
    return (data as Array<Record<string, unknown>>).map((alert) => ({
      AlertID: alert.AlertID as number,
      Latitude: alert.Latitude as string,
      Longitude: alert.Longitude as string,
      AlertTime: alert.AlertTime as string,
      VictimID: alert.VictimID as number,
      isCompleted: (alert.isCompleted ?? alert.IsCompleted) as boolean,
      isDeleted: (alert.isDeleted ?? alert.IsDeleted) as boolean,
    }));
  }

  async getAlert(id: number): Promise<AlertItem> {
    const response = await fetch(`${this.baseUrl}/alerts/${id}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch alert');
    const alert = (await response.json()) as Record<string, unknown>;
    return {
      AlertID: alert.AlertID as number,
      Latitude: alert.Latitude as string,
      Longitude: alert.Longitude as string,
      AlertTime: alert.AlertTime as string,
      VictimID: alert.VictimID as number,
      isCompleted: (alert.isCompleted ?? alert.IsCompleted) as boolean,
      isDeleted: (alert.isDeleted ?? alert.IsDeleted) as boolean,
    };
  }

  async updateAlert(id: number, data: Partial<AlertItem>): Promise<AlertItem> {
    const response = await fetch(`${this.baseUrl}/alerts/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update alert');
    return response.json();
  }

  async deleteAlert(id: number): Promise<AlertItem> {
    const response = await fetch(`${this.baseUrl}/alerts/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete alert');
    return response.json();
  }

  async getVictims(): Promise<unknown[]> {
    const response = await fetch(`${this.baseUrl}/victims`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch victims');
    return response.json();
  }

  async getVictimDetails(id: number): Promise<VictimDetails> {
    const response = await fetch(`${this.baseUrl}/victims/${id}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch victim details');
    return response.json();
  }
}

export const alertAPI = new AlertAPI(API_BASE_URL);