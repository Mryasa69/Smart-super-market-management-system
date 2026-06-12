import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Mail, Lock, Eye, EyeOff, IdCard, ShieldCheck, RefreshCw, Send, Check } from 'lucide-react';
import { GoogleAuthSection } from '../auth/GoogleAuthSection';

interface SignUpPageProps {
  onLogin: (role: 'admin' | 'cashier' | 'stock_manager' | 'customer') => void;
}

export default function SignUpPage({ onLogin }: SignUpPageProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    nic: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // OTP flow states
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  /* ── OTP handlers ── */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    setOtpError('');
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleSendOTP = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-registration-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, firstName: formData.firstName })
      });
      const data = await response.json();
      if (data.success) {
        setOtpSent(true);
        setResendCountdown(60);
      } else {
        setErrors({ general: data.message || 'Failed to send OTP' });
      }
    } catch {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }
    setIsVerifying(true);
    setOtpError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-registration-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: code })
      });
      const data = await response.json();
      if (data.success) {
        setOtpVerified(true);
        setOtpSent(false);
      } else {
        setOtpError(data.message || 'Invalid or expired code');
      }
    } catch {
      setOtpError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    setIsResending(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-registration-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, firstName: formData.firstName })
      });
      const data = await response.json();
      if (data.success) {
        setResendCountdown(60);
        setOtp(['', '', '', '', '', '']);
        setOtpError('');
        otpRefs.current[0]?.focus();
      } else {
        setOtpError(data.message || 'Could not resend code');
      }
    } catch {
      setOtpError('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          nic: formData.nic,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        alert('Registration successful! Please login with your credentials.');
        navigate('/login');
      } else {
        const apiError =
          data.message ||
          (Array.isArray(data.errors) && data.errors.length > 0 ? data.errors[0].msg : '') ||
          'Registration failed';
        setErrors((prev) => ({ ...prev, general: apiError }));
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, general: 'Network error. Please try again.' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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

        {/* Sign Up Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-gray-800 mb-2 text-center">Create Account</h2>
          <p className="text-gray-600 text-center mb-6">Sign up to get started</p>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Enter first name"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    required
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Enter last name"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    required
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setOtpSent(false);
                    setOtpVerified(false);
                    setOtp(['', '', '', '', '', '']);
                  }}
                  placeholder="Enter your email"
                  disabled={otpSent || otpVerified}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60 disabled:bg-gray-100 ${errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  required
                />
                {otpVerified && <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />}
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
              {otpVerified && (
                <p className="text-green-600 text-sm mt-1 font-medium">Email verified successfully</p>
              )}
            </div>

            {/* Password Fields */}
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
              </p>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                  className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
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
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                  className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* NIC (Optional) */}
            <div>
              <label htmlFor="nic" className="block text-gray-700 mb-2">
                NIC Number <span className="text-gray-500">(Optional)</span>
              </label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="nic"
                  value={formData.nic}
                  onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                  placeholder="Enter NIC number (e.g., 123456789V)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded mt-1"
                  required
                />
                <span className="text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-green-700 hover:text-green-800">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-green-700 hover:text-green-800">
                    Privacy Policy
                  </a>
                  {' '}<span className="text-red-500">*</span>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>
              )}
            </div>

            {/* Sign Up Actions */}
            <div className="pt-2">
              {!otpSent && !otpVerified && (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition-colors disabled:bg-gray-400 font-medium text-lg"
                >
                  {isLoading ? 'Sending OTP...' : <><Send className="w-5 h-5" /> Send OTP</>}
                </button>
              )}

              {otpSent && !otpVerified && (
                <div className="mt-4 mb-4 flex flex-col items-center justify-center w-full max-w-sm mx-auto">
                  <div className="flex flex-col items-center justify-center space-y-4 w-full">
                    <div className="flex items-center gap-2 text-green-700">
                      <ShieldCheck className="w-6 h-6" />
                      <h3 className="font-semibold text-lg">Verify your email</h3>
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      We sent a 6-digit code to <br className="sm:hidden" />
                      <span className="font-medium text-gray-800">{formData.email}</span>
                    </p>

                    <div className="flex gap-2 sm:gap-3 justify-center items-center w-full py-2" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={el => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          className={`w-16 h-16 text-center text-lg sm:text-2xl font-bold rounded-lg border-2 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all ${
                          otpError
                            ? 'border-red-400 bg-red-50 text-red-900'
                            : digit
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-gray-300'
                          }`}
                          autoFocus={i === 0}
                        />
                      ))}
                    </div>

                    {otpError && (
                      <p className="text-red-500 text-sm text-center">{otpError}</p>
                    )}

                    <div className="w-full pt-2">
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={isVerifying}
                        className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 font-bold text-xl shadow-lg"
                      >
                        {isVerifying ? 'Verifying...' : 'Okay'}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-3 text-sm">
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendCountdown > 0 || isResending}
                        className="flex items-center gap-1.5 font-medium text-green-700 hover:text-green-800 disabled:text-gray-400"
                      >
                        <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                        {isResending ? 'Sending...' : resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
                      </button>
                      <span className="hidden sm:inline text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-gray-500 hover:text-gray-700 font-medium underline sm:no-underline"
                      >
                        Change Email
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {otpVerified && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition-colors disabled:bg-gray-400 font-medium text-lg"
                >
                  {isLoading ? 'Signing Up...' : <><Check className="w-5 h-5" /> Sign Up</>}
                </button>
              )}
            </div>
          </form>

          <GoogleAuthSection
            mode="signup"
            onLogin={() => onLogin('customer')}
            onError={(message) => setErrors((prev) => ({ ...prev, general: message }))}
          />

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-green-700 hover:text-green-800">
                Log In
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