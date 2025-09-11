import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { usePayment } from '../contexts/PaymentContext';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handlePaymentSuccess, checkPremiumStatus } = usePayment();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setStatus('error');
      setMessage('Invalid payment session');
      return;
    }

    const processPayment = async () => {
      try {
        const success = await handlePaymentSuccess(sessionId);
        
        if (success) {
          setStatus('success');
          setMessage('Payment successful! You now have premium access.');
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Payment verification failed. Please contact support.');
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        setStatus('error');
        setMessage('Something went wrong. Please contact support.');
      }
    };

    processPayment();
  }, [searchParams, handlePaymentSuccess, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
            <p className="text-gray-600">Please wait while we verify your payment...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">🎉 Welcome to Premium!</h3>
              <p className="text-green-700 text-sm">
                You can now create unlimited landing pages and access all premium features.
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-btn text-white px-6 py-3 rounded-lg font-semibold hover:bg-btn-hover transition-all duration-200"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Back to Dashboard
              </button>
              <p className="text-sm text-gray-500">
                Need help? Contact us at support@nextaiidea.com
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
