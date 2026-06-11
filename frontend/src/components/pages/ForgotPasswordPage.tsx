import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Mail, ArrowLeft } from 'lucide-react';
import { apiService } from '../../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiService.forgotPassword(email);
      if (res.success) {
        setSuccess('Password reset link has been sent to your email. Please check your inbox.');
      } else {
        setError(res.message || 'No account found with this email.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <ShoppingCart className="w-12 h-12 text-green-700" />
            <div className="text-left">
              <h1 className="text-green-700">Smart Supermarket</h1>
              <p className="text-sm text-gray-500">Management System</p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-red-700 mb-2 text-center font-bold text-xl">RESET PASSWORD</h2>
          <p className="text-gray-600 text-center mb-6">
            Enter your email address to receive a link to reset your password.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                {isLoading ? 'Sending Request...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center border-t pt-4">
            <Link to="/login" className="inline-flex items-center gap-2 text-green-700 hover:text-green-800">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
