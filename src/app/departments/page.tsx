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
  const [page, setPage] = useState(1);
  const [newDepartment, setNewDepartment] = useState('');
  const [subDepartments, setSubDepartments] = useState<{ [key: number]: string }>({});
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const limit = 10;

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getDepartments(page, limit);
      setDepartments(data);
    } catch (error) {
      setError('Failed to fetch departments');
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

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
      setIsAdding(true);
      const newDeptData = await api.createDepartment({ name: newDepartment });
      setDepartments(prev => {
        const updated = [...prev];
        if (updated.length >= limit) {
          updated.pop();
        }
        return [newDeptData, ...updated];
      });
      setNewDepartment('');
      setError('');
    } catch (error) {
      setError('Failed to create department');
      console.error('Error creating department:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddSubDepartment = async (departmentId: number) => {
    try {
      setIsAdding(true);
      const newSubDeptName = subDepartments[departmentId];
      if (!newSubDeptName?.trim()) return;

      const updatedDept = await api.addSubDepartment(departmentId, {
        name: newSubDeptName
      });

      setDepartments(prev => 
        prev.map(dept => 
          dept.id === departmentId ? updatedDept : dept
        )
      );

      setSubDepartments(prev => ({ ...prev, [departmentId]: '' }));
      setError('');

      if (selectedDepartment?.id === departmentId) {
        setSelectedDepartment(updatedDept);
      }
    } catch (error) {
      setError('Failed to add sub-department');
      console.error('Error adding sub-department:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSubDepartment = async (departmentId: number, subDepartmentId: number) => {
    try {
      setIsAdding(true);
      await api.deleteSubDepartment(departmentId, subDepartmentId);

      setDepartments(prev => 
        prev.map(dept => {
          if (dept.id === departmentId) {
            return {
              ...dept,
              subDepartments: dept.subDepartments?.filter(sub => sub.id !== subDepartmentId)
            };
          }
          return dept;
        })
      );

      if (selectedDepartment?.id === departmentId) {
        const updatedDept = await api.getDepartmentHierarchy(departmentId);
        setSelectedDepartment(updatedDept);
      }

      setError('');
    } catch (error) {
      setError('Failed to delete sub-department');
      console.error('Error deleting sub-department:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    try {
      await api.deleteDepartment(id);
      setDepartments(prev => prev.filter(dept => dept.id !== id));
      setError('');
    } catch (error) {
      setError('Failed to delete department');
      console.error('Error deleting department:', error);
    }
  };

  const handleViewHierarchy = async (id: number) => {
    try {
      const hierarchy = await api.getDepartmentHierarchy(id);
      setSelectedDepartment(hierarchy);
      setError('');
    } catch (error) {
      setError('Failed to fetch department hierarchy');
      console.error('Error fetching hierarchy:', error);
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
              <form onSubmit={handleCreateDepartment} className="mb-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="Department name"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={isAdding}
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Departments List</h2>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <ul className="space-y-4">
                  {departments.map((dept) => (
                    <li key={dept.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">{dept.name}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewHierarchy(dept.id)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            View Hierarchy
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(dept.id)}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {dept.subDepartments && dept.subDepartments.length > 0 && (
                          <ul className="ml-4 space-y-1">
                            {dept.subDepartments.map(sub => (
                              <li key={sub.id} className="flex items-center justify-between text-sm text-gray-600 py-1">
                                <span>• {sub.name}</span>
                                <button
                                  onClick={() => handleDeleteSubDepartment(dept.id, sub.id)}
                                  className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                                >
                                  Remove
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        <div className="flex gap-2 mt-3">
                          <input
                            type="text"
                            value={subDepartments[dept.id] || ''}
                            onChange={(e) => setSubDepartments(prev => ({
                              ...prev,
                              [dept.id]: e.target.value
                            }))}
                            placeholder="New sub-department name"
                            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleAddSubDepartment(dept.id)}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            disabled={isAdding || !subDepartments[dept.id]?.trim()}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Previous
                </button>
                <span className="text-gray-600">Page {page}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={departments.length < limit}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {selectedDepartment && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Department Hierarchy</h2>
              <div className="border-l-2 border-blue-200 pl-4">
                <h3 className="font-medium text-gray-900">{selectedDepartment.name}</h3>
                {selectedDepartment.subDepartments && selectedDepartment.subDepartments.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {selectedDepartment.subDepartments.map(sub => (
                      <li key={sub.id} className="text-gray-600">
                        • {sub.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 mt-2">No sub-departments</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}