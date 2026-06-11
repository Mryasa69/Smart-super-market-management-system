import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../../services/api';

interface LoginPageProps {
  onLogin: (role: 'admin' | 'cashier' | 'stock_manager' | 'customer') => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      // Clear any existing sessions
      apiService.clearAllAuth();
      
      // Try staff login first
      let response = await apiService.staffLogin(formData);
      
      if (response.success && response.data && response.data.token) {
        // Staff login successful
        apiService.saveAuthData(response.data.token, response.data);
        
        const role = response.data.role;
        onLogin(role);

        // Redirect based on role
        if (role === 'admin') navigate('/dashboard');
        else if (role === 'cashier') navigate('/pos');
        else if (role === 'stock_manager') navigate('/inventory');
        else if (role === 'customer') navigate('/customer-dashboard');
        else {
          // For any successful login, redirect to home page
          navigate('/');
        }
      } else {
        // Try customer login if staff login failed
        response = await apiService.customerLogin(formData);
        
        if (response.success && response.data && response.data.token) {
          // Customer login successful
          apiService.saveCustomerAuthData(response.data.token, response.data.customer);

          try {
            const cartRes = await apiService.getCart();
            if (cartRes.success && cartRes.data) {
              localStorage.setItem('cart', JSON.stringify(cartRes.data.items || []));
            }
          } catch (cartError) {
            console.error('Error ensuring customer cart on login:', cartError);
          }
          
          onLogin('customer');
          navigate('/');
          navigate('/customer-dashboard');
        } else {
          setError(response.message || 'Invalid email or password');
        }
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <ShoppingCart className="w-12 h-12 text-green-700" />
            <div className="text-left">
              <h1 className="text-green-700">Smart Supermarket</h1>
              <p className="text-sm text-gray-500">Management System</p>
            </div>
          </Link>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-red-700 mb-2 text-center font-bold">LOGIN</h2>
          <p className="text-gray-600 text-center mb-6">Staff & Customer Access</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-green-700 hover:text-green-800">
                Forgot Password?
              </a>
            </div>

            {/* Log In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-green-700 hover:text-green-800">
                Sign Up
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}