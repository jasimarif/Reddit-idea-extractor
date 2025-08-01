import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error', 'already-verified'
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Check for error from Supabase in the URL hash first
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorCode = hashParams.get('error_code');
        const errorDescription = hashParams.get('error_description');
        
        if (errorCode === 'otp_expired' || errorDescription?.includes('expired')) {
          setStatus('error');
          setError('This verification link has expired. Please request a new verification email from the login page.');
          return;
        }
        
        // Check if we have a token in the URL (email confirmation)
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const email = searchParams.get('email');
        
        // If no token or type, show a more helpful message
        if (!token || !type) {
          setStatus('error');
          setError('This verification link appears to be incomplete. Please make sure you used the full link from your email. If you copied and pasted the link, ensure nothing was cut off.');
          return;
        }
        
        // Check if the type is correct
        if (type !== 'signup') {
          setStatus('error');
          setError('Invalid verification link type. Please use the signup verification link sent to your email.');
          return;
        }

        // First, check if the user is already verified
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        // If user is already verified and has a session
        if (session?.user?.email_confirmed_at) {
          setStatus('already-verified');
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
          return;
        }

        // Verify the token with Supabase
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token: token,
          type: 'signup',
          email: email
        });

        if (verifyError) {
          // If the error is because the user is already confirmed
          if (verifyError.message.includes('already verified') || 
              verifyError.message.includes('already confirmed') ||
              verifyError.message.includes('Email link is invalid or has expired')) {
            
            // Check user's verification status directly
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (!userError && user?.email_confirmed_at) {
              setStatus('already-verified');
              setTimeout(() => {
                navigate('/dashboard');
              }, 3000);
              return;
            }
            
            // If we get here, the link is truly invalid or expired
            throw new Error('This verification link is invalid or has expired. Please request a new one.');
          }
          throw verifyError;
        }
        
        // Email verified successfully
        setStatus('success');
        
        // Update the session to get the latest user data
        await supabase.auth.refreshSession();
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard', { 
            replace: true,
            state: { 
              message: 'Email verified successfully! Welcome to your dashboard.' 
            } 
          });
        }, 3000);
        
      } catch (err) {
        console.error('Email verification error:', err);
        setStatus('error');
        setError(err.message || 'Failed to verify email. The link might be invalid or expired.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {status === 'verifying' && 'Verifying your email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'already-verified' && 'Already Verified'}
          {status === 'error' && 'Verification Failed'}
        </h2>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status === 'verifying' && (
            <div className="text-center">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Your email has been verified successfully! Redirecting you to your dashboard...
              </p>
            </div>
          )}

          {status === 'already-verified' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Your email is already verified. Redirecting you to your dashboard...
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Go to Dashboard Now
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-red-800">Verification Failed</h3>
              <p className="mt-2 text-sm text-red-600">
                {error || 'There was an error verifying your email. Please try again.'}
              </p>
              
              {error?.includes('expired') || error?.includes('invalid') ? (
                <div className="mt-6 space-y-3">
                  <p className="text-sm text-gray-600">
                    Need a new verification link? You can request one from the login page.
                  </p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Go to Login
                  </button>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Go to Login
                  </button>
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Still having trouble? Contact support at{' '}
                  <a href="mailto:support@yourapp.com" className="text-purple-600 hover:text-purple-800">
                    support@yourapp.com
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
