import React, { useEffect, useRef, useState } from 'react';
import apiClient from '../../api/axiosClient';
import LoadingSpinner from './LoadingSpinner';
import { downloadReceiptPdf, type ReceiptPayload } from '../../utils/receipt';

const MAX_POLL_ERRORS = 10;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId?: string;
  programTitle?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, programId, programTitle }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState<string | number>(1000);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isPolling, setIsPolling] = useState(false);
  const [checkoutRequestID, setCheckoutRequestID] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [mpesaReceiptCode, setMpesaReceiptCode] = useState<string | null>(null);
  const pollErrorCountRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setAmount(programId ? '' : 1000);
      setPhoneNumber('');
      setMessage(null);
      setError(null);
      setIsPolling(false);
      setLoading(false);
      setCheckoutRequestID(null);
      setIsCompleted(false);
      setDownloadingReceipt(false);
      setMpesaReceiptCode(null);
      pollErrorCountRef.current = 0;
    }
  }, [isOpen, programId]);

  const formatPhoneNumber = (phone: string) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '254' + cleanPhone.substring(1);
    }
    return cleanPhone;
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isPolling && checkoutRequestID) {
      interval = setInterval(async () => {
        try {
          const response = await apiClient.get(`/payments/status/${checkoutRequestID}`);
          const { status, receipt, receiptPending } = response.data;
          pollErrorCountRef.current = 0;

          if (status === 'Completed') {
            if (receiptPending || !receipt) {
              setMessage('Payment received. Finalizing M-Pesa confirmation code...');
              setError(null);
              setIsCompleted(false);
              // keep polling until receipt code is captured
            } else {
              setMpesaReceiptCode(receipt || null);
              setMessage(`Your payment was successful. M-Pesa code: ${receipt}`);
              setError(null);
              setIsPolling(false);
              setLoading(false);
              setIsCompleted(true);
            }
          } else if (status === 'Failed') {
            setError('Payment failed. Please try again.');
            setMessage(null);
            setIsPolling(false);
            setLoading(false);
            setIsCompleted(false);
          } else if (status === 'Cancelled') {
            setError('Payment was cancelled.');
            setMessage(null);
            setIsPolling(false);
            setLoading(false);
            setIsCompleted(false);
          } else {
            // Keep polling on pending and clear transient network errors.
            setError(null);
          }
        } catch (err) {
          console.error('Polling error', err);
          pollErrorCountRef.current += 1;
          if (pollErrorCountRef.current >= MAX_POLL_ERRORS) {
            setError('Could not confirm transaction status. Please check your Financials history.');
            setIsPolling(false);
            setLoading(false);
          } else {
            setError('Temporary connection issue while verifying payment. Retrying...');
          }
        }
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [isPolling, checkoutRequestID, onClose]);

  const handleDownloadReceipt = async () => {
    if (!checkoutRequestID) return;

    setDownloadingReceipt(true);
    setMessage(null);
    setError(null);

    try {
      const response = await apiClient.get(`/payments/receipt/${checkoutRequestID}`);
      setMpesaReceiptCode(response.data?.receiptNumber || mpesaReceiptCode);
      await downloadReceiptPdf(response.data as ReceiptPayload);
      setMessage('Receipt downloaded successfully.');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        setError('Payment is confirmed but M-Pesa receipt code is still syncing. Please try again shortly.');
      } else {
        setError(err.response?.data?.message || 'Could not download receipt.');
      }
    } finally {
      setDownloadingReceipt(false);
    }
  };

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
      const token = localStorage.getItem('token');
      const endpoint = token ? '/payments/pay' : '/payments/public/pay';

      const response = await apiClient.post(endpoint, {
        phoneNumber: formattedPhone,
        amount: Number(amount),
        programId: programId,
      });

      setMessage(`Prompt sent to ${formattedPhone}. Check your phone.`);

      if (response.data?.data?.CheckoutRequestID) {
        setCheckoutRequestID(response.data.data.CheckoutRequestID);
        setIsPolling(true);
      } else {
        setError('Error: No Checkout ID returned');
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Payment failed to initiate.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border-t-4 border-secondary transform transition-all"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {programId ? 'Donate to Initiative' : 'Make Payment'}
            </h3>
            {programTitle && <p className="text-sm text-primary font-medium">{programTitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition"
          >
            x
          </button>
        </div>

        {message && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {loading && isPolling ? (
          <div className="flex flex-col items-center justify-center py-6">
            <LoadingSpinner />
            <p className="text-sm text-gray-500 mt-4 animate-pulse">
              {isCompleted ? 'Payment received. Fetching confirmation code...' : 'Waiting for M-Pesa PIN...'}
            </p>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Processing may take some time. You can close this popup and confirm payment later from your history.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Close Popup
            </button>
          </div>
        ) : isCompleted ? (
          <div className="space-y-4">
            {mpesaReceiptCode && (
              <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 border border-emerald-200">
                Confirmation Code: <span className="font-semibold">{mpesaReceiptCode}</span>
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDownloadReceipt}
                disabled={downloadingReceipt}
                className="flex-1 px-4 py-3 text-sm font-bold text-white bg-primary hover:bg-purple-700 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingReceipt ? 'Preparing...' : 'Download Receipt'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePayment} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Amount (Ksh)</label>
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
              <label className="block text-sm font-bold text-gray-700 mb-1">M-Pesa Number</label>
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
