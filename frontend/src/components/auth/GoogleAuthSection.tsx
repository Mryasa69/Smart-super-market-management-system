import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { apiService } from '../../services/api';
import { isGoogleAuthConfigured } from '../../config/auth';
import { AuthDivider } from './AuthDivider';

type AuthMode = 'login' | 'signup';

interface GoogleAuthSectionProps {
  mode: AuthMode;
  onLogin: (role: 'customer') => void;
  onError: (message: string) => void;
}

const GOOGLE_ICON = (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.8-4.1 2.8-6.9 0-.7-.1-1.5-.2-2.2H12z"
    />
    <path
      fill="#34A853"
      d="M6.7 14.3l-.7.5-2.5 2c1.6 3.2 4.9 5.2 8.5 5.2 2.4 0 4.5-.8 6-2.4l-3.1-2.4c-.9.6-2 1-2.9 1-2.3 0-4.2-1.5-4.9-3.6z"
    />
    <path
      fill="#4285F4"
      d="M3.5 7.2C2.9 8.4 2.6 9.7 2.6 11s.3 2.6.9 3.8c0 0 3.2-2.5 3.2-2.5.2-.4.3-.8.3-1.3s-.1-.9-.3-1.3L3.5 7.2z"
    />
    <path
      fill="#FBBC05"
      d="M12 4.8c1.3 0 2.5.4 3.5 1.4l2.6-2.6C16.5 2 14.4 1.2 12 1.2c-3.6 0-6.9 2-8.5 5.2l3.2 2.5c.7-2.1 2.6-3.6 5.3-3.6z"
    />
  </svg>
);

const buttonClassName =
  'w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold';

function GoogleAuthButton({ mode, onLogin, onError }: GoogleAuthSectionProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const label = mode === 'login' ? 'Continue with Google' : 'Sign up with Google';
  const loadingLabel = mode === 'login' ? 'Signing in with Google...' : 'Creating your account...';

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      onError('');
      setIsLoading(true);
      try {
        apiService.clearAllAuth();
        const response = await apiService.customerGoogleLogin(tokenResponse.access_token);

        if (response.success && response.data?.token && response.data?.customer) {
          apiService.saveCustomerAuthData(response.data.token, response.data.customer);

          try {
            const cartRes = await apiService.getCart();
            if (cartRes.success && cartRes.data) {
              localStorage.setItem('cart', JSON.stringify(cartRes.data.items || []));
            }
          } catch (cartError) {
            console.error('Error ensuring customer cart on google auth:', cartError);
          }

          onLogin('customer');
          navigate('/');
        } else {
          onError(response.message || 'Google sign-in failed. Please try again.');
        }
      } catch (googleError) {
        console.error('Google auth error:', googleError);
        onError('Google sign-in failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      onError('Google sign-in was cancelled or failed.');
      setIsLoading(false);
    },
  });

  return (
    <button
      type="button"
      onClick={() => {
        onError('');
        googleLogin();
      }}
      disabled={isLoading}
      className={buttonClassName}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm">
        {GOOGLE_ICON}
      </div>
      <span>{isLoading ? loadingLabel : label}</span>
    </button>
  );
}

function GoogleAuthPlaceholder({ mode, onError }: Pick<GoogleAuthSectionProps, 'mode' | 'onError'>) {
  const label = mode === 'login' ? 'Continue with Google' : 'Sign up with Google';

  return (
    <button
      type="button"
      onClick={() =>
        onError(
          'Google sign-in is not configured yet. Add VITE_GOOGLE_CLIENT_ID to frontend/.env and restart the dev server.'
        )
      }
      className={buttonClassName}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm">
        {GOOGLE_ICON}
      </div>
      <span>{label}</span>
    </button>
  );
}

export function GoogleAuthSection({ mode, onLogin, onError }: GoogleAuthSectionProps) {
  const subtext =
    mode === 'login'
      ? 'Sign in instantly with your Google account'
      : 'Create your account in one tap — no password needed';

  return (
    <div className="space-y-3">
      <AuthDivider />

      <div className="w-full">
        {isGoogleAuthConfigured ? (
          <GoogleAuthButton mode={mode} onLogin={onLogin} onError={onError} />
        ) : (
          <GoogleAuthPlaceholder mode={mode} onError={onError} />
        )}

        <p className="mt-3 text-center text-xs text-gray-500">{subtext}</p>
      </div>
    </div>
  );
}
