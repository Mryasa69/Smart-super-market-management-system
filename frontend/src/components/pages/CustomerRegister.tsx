import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Check, Phone, ShieldCheck, RefreshCw, Send } from 'lucide-react';
import { apiService } from '../../services/api';

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function CustomerRegister() {
  const location = useLocation();
  const initialEmail = location.state?.email || '';

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: initialEmail,
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  
  // States for the UX flow
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  
  // OTP input states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpError, setOtpError] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  const navigate = useNavigate();

  /* ── countdown timer for resend ── */
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  const validatePassword = (password: string) => {
    const strength = {
      hasMinLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    setPasswordStrength(strength);
    return strength;
  };

  const validateForm = () => {
    const newErrors: ValidationErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const strength = validatePassword(formData.password);
      if (!strength.hasMinLength) newErrors.password = 'Password must be at least 8 characters';
      else if (!strength.hasLowercase) newErrors.password = 'Password must contain a lowercase letter';
      else if (!strength.hasUppercase) newErrors.password = 'Password must contain an uppercase letter';
      else if (!strength.hasNumber) newErrors.password = 'Password must contain a number';
      else if (!strength.hasSpecialChar) newErrors.password = 'Password must contain a special character';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (name === 'password') validatePassword(value);
    
    // Reset OTP flow if email changes after verified/sent
    if (name === 'email') {
      setOtpSent(false);
      setOtpVerified(false);
      setOtp(['', '', '', '', '', '']);
    }
  };

  /* ── OTP box input handler ── */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    setOtpError('');
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
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

  /* ── Send OTP ── */
  const handleSendOTP = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    
    try {
      const res = await apiService.sendRegistrationOtp(formData.email, formData.name);
      if (res.success) {
        setOtpSent(true);
        setResendCountdown(60);
      } else {
        setErrors({ general: res.message || 'Failed to send OTP' });
      }
    } catch {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Verify OTP ── */
  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }
    setIsVerifying(true);
    setOtpError('');

    try {
      const res = await apiService.verifyRegistrationOtp(formData.email, code);
      if (res.success) {
        setOtpVerified(true);
        setOtpSent(false);
      } else {
        setOtpError(res.message || 'Invalid or expired code');
      }
    } catch {
      setOtpError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  /* ── Final Sign Up ── */
  const handleSignUp = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/customer-auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      });
      const data = await response.json();

      if (data.success && data.data) {
        // Automatically login
        localStorage.setItem('customerToken', data.data.token);
        localStorage.setItem('customer', JSON.stringify(data.data.customer));

        try {
          const cartRes = await apiService.getCart();
          if (cartRes.success && cartRes.data) {
            localStorage.setItem('cart', JSON.stringify(cartRes.data.items || []));
          }
        } catch {}

        navigate('/');
      } else {
        setErrors({ general: data.message || 'Registration failed' });
      }
    } catch {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Resend OTP ── */
  const handleResend = async () => {
    if (resendCountdown > 0) return;
    setIsResending(true);
    try {
      const res = await apiService.sendRegistrationOtp(formData.email, formData.name);
      if (res.success) {
        setResendCountdown(60);
        setOtp(['', '', '', '', '', '']);
        setOtpError('');
        otpRefs.current[0]?.focus();
      } else {
        setOtpError(res.message || 'Could not resend code');
      }
    } catch {
      setOtpError('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  /* ── styles ── */
  const S = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 40%,#f0f9ff 100%)',
      fontFamily: "'Inter',system-ui,sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
    } as React.CSSProperties,
    card: {
      width: '100%',
      maxWidth: 520,
      background: '#fff',
      borderRadius: 24,
      boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
      overflow: 'hidden',
    } as React.CSSProperties,
    cardHeader: {
      background: 'linear-gradient(135deg,#16a34a,#059669)',
      padding: '28px 32px',
      position: 'relative' as const,
      overflow: 'hidden',
    },
    blob1: { position: 'absolute' as const, top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' },
    blob2: { position: 'absolute' as const, bottom: -10, left: 20, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' },
    headerTitle: { fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, position: 'relative' as const },
    headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '4px 0 0', position: 'relative' as const },
    body: { padding: '28px 32px 32px' },
    formGroup: { display: 'flex', flexDirection: 'column' as const, gap: 6, marginBottom: 16 },
    label: { fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase' as const, letterSpacing: '0.04em' },
    inputWrap: (hasError: boolean, focused: boolean, disabled: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: disabled ? '#f3f4f6' : (focused ? '#f0fdf4' : '#f9fafb'),
      border: `2px solid ${hasError ? '#f87171' : focused ? '#16a34a' : '#e5e7eb'}`,
      borderRadius: 12,
      padding: '11px 14px',
      transition: 'all 0.2s',
      opacity: disabled ? 0.7 : 1,
    } as React.CSSProperties),
    input: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontSize: 14,
      color: '#111827',
      fontFamily: 'inherit',
    } as React.CSSProperties,
    errorMsg: { fontSize: 12, color: '#ef4444', margin: '2px 0 0' },
    strengthBar: { display: 'flex', gap: 4, marginTop: 8 },
    submitBtn: (disabled: boolean, type: 'primary' | 'secondary' = 'primary') => ({
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '13px 24px',
      borderRadius: 12,
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 15,
      fontWeight: 700,
      background: disabled ? '#e5e7eb' : (type === 'primary' ? 'linear-gradient(135deg,#16a34a,#059669)' : '#f3f4f6'),
      color: disabled ? '#9ca3af' : (type === 'primary' ? '#fff' : '#374151'),
      boxShadow: disabled ? 'none' : (type === 'primary' ? '0 4px 14px rgba(22,163,74,0.35)' : 'none'),
      transition: 'all 0.2s',
      marginTop: 8,
    } as React.CSSProperties),
    divider: { textAlign: 'center' as const, fontSize: 13, color: '#9ca3af', marginTop: 20 },
    
    // OTP Box styles
    otpContainer: {
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      padding: '20px',
      marginTop: '8px',
      marginBottom: '16px',
    },
    otpHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
    otpTitle: { fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 },
    otpBoxRow: { display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 },
    otpBox: (filled: boolean, hasError: boolean) => ({
      width: 44,
      height: 52,
      borderRadius: 10,
      border: `2px solid ${hasError ? '#f87171' : filled ? '#16a34a' : '#e5e7eb'}`,
      background: '#fff',
      fontSize: 20,
      fontWeight: 800,
      color: '#111827',
      textAlign: 'center' as const,
      outline: 'none',
      transition: 'all 0.15s',
      fontFamily: "'Courier New',monospace",
    } as React.CSSProperties),
    resendRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 },
    resendBtn: (disabled: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      fontWeight: 700,
      color: disabled ? '#9ca3af' : '#16a34a',
      background: 'none',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      padding: 0,
    } as React.CSSProperties),
  };

  /* ── focused field tracker ── */
  const [focused, setFocused] = useState<Record<string, boolean>>({});
  const onFocus = (k: string) => setFocused(p => ({ ...p, [k]: true }));
  const onBlur = (k: string) => setFocused(p => ({ ...p, [k]: false }));

  const allStrengthBars = Object.values(passwordStrength);
  const strengthCount = allStrengthBars.filter(Boolean).length;
  const strengthColor = strengthCount <= 2 ? '#ef4444' : strengthCount <= 3 ? '#f59e0b' : '#16a34a';

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* header */}
        <div style={S.cardHeader}>
          <div style={S.blob1} /><div style={S.blob2} />
          <p style={S.headerTitle}>Create Your Account 🛒</p>
          <p style={S.headerSub}>Join Smart Supermarket and enjoy exclusive benefits</p>
        </div>

        <div style={S.body}>
          {/* general error */}
          {errors.general && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: 12, marginBottom: 18, fontSize: 13, fontWeight: 600 }}>
              ⚠️ {errors.general}
            </div>
          )}

          <div>
            {/* Full Name */}
            <div style={S.formGroup}>
              <label style={S.label}>Full Name</label>
              <div style={S.inputWrap(!!errors.name, !!focused.name, false)}>
                <User size={16} color={focused.name ? '#16a34a' : '#9ca3af'} />
                <input
                  id="name" name="name" type="text" value={formData.name}
                  onChange={handleInputChange} placeholder="John Doe"
                  onFocus={() => onFocus('name')} onBlur={() => onBlur('name')}
                  style={S.input}
                  disabled={otpVerified || otpSent}
                />
              </div>
              {errors.name && <p style={S.errorMsg}>{errors.name}</p>}
            </div>

            {/* Email */}
            <div style={S.formGroup}>
              <label style={S.label}>Email Address</label>
              <div style={S.inputWrap(!!errors.email, !!focused.email, otpVerified || otpSent)}>
                <Mail size={16} color={(otpVerified || otpSent) ? '#16a34a' : (focused.email ? '#16a34a' : '#9ca3af')} />
                <input
                  id="email" name="email" type="email" value={formData.email}
                  onChange={handleInputChange} placeholder="you@example.com"
                  onFocus={() => onFocus('email')} onBlur={() => onBlur('email')}
                  style={S.input}
                  disabled={otpVerified || otpSent}
                />
                {otpVerified && <ShieldCheck size={18} color="#16a34a" />}
              </div>
              {errors.email && <p style={S.errorMsg}>{errors.email}</p>}
              {otpVerified && <p style={{fontSize: 12, color: '#16a34a', margin: '2px 0 0', fontWeight: 600}}>Email verified successfully</p>}
            </div>

            {/* Phone */}
            <div style={S.formGroup}>
              <label style={S.label}>Phone Number</label>
              <div style={S.inputWrap(!!errors.phone, !!focused.phone, false)}>
                <Phone size={16} color={focused.phone ? '#16a34a' : '#9ca3af'} />
                <input
                  id="phone" name="phone" type="tel" value={formData.phone}
                  onChange={handleInputChange} placeholder="+94 77 123 4567"
                  onFocus={() => onFocus('phone')} onBlur={() => onBlur('phone')}
                  style={S.input}
                  disabled={otpVerified || otpSent}
                />
              </div>
              {errors.phone && <p style={S.errorMsg}>{errors.phone}</p>}
            </div>

            {/* Password */}
            <div style={S.formGroup}>
              <label style={S.label}>Password</label>
              <div style={S.inputWrap(!!errors.password, !!focused.password, false)}>
                <Lock size={16} color={focused.password ? '#16a34a' : '#9ca3af'} />
                <input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange} placeholder="••••••••"
                  onFocus={() => onFocus('password')} onBlur={() => onBlur('password')}
                  style={S.input}
                  disabled={otpVerified || otpSent}
                />
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }} onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <EyeOff size={16} color="#9ca3af" /> : <Eye size={16} color="#9ca3af" />}
                </button>
              </div>
              {errors.password && <p style={S.errorMsg}>{errors.password}</p>}
              {/* strength bars */}
              {formData.password && (
                <div>
                  <div style={S.strengthBar}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= strengthCount ? strengthColor : '#e5e7eb', transition: 'background 0.2s' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: strengthColor, marginTop: 4, fontWeight: 600 }}>
                    {strengthCount <= 2 ? 'Weak' : strengthCount <= 3 ? 'Fair' : strengthCount <= 4 ? 'Good' : 'Strong'} password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={S.formGroup}>
              <label style={S.label}>Confirm Password</label>
              <div style={S.inputWrap(!!errors.confirmPassword, !!focused.confirmPassword, false)}>
                <Lock size={16} color={focused.confirmPassword ? '#16a34a' : '#9ca3af'} />
                <input
                  id="confirmPassword" name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange} placeholder="••••••••"
                  onFocus={() => onFocus('confirmPassword')} onBlur={() => onBlur('confirmPassword')}
                  style={S.input}
                  disabled={otpVerified || otpSent}
                />
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }} onClick={() => setShowConfirmPassword(v => !v)}>
                  {showConfirmPassword ? <EyeOff size={16} color="#9ca3af" /> : <Eye size={16} color="#9ca3af" />}
                </button>
              </div>
              {errors.confirmPassword && <p style={S.errorMsg}>{errors.confirmPassword}</p>}
            </div>
            
            {/* Action Area based on OTP state */}
            <div style={{ marginTop: 24 }}>
              {!otpSent && !otpVerified && (
                <button type="button" style={S.submitBtn(isLoading)} onClick={handleSendOTP} disabled={isLoading}>
                  {isLoading ? (
                    <><span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: 16 }}>⏳</span> Sending OTP…</>
                  ) : (
                    <><Send size={18} /> Send OTP</>
                  )}
                </button>
              )}

              {otpSent && !otpVerified && (
                <div style={S.otpContainer}>
                  <div style={S.otpHeader}>
                    <ShieldCheck size={20} color="#16a34a" />
                    <p style={S.otpTitle}>Verify your email to continue</p>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>
                    We sent a 6-digit code to <strong>{formData.email}</strong>
                  </p>

                  <div style={S.otpBoxRow} onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        style={S.otpBox(!!digit, !!otpError)}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <p style={{ ...S.errorMsg, textAlign: 'center', marginBottom: 12 }}>{otpError}</p>
                  )}

                  <button
                    type="button"
                    style={S.submitBtn(isVerifying, 'primary')}
                    onClick={handleVerifyOTP}
                    disabled={isVerifying}
                  >
                    {isVerifying ? 'Verifying…' : 'Okay'}
                  </button>
                  
                  <div style={S.resendRow}>
                    <button
                      style={S.resendBtn(resendCountdown > 0 || isResending)}
                      onClick={handleResend}
                      disabled={resendCountdown > 0 || isResending}
                    >
                      {isResending ? (
                        <><RefreshCw size={13} /> Sending…</>
                      ) : resendCountdown > 0 ? (
                        <>Resend in {resendCountdown}s</>
                      ) : (
                        <><RefreshCw size={13} /> Resend Code</>
                      )}
                    </button>
                    <span style={{color: '#cbd5e1'}}>|</span>
                    <button 
                      onClick={() => setOtpSent(false)}
                      style={{...S.resendBtn(false), color: '#64748b'}}
                    >
                      Change Details
                    </button>
                  </div>
                </div>
              )}

              {otpVerified && (
                <button type="button" style={S.submitBtn(isLoading)} onClick={handleSignUp} disabled={isLoading}>
                  {isLoading ? (
                    <><span style={{ fontSize: 16 }}>⏳</span> Creating Account…</>
                  ) : (
                    <><Check size={18} /> Sign Up</>
                  )}
                </button>
              )}
            </div>

          </div>

          <div style={S.divider}>
            Already have an account?{' '}
            <Link to="/customer-login" style={{ fontWeight: 700, color: '#16a34a', textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
