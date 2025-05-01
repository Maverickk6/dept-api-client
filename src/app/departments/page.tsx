'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';

interface SubDepartment {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  subDepartments?: SubDepartment[];
}

export default function Departments() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [newSubDepartment, setNewSubDepartment] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState({
    departments: false,
    operations: false,
  });

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, departments: true }));
      const data = await api.getDepartments();
      setDepartments(data);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch departments');
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(prev => ({ ...prev, departments: false }));
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchDepartments();
  }, [fetchDepartments, router]);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, operations: true }));
      const newDept = await api.createDepartment({ name: newDepartment });
      setDepartments(prev => [newDept, ...prev]);
      setNewDepartment('');
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create department');
      console.error('Error creating department:', error);
    } finally {
      setLoading(prev => ({ ...prev, operations: false }));
    }
  };

  const handleCreateSubDepartment = async (departmentId: number) => {
    try {
      setLoading(prev => ({ ...prev, operations: true }));
      const newSubDept = await api.createSubDepartment(departmentId, { name: newSubDepartment });
      
      setDepartments(prev =>
        prev.map(dept =>
          dept.id === departmentId
            ? {
                ...dept,
                subDepartments: [...(dept.subDepartments || []), newSubDept],
              }
            : dept
        )
      );

      if (selectedDepartment?.id === departmentId) {
        setSelectedDepartment(prev => ({
          ...prev!,
          subDepartments: [...(prev?.subDepartments || []), newSubDept],
        }));
      }

      setNewSubDepartment('');
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create sub-department');
      console.error('Error creating sub-department:', error);
    } finally {
      setLoading(prev => ({ ...prev, operations: false }));
    }
  };

  const handleUpdateDepartment = async (id: number, newName: string) => {
    try {
      setLoading(prev => ({ ...prev, operations: true }));
      const updatedDept = await api.updateDepartment(id, { name: newName });
      
      setDepartments(prev =>
        prev.map(dept => (dept.id === id ? updatedDept : dept))
      );

      if (selectedDepartment?.id === id) {
        setSelectedDepartment(updatedDept);
      }

      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update department');
      console.error('Error updating department:', error);
    } finally {
      setLoading(prev => ({ ...prev, operations: false }));
    }
  };

  const handleUpdateSubDepartment = async (
    departmentId: number,
    subDepartmentId: number,
    newName: string
  ) => {
    try {
      setLoading(prev => ({ ...prev, operations: true }));
      const updatedSubDept = await api.updateSubDepartment(departmentId, subDepartmentId, {
        name: newName,
      });

      setDepartments(prev =>
        prev.map(dept =>
          dept.id === departmentId
            ? {
                ...dept,
                subDepartments: dept.subDepartments?.map(sub =>
                  sub.id === subDepartmentId ? updatedSubDept : sub
                ),
              }
            : dept
        )
      );

      if (selectedDepartment?.id === departmentId) {
        setSelectedDepartment(prev => ({
          ...prev!,
          subDepartments: prev?.subDepartments?.map(sub =>
            sub.id === subDepartmentId ? updatedSubDept : sub
          ),
        }));
      }

      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update sub-department');
      console.error('Error updating sub-department:', error);
    } finally {
      setLoading(prev => ({ ...prev, operations: false }));
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    try {
      setLoading(prev => ({ ...prev, operations: true }));
      await api.deleteDepartment(id);
      setDepartments(prev => prev.filter(dept => dept.id !== id));
      
      if (selectedDepartment?.id === id) {
        setSelectedDepartment(null);
      }
      
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete department');
      console.error('Error deleting department:', error);
    } finally {
      setLoading(prev => ({ ...prev, operations: false }));
    }
  };

  const handleDeleteSubDepartment = async (departmentId: number, subDepartmentId: number) => {
    try {
      setLoading(prev => ({ ...prev, operations: true }));
      await api.deleteSubDepartment(departmentId, subDepartmentId);

      setDepartments(prev =>
        prev.map(dept =>
          dept.id === departmentId
            ? {
                ...dept,
                subDepartments: dept.subDepartments?.filter(
                  sub => sub.id !== subDepartmentId
                ),
              }
            : dept
        )
      );

      if (selectedDepartment?.id === departmentId) {
        setSelectedDepartment(prev => ({
          ...prev!,
          subDepartments: prev?.subDepartments?.filter(
            sub => sub.id !== subDepartmentId
          ),
        }));
      }

      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete sub-department');
      console.error('Error deleting sub-department:', error);
    } finally {
      setLoading(prev => ({ ...prev, operations: false }));
    }
  };

  const handleViewDetails = async (id: number) => {
    try {
      setLoading(prev => ({ ...prev, departments: true }));
      const department = await api.getDepartmentById(id);
      setSelectedDepartment(department);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch department details');
      console.error('Error fetching department details:', error);
    } finally {
      setLoading(prev => ({ ...prev, departments: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Departments Management</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Department</h2>
              <form onSubmit={handleCreateDepartment} className="flex gap-4">
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="Department name"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={2}
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={loading.operations || !newDepartment.trim()}
                >
                  {loading.operations ? 'Creating...' : 'Create'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Departments</h2>
              {loading.departments ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : departments.length === 0 ? (
                <p className="text-gray-500">No departments found</p>
              ) : (
                <div className="space-y-4">
                  {departments.map((department) => (
                    <div key={department.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-medium text-gray-900">{department.name}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(department.id)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(department.id)}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                            disabled={loading.operations}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className="pl-4 border-l-2 border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Sub-Departments</h4>
                        
                        {department.subDepartments && department.subDepartments.length > 0 ? (
                          <ul className="space-y-2 mb-3">
                            {department.subDepartments.map((subDept) => (
                              <li key={subDept.id} className="flex items-center justify-between">
                                <span className="text-gray-600">{subDept.name}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleDeleteSubDepartment(department.id, subDept.id)}
                                    className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
                                    disabled={loading.operations}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-sm mb-3">No sub-departments</p>
                        )}

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSubDepartment}
                            onChange={(e) => setNewSubDepartment(e.target.value)}
                            placeholder="New sub-department"
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            minLength={2}
                          />
                          <button
                            onClick={() => handleCreateSubDepartment(department.id)}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                            disabled={loading.operations || !newSubDepartment.trim()}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedDepartment ? `${selectedDepartment.name} Details` : 'Select a Department'}
            </h2>
            
            {selectedDepartment ? (
              <div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedDepartment.name}
                      onChange={(e) => {
                        setSelectedDepartment({
                          ...selectedDepartment,
                          name: e.target.value,
                        });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleUpdateDepartment(selectedDepartment.id, selectedDepartment.name)}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                      disabled={loading.operations}
                    >
                      Update
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Sub-Departments</h3>
                  
                  {selectedDepartment.subDepartments && selectedDepartment.subDepartments.length > 0 ? (
                    <ul className="space-y-3">
                      {selectedDepartment.subDepartments.map((subDept) => (
                        <li key={subDept.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <input
                            type="text"
                            value={subDept.name}
                            onChange={(e) => {
                              setSelectedDepartment({
                                ...selectedDepartment,
                                subDepartments: selectedDepartment.subDepartments?.map(sub =>
                                  sub.id === subDept.id ? { ...sub, name: e.target.value } : sub
                                ),
                              });
                            }}
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex gap-2 ml-3">
                            <button
                              onClick={() => handleUpdateSubDepartment(
                                selectedDepartment.id,
                                subDept.id,
                                subDept.name
                              )}
                              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                              disabled={loading.operations}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => handleDeleteSubDepartment(selectedDepartment.id, subDept.id)}
                              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                              disabled={loading.operations}
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No sub-departments</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Select a department to view details</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}