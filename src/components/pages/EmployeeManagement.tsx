import { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { Search, Plus, Edit, Trash2, UserCheck, UserX, Clock } from 'lucide-react';
import ActivityTracker from '../../utils/activityTracker';

interface EmployeeManagementProps {
  userRole: 'admin' | 'cashier' | 'stock_manager' | 'customer' | null;
  onLogout: () => void;
}

interface Employee {
  id: string; // Changed to string to match ObjectId
  name: string;
  email: string;
  role: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  workingHours: number;
  password?: string; // Optional password field for editing
}

const initialEmployees: Employee[] = [];

export default function EmployeeManagement({ userRole, onLogout }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Cashier',
    joinDate: new Date().toISOString().split('T')[0],
    password: '',
  });
  const activityTracker = ActivityTracker.getInstance();

  const roles = ['all', 'Admin', 'Stock Manager', 'Cashier'];

  // Load employees from backend on mount
  useEffect(() => {
    const loadEmployees = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/employees', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              const transformedEmployees = data.data.map((emp: any) => ({
                id: emp._id,
                name: emp.name,
                email: emp.email,
                role: emp.role,
                phone: emp.phone,
                joinDate: emp.joinDate ? new Date(emp.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                status: emp.status || 'active',
                lastLogin: emp.lastLogin ? new Date(emp.lastLogin).toLocaleString() : 'Never',
                workingHours: emp.workingHours || 0,
              }));
              setEmployees(transformedEmployees);
              localStorage.setItem('employees', JSON.stringify(transformedEmployees));
            }
          }
        } catch (error) {
          console.log('Failed to load employees from backend, using localStorage');
          // Fallback to localStorage
          const storedEmployees = localStorage.getItem('employees');
          if (storedEmployees) {
            try {
              const parsed = JSON.parse(storedEmployees);
              setEmployees(parsed);
            } catch (parseError) {
              console.error('Failed to parse stored employees:', parseError);
            }
          }
        }
      }
    };

    loadEmployees();
  }, []);

  // Load employees from localStorage
  useEffect(() => {
    const localEmployees = localStorage.getItem('employees');
    if (localEmployees) {
      try {
        const parsed = JSON.parse(localEmployees);
        setEmployees(parsed);
      } catch (e) {
        setEmployees(initialEmployees);
      }
    }
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || employee.role === filterRole;
    const matchesStatus = filterStatus === 'all' || employee.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      const requestData = {
        name: newEmployee.name,
        email: newEmployee.email,
        phone: newEmployee.phone,
        role: newEmployee.role,
        joinDate: newEmployee.joinDate,
        password: newEmployee.password,
      };
      
      let apiSuccess = false;
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/employees', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(requestData),
          });
          
          if (response.ok) {
            apiSuccess = true;
          }
        } catch (error) {
          console.log('Backend employee creation failed:', error);
        }
      }

      const employee: Employee = {
        id: Date.now().toString(), // Generate string ID
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role,
        phone: newEmployee.phone,
        joinDate: newEmployee.joinDate,
        status: 'active',
        lastLogin: 'Just now',
        workingHours: 0,
      };

      const updatedEmployees = [...employees, employee];
      setEmployees(updatedEmployees);
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      
      // Log activity
      activityTracker.logEmployeeAdded(employee.name);
      
      setNewEmployee({
        name: '',
        email: '',
        phone: '',
        role: 'Cashier',
        joinDate: new Date().toISOString().split('T')[0],
        password: '',
      });
      setShowAddModal(false);
      
      alert(apiSuccess ? 'Employee added successfully!' : 'Employee added locally');
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add employee');
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingEmployee) return;
    
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await fetch(`http://localhost:5000/api/employees/${editingEmployee.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...editingEmployee,
              id: undefined // Remove id from body to avoid conflicts
            }),
          });
          
          if (response.ok) {
            console.log('Employee updated successfully');
          } else {
            console.error('Backend employee update failed:', response.status);
          }
        } catch (error) {
          console.error('Backend employee update failed:', error);
        }
      }

      // Always update locally (even if backend failed, to keep UI responsive)
      const updatedEmployees = employees.map(emp => 
        emp.id === editingEmployee.id ? editingEmployee : emp
      );
      
      setEmployees(updatedEmployees);
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      
      // Log activity
      activityTracker.logEmployeeUpdated(editingEmployee.name);
      
      setEditingEmployee(null);
      
      alert('Employee updated successfully!');
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      const employeeToDelete = employees.find(e => e.id === id);
      
      // Try to delete from backend
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          await fetch(`http://localhost:5000/api/employees/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          });
        } catch (error) {
          console.log('Backend delete failed, removing locally:', error);
        }
      }
      
      const updatedEmployees = employees.filter((e) => e.id !== id);
      setEmployees(updatedEmployees);
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      
      // Trigger event for other components
      window.dispatchEvent(new CustomEvent('employeesUpdated', {
        detail: {
          action: 'delete',
          employee: employeeToDelete,
          allEmployees: updatedEmployees
        }
      }));
      
      // Log activity
      activityTracker.logEmployeeDeleted(employeeToDelete.name);
    }
  };

  const handleToggleStatus = (id: string) => {
    const updatedEmployees = employees.map((emp) =>
      emp.id === id ? { ...emp, status: emp.status === 'active' ? 'inactive' : 'active' } : emp
    );
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    
    // Log activity
    const employee = employees.find(emp => emp.id === id);
    if (employee) {
      activityTracker.logEmployeeStatusToggled(employee.name, employee.status === 'active' ? 'deactivated' : 'activated');
    }
  };

  return (
    <DashboardLayout userRole={userRole} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-800">Employee Management</h1>
            <p className="text-gray-600">Manage staff members and their roles</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Employee
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Search employees..."
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Role</label>
              <select 
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Status</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left text-gray-700">Phone</th>
                  <th className="px-6 py-3 text-left text-gray-700">Join Date</th>
                  <th className="px-6 py-3 text-left text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-gray-700">Last Login</th>
                  <th className="px-6 py-3 text-left text-gray-700">Hours</th>
                  <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{employee.role}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {employee.phone}
                      </span>
                    </td>
                    <td className="px-6 py-4">{employee.joinDate}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(employee.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          employee.status === 'active' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {employee.status === 'active' ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">{employee.lastLogin}</td>
                    <td className="px-6 py-4">{employee.workingHours}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingEmployee(employee)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Employee Modal */}
        {(showAddModal || editingEmployee) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-gray-800 mb-4">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <form onSubmit={editingEmployee ? handleUpdateEmployee : handleAddEmployee} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editingEmployee ? editingEmployee.name : newEmployee.name}
                      onChange={(e) => editingEmployee ? 
                        setEditingEmployee({...editingEmployee, name: e.target.value}) :
                        setNewEmployee({...newEmployee, name: e.target.value})
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editingEmployee ? editingEmployee.email : newEmployee.email}
                      onChange={(e) => editingEmployee ? 
                        setEditingEmployee({...editingEmployee, email: e.target.value}) :
                        setNewEmployee({...newEmployee, email: e.target.value})
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter email"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={editingEmployee ? editingEmployee.phone : newEmployee.phone}
                      onChange={(e) => editingEmployee ? 
                        setEditingEmployee({...editingEmployee, phone: e.target.value}) :
                        setNewEmployee({...newEmployee, phone: e.target.value})
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Role</label>
                    <select 
                      value={editingEmployee ? editingEmployee.role : newEmployee.role}
                      onChange={(e) => editingEmployee ? 
                        setEditingEmployee({...editingEmployee, role: e.target.value}) :
                        setNewEmployee({...newEmployee, role: e.target.value})
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {roles.filter((r) => r !== 'all').map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Join Date</label>
                    <input
                      type="date"
                      value={editingEmployee ? editingEmployee.joinDate : newEmployee.joinDate}
                      onChange={(e) => editingEmployee ? 
                        setEditingEmployee({...editingEmployee, joinDate: e.target.value}) :
                        setNewEmployee({...newEmployee, joinDate: e.target.value})
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Initial Password</label>
                    <input
                      type="password"
                      value={editingEmployee ? editingEmployee.password || '' : newEmployee.password}
                      onChange={(e) => editingEmployee ? 
                        setEditingEmployee({...editingEmployee, password: e.target.value}) :
                        setNewEmployee({...newEmployee, password: e.target.value})
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter initial password"
                      required={editingEmployee ? false : true}
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingEmployee(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
                  >
                    {editingEmployee ? 'Update Employee' : 'Add Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
