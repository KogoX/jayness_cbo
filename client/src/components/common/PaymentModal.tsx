import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axiosClient';
import LoadingSpinner from './LoadingSpinner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId?: string; // Optional (undefined = General Contribution)
  programTitle?: string; // Optional title for display
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, programId, programTitle }) => {
  // --- 1. STATE (Must be at the top) ---
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState<string | number>(1000); 
  const [loading, setLoading] = useState(false);
  
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Polling State
  const [isPolling, setIsPolling] = useState(false);
  const [checkoutRequestID, setCheckoutRequestID] = useState<string | null>(null);

  // --- 2. RESET EFFECT ---
  useEffect(() => {
    if (isOpen) {
        setAmount(programId ? '' : 1000);
        setPhoneNumber('');
        setMessage(null);
        setError(null);
        setIsPolling(false);
        setLoading(false);
    }
  }, [isOpen, programId]);

  // --- 3. HELPER: PHONE FORMATTER ---
  const formatPhoneNumber = (phone: string) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '254' + cleanPhone.substring(1);
    }
    return cleanPhone;
  };

  // --- 4. POLLING LOGIC ---
  useEffect(() => {
    let interval: any;

    if (isPolling && checkoutRequestID) {
      interval = setInterval(async () => {
        try {
          const response = await apiClient.get(`/payments/status/${checkoutRequestID}`);
          const status = response.data.status;

          if (status === 'Completed') {
            setMessage('✅ Payment Received! Thank you.');
            setError(null);
            setIsPolling(false);
            setLoading(false);
            
            setTimeout(() => {
              onClose();
            }, 3000);
          } else if (status === 'Failed') {
            setError('❌ Payment Failed or Cancelled.');
            setMessage(null);
            setIsPolling(false);
            setLoading(false);
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 3000); 
    }

    return () => clearInterval(interval);
  }, [isPolling, checkoutRequestID, onClose]);

  // --- 5. SUBMIT HANDLER ---
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    if (formattedPhone.length !== 12 || !formattedPhone.startsWith('254')) {
      setError('Invalid phone number. Use 07... or 01...');
      setLoading(false);
      return;
    }

    if (Number(amount) <= 0) {
      setError('Amount must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      // DYNAMIC URL SELECTION
      // Check if user is logged in (has token)
      const token = localStorage.getItem('token');
      
      // If logged in -> Use Protected Route (Tracks User ID)
      // If public -> Use Public Route (Anonymous)
      const endpoint = token ? '/payments/pay' : '/payments/public/pay';

      const response = await apiClient.post(endpoint, {
        phoneNumber: formattedPhone,
        amount: Number(amount),
        programId: programId 
      });

      console.log(response.data);
      setMessage(`📲 Sent to ${formattedPhone}! Check your phone.`);
      
      if (response.data?.data?.CheckoutRequestID) {
        setCheckoutRequestID(response.data.data.CheckoutRequestID);
        setIsPolling(true);
      } else {
        setError("Error: No Checkout ID returned");
        setLoading(false);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Payment failed to initiate.');
      setLoading(false);
    }
  };

  // --- 6. CONDITIONAL RETURN (MUST BE LAST) ---
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border-t-4 border-secondary transform transition-all">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {programId ? 'Donate to Initiative' : 'Make Payment'}
            </h3>
            {programTitle && <p className="text-sm text-primary font-medium">{programTitle}</p>}
          </div>
          <button 
            onClick={onClose} 
            disabled={loading} 
            className="text-gray-400 hover:text-red-500 transition disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Alerts */}
        {message && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200 flex items-center gap-2">
            <span className="animate-pulse">🟢</span> {message}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {loading && isPolling ? (
          <div className="flex flex-col items-center justify-center py-6">
            <LoadingSpinner />
            <p className="text-sm text-gray-500 mt-4 animate-pulse">Waiting for M-Pesa PIN...</p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handlePayment} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Amount (Ksh)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-bold">Ksh</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none transition font-bold text-gray-800"
                  placeholder="e.g. 500"
                  required
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                M-Pesa Number
              </label>
              <input
                type="text"
                placeholder="07XX XXX XXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-purple-100 outline-none transition"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Format: 07... or 01...</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-primary hover:bg-purple-700 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Pay Now
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;