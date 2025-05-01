const API_URL = '/api';

interface LoginCredentials {
  username: string;
  password: string;
}

interface Department {
  id: number;
  name: string;
  subDepartments?: SubDepartment[];
}

interface SubDepartment {
  id: number;
  name: string;
  department?: Department;
}

interface ApiError {
  message: string;
  statusCode: number;
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
  // Auth endpoints
  login: async (credentials: LoginCredentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  // Department endpoints
  getDepartments: async (page: number = 1, limit: number = 10) => {
    const response = await fetch(
      `${API_URL}/departments?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return handleResponse<Department[]>(response);
  },

  createDepartment: async (department: { name: string; subDepartments?: { name: string }[] }) => {
    const response = await fetch(`${API_URL}/departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(department),
    });
    return handleResponse<Department>(response);
  },

  updateDepartment: async (id: number, department: Partial<Department>) => {
    const response = await fetch(`${API_URL}/departments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        ...department,
        id // Include the ID to ensure proper reference
      }),
    });
    return handleResponse<Department>(response);
  },

  addSubDepartment: async (departmentId: number, subDepartment: { name: string }) => {
    const response = await fetch(`${API_URL}/departments/${departmentId}/subdepartments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(subDepartment),
    });
    return handleResponse<Department>(response);
  },

  deleteSubDepartment: async (departmentId: number, subDepartmentId: number) => {
    const response = await fetch(
      `${API_URL}/departments/${departmentId}/subdepartments/${subDepartmentId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return handleResponse<void>(response);
  },

  deleteDepartment: async (id: number) => {
    const response = await fetch(`${API_URL}/departments/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return handleResponse<void>(response);
  },

  getDepartmentHierarchy: async (id: number) => {
    const response = await fetch(`${API_URL}/departments/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return handleResponse<Department>(response);
  },
};