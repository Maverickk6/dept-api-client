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
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState({
    departments: false,
    operations: false,
  });
  const [editingStates, setEditingStates] = useState<{
    departments: Record<number, { isEditing: boolean; tempName: string }>;
    subDepartments: Record<number, { isEditing: boolean; tempName: string }>;
  }>({
    departments: {},
    subDepartments: {},
  });

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, departments: true }));
      const data = await api.getDepartments();
      setDepartments(data);
      setError('');
      
      // Initialize editing states
      const initialEditingStates = {
        departments: {},
        subDepartments: {},
      };
      data.forEach(dept => {
        initialEditingStates.departments[dept.id] = {
          isEditing: false,
          tempName: dept.name
        };
        dept.subDepartments?.forEach(subDept => {
          initialEditingStates.subDepartments[subDept.id] = {
            isEditing: false,
            tempName: subDept.name
          };
        });
      });
      setEditingStates(initialEditingStates);
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

  // Department CRUD operations
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, operations: true }));
      const newDept = await api.createDepartment({ name: newDepartment });
      
      setDepartments(prev => [newDept, ...prev]);
      setEditingStates(prev => ({
        ...prev,
        departments: {
          ...prev.departments,
          [newDept.id]: { isEditing: false, tempName: newDept.name }
        }
      }));
      setNewDepartment('');
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create department');
      console.error('Error creating department:', error);
    } finally {
      setLoading(prev => ({ ...prev, operations: false }));
    }
  };

  const toggleEditDepartment = (departmentId: number) => {
    setEditingStates(prev => ({
      ...prev,
      departments: {
        ...prev.departments,
        [departmentId]: {
          ...prev.departments[departmentId],
          isEditing: !prev.departments[departmentId]?.isEditing,
          tempName: departments.find(d => d.id === departmentId)?.name || ''
        }
      }
    }));
  };

  const handleUpdateDepartment = async (departmentId: number) => {
    try {
      setLoading(prev => ({ ...prev, operations: true }));
      const newName = editingStates.departments[departmentId].tempName;
      const updatedDept = await api.updateDepartment(departmentId, { name: newName });
      
      setDepartments(prev =>
        prev.map(dept => dept.id === departmentId ? updatedDept : dept)
      );
      
      setEditingStates(prev => ({
        ...prev,
        departments: {
          ...prev.departments,
          [departmentId]: { isEditing: false, tempName: newName }
        }
      }));

      if (selectedDepartment?.id === departmentId) {
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

  // Sub-Department CRUD operations
  const handleCreateSubDepartment = async (departmentId: number, name: string) => {
    try {
      setLoading(prev => ({ ...prev, operations: true }));
      const newSubDept = await api.createSubDepartment(departmentId, { name });
      
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

      setEditingStates(prev => ({
        ...prev,
        subDepartments: {
          ...prev.subDepartments,
          [newSubDept.id]: { isEditing: false, tempName: name }
        }
      }));

      if (selectedDepartment?.id === departmentId) {
        setSelectedDepartment(prev => ({
          ...prev!,
          subDepartments: [...(prev?.subDepartments || []), newSubDept],
        }));
      }

      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create sub-department');
      console.error('Error creating sub-department:', error);
    } finally {
      setLoading(prev => ({ ...prev, operations: false }));
    }
  };

  const toggleEditSubDepartment = (subDepartmentId: number) => {
    setEditingStates(prev => ({
      ...prev,
      subDepartments: {
        ...prev.subDepartments,
        [subDepartmentId]: {
          ...prev.subDepartments[subDepartmentId],
          isEditing: !prev.subDepartments[subDepartmentId]?.isEditing
        }
      }
    }));
  };

  const handleUpdateSubDepartment = async (
    departmentId: number,
    subDepartmentId: number
  ) => {
    try {
      setLoading(prev => ({ ...prev, operations: true }));
      const newName = editingStates.subDepartments[subDepartmentId].tempName;
      const updatedSubDept = await api.updateSubDepartment(
        departmentId,
        subDepartmentId,
        { name: newName }
      );

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

      setEditingStates(prev => ({
        ...prev,
        subDepartments: {
          ...prev.subDepartments,
          [subDepartmentId]: { isEditing: false, tempName: newName }
        }
      }));

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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 transition-all hover:shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Department</h2>
              <form onSubmit={handleCreateDepartment} className="flex gap-4">
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="Department name"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  required
                  minLength={2}
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                  disabled={loading.operations || !newDepartment.trim()}
                >
                  {loading.operations ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Creating...
                    </span>
                  ) : 'Create'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 transition-all">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Departments</h2>
              {loading.departments ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : departments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No departments found</p>
              ) : (
                <div className="space-y-4">
                  {departments.map((department) => {
                    const isEditing = editingStates.departments[department.id]?.isEditing || false;
                    const tempName = editingStates.departments[department.id]?.tempName || '';
                    
                    return (
                      <div 
                        key={department.id} 
                        className="border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md"
                      >
                        <div className="flex justify-between items-center mb-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={tempName}
                              onChange={(e) => setEditingStates(prev => ({
                                ...prev,
                                departments: {
                                  ...prev.departments,
                                  [department.id]: {
                                    ...prev.departments[department.id],
                                    tempName: e.target.value
                                  }
                                }
                              }))}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                            />
                          ) : (
                            <h3 className="text-lg font-medium text-gray-900">{department.name}</h3>
                          )}
                          <div className="flex gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleUpdateDepartment(department.id)}
                                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                                  disabled={loading.operations}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => toggleEditDepartment(department.id)}
                                  className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                                  disabled={loading.operations}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => toggleEditDepartment(department.id)}
                                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                                  disabled={loading.operations}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleViewDetails(department.id)}
                                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                                  disabled={loading.operations}
                                >
                                  View
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteDepartment(department.id)}
                              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                              disabled={loading.operations}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        
                        <div className="pl-4 border-l-2 border-gray-200 mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Sub-Departments</h4>
                          
                          {department.subDepartments && department.subDepartments.length > 0 ? (
                            <ul className="space-y-2 mb-3">
                              {department.subDepartments.map((subDept) => {
                                const isEditingSub = editingStates.subDepartments[subDept.id]?.isEditing || false;
                                const tempSubName = editingStates.subDepartments[subDept.id]?.tempName || '';
                                
                                return (
                                  <li key={subDept.id} className="flex items-center justify-between group">
                                    {isEditingSub ? (
                                      <input
                                        type="text"
                                        value={tempSubName}
                                        onChange={(e) => setEditingStates(prev => ({
                                          ...prev,
                                          subDepartments: {
                                            ...prev.subDepartments,
                                            [subDept.id]: {
                                              ...prev.subDepartments[subDept.id],
                                              tempName: e.target.value
                                            }
                                          }
                                        }))}
                                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                      />
                                    ) : (
                                      <span className="text-gray-600">{subDept.name}</span>
                                    )}
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {isEditingSub ? (
                                        <>
                                          <button
                                            onClick={() => handleUpdateSubDepartment(department.id, subDept.id)}
                                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50"
                                            disabled={loading.operations}
                                          >
                                            Save
                                          </button>
                                          <button
                                            onClick={() => toggleEditSubDepartment(subDept.id)}
                                            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50"
                                            disabled={loading.operations}
                                          >
                                            Cancel
                                          </button>
                                        </>
                                      ) : (
                                        <button
                                          onClick={() => toggleEditSubDepartment(subDept.id)}
                                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                                          disabled={loading.operations}
                                        >
                                          Edit
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleDeleteSubDepartment(department.id, subDept.id)}
                                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
                                        disabled={loading.operations}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="text-gray-500 text-sm mb-3">No sub-departments</p>
                          )}

                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              const name = formData.get('subDepartmentName') as string;
                              if (name.trim()) {
                                handleCreateSubDepartment(department.id, name);
                                e.currentTarget.reset();
                              }
                            }}
                            className="flex gap-2 mt-2"
                          >
                            <input
                              name="subDepartmentName"
                              type="text"
                              placeholder="New sub-department"
                              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              minLength={2}
                              required
                            />
                            <button
                              type="submit"
                              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                              disabled={loading.operations}
                            >
                              Add
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 transition-all sticky top-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {selectedDepartment ? `${selectedDepartment.name} Details` : 'Select a Department'}
            </h2>
            
            {selectedDepartment ? (
              <div className="space-y-4">
                <div>
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
                      onClick={() => handleUpdateDepartment(selectedDepartment.id)}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                      disabled={loading.operations}
                    >
                      Update
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sub-Departments</h3>
                  
                  {selectedDepartment.subDepartments && selectedDepartment.subDepartments.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedDepartment.subDepartments.map((subDept) => {
                        const isEditingSub = editingStates.subDepartments[subDept.id]?.isEditing || false;
                        const tempSubName = editingStates.subDepartments[subDept.id]?.tempName || '';
                        
                        return (
                          <li key={subDept.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            {isEditingSub ? (
                              <input
                                type="text"
                                value={tempSubName}
                                onChange={(e) => setEditingStates(prev => ({
                                  ...prev,
                                  subDepartments: {
                                    ...prev.subDepartments,
                                    [subDept.id]: {
                                      ...prev.subDepartments[subDept.id],
                                      tempName: e.target.value
                                    }
                                  }
                                }))}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                            ) : (
                              <span className="text-gray-700">{subDept.name}</span>
                            )}
                            <div className="flex gap-2">
                              {isEditingSub ? (
                                <>
                                  <button
                                    onClick={() => handleUpdateSubDepartment(selectedDepartment.id, subDept.id)}
                                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50"
                                    disabled={loading.operations}
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => toggleEditSubDepartment(subDept.id)}
                                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50"
                                    disabled={loading.operations}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => toggleEditSubDepartment(subDept.id)}
                                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                                  disabled={loading.operations}
                                >
                                  Edit
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteSubDepartment(selectedDepartment.id, subDept.id)}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
                                disabled={loading.operations}
                              >
                                Delete
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No sub-departments</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Select a department to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}