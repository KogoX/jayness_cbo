import React, { useEffect, useState } from 'react';
import apiClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface PaymentRecord {
  _id: string;
  amount: number;
  mpesaReceiptNumber: string;
  status: 'Pending' | 'Completed' | 'Failed';
  createdAt: string;
  phoneNumber: string;
}

const Financials: React.FC = () => {
  const [transactions, setTransactions] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const totalContributed = transactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.get('/payments/history');
        setTransactions(response.data);
      } catch (err) {
        setError('Failed to load financial history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
        {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              {/* Error Icon */}
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* 1. Header & Summary Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Financials</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card: Total Given */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-primary">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Contributed</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">Ksh {totalContributed.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-2 font-medium">Lifetime Donations</p>
          </div>

          {/* Card: Pending (Mock logic for now) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-secondary">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Next Due</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">Dec 5th</p>
            <p className="text-xs text-gray-500 mt-2">Monthly Contribution (Ksh 1,000)</p>
          </div>
        </div>
      </div>

      {/* 2. Transaction History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">Transaction History</h3>
        </div>
        
        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Receipt No.</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      {new Date(t.createdAt).toLocaleDateString()} 
                      <span className="text-xs text-gray-400 block">
                        {new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-500">
                      {t.mpesaReceiptNumber || '-'}
                    </td>
                    <td className="px-6 py-4">{t.phoneNumber}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      Ksh {t.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${t.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          t.status === 'Failed' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Financials;