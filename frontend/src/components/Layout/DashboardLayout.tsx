import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  UserCircle,
  BarChart3,
  Truck,
  LogOut,
  Menu,
  X,
  Home,
  User,
  ChevronDown,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { apiService } from '../../services/api';


interface DashboardLayoutProps {
  userRole: 'admin' | 'cashier' | 'stock_manager' | null;
  onLogout: () => void;
  children: React.ReactNode;
}


export default function DashboardLayout({ children, userRole, onLogout }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [memberDisplayName, setMemberDisplayName] = useState('Member');
  const [memberEmail, setMemberEmail] = useState('');
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const navItems = [
    { path: '/', icon: Home, label: 'Home', roles: ['admin', 'cashier', 'stock_manager'] },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'cashier', 'stock_manager'] },
    { path: '/inventory', icon: Package, label: 'Inventory', roles: ['admin', 'stock_manager'] },
    { path: '/pos', icon: ShoppingCart, label: 'POS System', roles: ['admin', 'cashier'] },
    { path: '/employees', icon: Users, label: 'Employees', roles: ['admin'] },
    { path: '/customers', icon: UserCircle, label: 'Customers', roles: ['admin', 'cashier'] },
    { path: '/reports', icon: BarChart3, label: 'Reports', roles: ['admin'] },
    { path: '/suppliers', icon: Truck, label: 'Suppliers', roles: ['admin', 'stock_manager'] },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole || 'admin'));
  const canAccess = (itemRoles: string[]) => userRole ? itemRoles.includes(userRole) : false;

  useEffect(() => {
    const user = apiService.getStoredUser();
    if (!user) return;
    setMemberDisplayName([user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Member');
    setMemberEmail(user.email || '');
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    if (isAccountMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isAccountMenuOpen]);

  const accountActivities = (() => {
    if (userRole === 'cashier') {
      return [
        { label: 'POS Activity', path: '/pos' },
        { label: 'Customer Activity', path: '/customers' },
      ];
    }
    if (userRole === 'stock_manager') {
      return [
        { label: 'Inventory Activity', path: '/inventory' },
        { label: 'Supplier Activity', path: '/suppliers' },
      ];
    }
    return [
      { label: 'Dashboard Activity', path: '/dashboard' },
      { label: 'Employee Activity', path: '/employees' },
      { label: 'Reports Activity', path: '/reports' },
    ];
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-8 h-8 text-green-700" />
              <div>
                <h1 className="text-green-700">Smart Supermarket</h1>
                <p className="text-sm text-gray-500">Management System</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-gray-700 capitalize">{userRole?.replace('_', ' ')}</p>
              <p className="text-sm text-gray-500">Logged in</p>
            </div>
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:inline">Account</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border rounded-lg shadow-lg z-50 py-2">
                  <div className="px-4 pb-2 border-b">
                    <p className="text-sm font-medium text-gray-800 truncate">{memberDisplayName}</p>
                    {memberEmail && <p className="text-xs text-gray-500 truncate">{memberEmail}</p>}
                  </div>
                  <p className="px-4 py-2 text-xs text-gray-500 uppercase">Activities</p>
                  {accountActivities.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsAccountMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      {item.label}
                    </button>
                  ))}
                  <div className="my-2 border-t" />
                  <button
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r transition-transform duration-300 ease-in-out`}
        >
          <nav className="p-4 space-y-2 mt-16 lg:mt-0">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-700 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
