const API_URL = '/api';

interface Department {
  id: number;
  name: string;
  subDepartments?: SubDepartment[];
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface SubDepartment {
  id: number;
  name: string;
  department?: Department;
}

interface CreateDepartmentDto {
  name: string;
  subDepartments?: { name: string }[];
}

interface UpdateDepartmentDto {
  name?: string;
  subDepartments?: UpdateSubDepartmentDto[];
}

interface CreateSubDepartmentDto {
  name: string;
}

interface UpdateSubDepartmentDto {
  id?: number;
  name?: string;
}

interface ApiError {
  message: string;
  statusCode: number;
}

interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
  };
}


const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = 'An unexpected error occurred';
    try {
      const error: ApiError = await response.json();
      errorMessage = error.message || `HTTP error! status: ${response.status}`;
      console.error('API Error:', error);
    } catch {
      errorMessage = `HTTP error! status: ${response.status}`;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

export const api = {

  register: async (credentials: LoginCredentials) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
          `Login failed with status ${response.status}: ${response.statusText}`
        );
      }

      const data: AuthResponse = await response.json();

      // Store the token if authentication is successful
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Login failed due to an unexpected error'
      );
    }
  },
  // Department endpoints
  getDepartments: async (): Promise<Department[]> => {
    const response = await fetch(`${API_URL}/departments`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch departments');
    }
    return response.json();
  },

  getDepartmentById: async (id: number): Promise<Department> => {
    const response = await fetch(`${API_URL}/departments/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      if (response.status === 404) {
        throw new Error('Department not found');
      }
      throw new Error(error.message || 'Failed to fetch department');
    }
    return response.json();
  },

  createDepartment: async (data: CreateDepartmentDto): Promise<Department> => {
    const response = await fetch(`${API_URL}/departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create department');
    }
    return response.json();
  },

  updateDepartment: async (id: number, data: UpdateDepartmentDto): Promise<Department> => {
    const response = await fetch(`${API_URL}/departments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      if (response.status === 404) {
        throw new Error('Department not found');
      }
      throw new Error(error.message || 'Failed to update department');
    }
    return response.json();
  },

  deleteDepartment: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/departments/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      if (response.status === 404) {
        throw new Error('Department not found');
      }
      throw new Error(error.message || 'Failed to delete department');
    }
  },

  // Sub-department endpoints
  getSubDepartmentsByDepartment: async (departmentId: number): Promise<SubDepartment[]> => {
    const response = await fetch(`${API_URL}/departments/${departmentId}/sub-departments`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch sub-departments');
    }
    return response.json();
  },

  getSubDepartment: async (departmentId: number, subDepartmentId: number): Promise<SubDepartment> => {
    const response = await fetch(`${API_URL}/departments/${departmentId}/sub-departments/${subDepartmentId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      if (response.status === 404) {
        throw new Error('Sub-department not found');
      }
      throw new Error(error.message || 'Failed to fetch sub-department');
    }
    return response.json();
  },

  createSubDepartment: async (departmentId: number, data: CreateSubDepartmentDto): Promise<SubDepartment> => {
    const response = await fetch(`${API_URL}/departments/${departmentId}/sub-departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create sub-department');
    }
    return response.json();
  },

  updateSubDepartment: async (
    departmentId: number,
    subDepartmentId: number,
    data: UpdateSubDepartmentDto
  ): Promise<SubDepartment> => {
    const response = await fetch(`${API_URL}/departments/${departmentId}/sub-departments/${subDepartmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      if (response.status === 404) {
        throw new Error('Sub-department not found');
      }
      throw new Error(error.message || 'Failed to update sub-department');
    }
    return response.json();
  },

  deleteSubDepartment: async (departmentId: number, subDepartmentId: number): Promise<void> => {
    const response = await fetch(`${API_URL}/departments/${departmentId}/sub-departments/${subDepartmentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      if (response.status === 404) {
        throw new Error('Sub-department not found');
      }
      throw new Error(error.message || 'Failed to delete sub-department');
    }
  },
};