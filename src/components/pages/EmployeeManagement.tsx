import { useState } from 'react';
import DashboardLayout from '../Layout/DashboardLayout';
import { Search, Plus, Edit, Trash2, UserCheck, UserX, Clock } from 'lucide-react';

interface EmployeeManagementProps {
  userRole: 'admin' | 'cashier' | 'stock_manager' | null;
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

  const roles = ['all', 'Admin', 'Cashier', 'Stock Manager'];

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || emp.role === filterRole;
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleDeleteEmployee = (id: number) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter((e) => e.id !== id));
    }
  };

  const toggleStatus = (id: number) => {
    setEmployees(
      employees.map((emp) =>
        emp.id === id
          ? { ...emp, status: emp.status === 'active' ? 'inactive' : 'active' }
          : emp
      )
    );
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
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Total Employees</p>
            <h2 className="text-gray-800">{employees.length}</h2>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Active</p>
            <h2 className="text-green-700">{employees.filter((e) => e.status === 'active').length}</h2>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Inactive</p>
            <h2 className="text-red-700">{employees.filter((e) => e.status === 'inactive').length}</h2>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-600">Avg Working Hours</p>
            <h2 className="text-blue-700">
              {(employees.reduce((sum, e) => sum + e.workingHours, 0) / employees.length).toFixed(0)}h
            </h2>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">Employee</th>
                  <th className="px-6 py-3 text-left text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left text-gray-700">Contact</th>
                  <th className="px-6 py-3 text-left text-gray-700">Join Date</th>
                  <th className="px-6 py-3 text-left text-gray-700">Last Login</th>
                  <th className="px-6 py-3 text-left text-gray-700">Hours</th>
                  <th className="px-6 py-3 text-left text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {employee.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{employee.phone}</td>
                    <td className="px-6 py-4 text-gray-600">{employee.joinDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{employee.lastLogin}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{employee.workingHours}h</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(employee.id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                          employee.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {employee.status === 'active' ? (
                          <>
                            <UserCheck className="w-4 h-4" />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX className="w-4 h-4" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
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
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Role</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                      {roles.filter((r) => r !== 'all').map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Join Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Initial Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter initial password"
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
