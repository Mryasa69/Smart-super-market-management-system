import { ReactNode } from 'react';

import { Link, useLocation } from 'react-router-dom';



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

} from 'lucide-react';

import { useState } from 'react';





interface DashboardLayoutProps {

  userRole: 'admin' | 'cashier' | 'stock_manager' | 'customer' | null;

  onLogout: () => void;

  children: React.ReactNode;

}





export default function DashboardLayout({ children, userRole, onLogout }: DashboardLayoutProps) {

  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);



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

            <button

              onClick={() => {

                onLogout();

                // Redirect to login page

                window.location.href = '/login';

              }}

              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"

            >

              <LogOut className="w-5 h-5" />

              <span className="hidden md:inline">Logout</span>

            </button>

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

