import { useState, useEffect } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { Search, Plus, Edit, Trash2, UserCheck, UserX, Clock } from 'lucide-react';
import ActivityTracker from '../../utils/activityTracker';

interface EmployeeManagementProps {
  userRole: 'admin' | 'cashier' | 'stock_manager' | 'customer' | null;
  onLogout: () => void;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  workingHours: number;
}

const initialEmployees: Employee[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@smartsuper.lk',
    role: 'Cashier',
    phone: '+94 77 123 4567',
    joinDate: '2024-01-15',
    status: 'active',
    lastLogin: '2025-12-10 09:30 AM',
    workingHours: 168,
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@smartsuper.lk',
    role: 'Stock Manager',
    phone: '+94 77 234 5678',
    joinDate: '2024-02-20',
    status: 'active',
    lastLogin: '2025-12-10 08:45 AM',
    workingHours: 156,
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@smartsuper.lk',
    role: 'Cashier',
    phone: '+94 77 345 6789',
    joinDate: '2024-03-10',
    status: 'active',
    lastLogin: '2025-12-10 10:15 AM',
    workingHours: 144,
  },
  {
    id: 4,
    name: 'Sarah Williams',
    email: 'sarah@smartsuper.lk',
    role: 'Admin',
    phone: '+94 77 456 7890',
    joinDate: '2023-11-01',
    status: 'active',
    lastLogin: '2025-12-10 07:00 AM',
    workingHours: 200,
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david@smartsuper.lk',
    role: 'Cashier',
    phone: '+94 77 567 8901',
    joinDate: '2024-06-15',
    status: 'inactive',
    lastLogin: '2025-12-05 05:30 PM',
    workingHours: 88,
  },
];

export default function EmployeeManagement({ userRole, onLogout }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
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
        id: Math.max(...employees.map(e => e.id), 0) + 1,
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

  const handleDeleteEmployee = async (id: number) => {
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

  const handleToggleStatus = (id: number) => {
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
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
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

        {/* Add Employee Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-gray-800 mb-4">Add New Employee</h2>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter email"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Role</label>
                    <select 
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
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
                      value={newEmployee.joinDate}
                      onChange={(e) => setNewEmployee({ ...newEmployee, joinDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Initial Password</label>
                    <input
                      type="password"
                      value={newEmployee.password}
                      onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter initial password"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
                  >
                    Add Employee
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
