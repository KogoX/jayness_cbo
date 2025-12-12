import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosClient';
import PaymentModal from '../../components/common/PaymentModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Define types for the data we need locally
interface DashboardData {
  programCount: number;
  nextEvent: {
    title: string;
    category: string;
    date: string;
  } | null;
  isPaidCurrentMonth: boolean;
  totalContributed: number;
}

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  // Get current month name (e.g., "Dec")
  const currentMonth = new Date().toLocaleString('default', { month: 'short' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch everything in parallel for speed
        const [programsRes, eventsRes, historyRes] = await Promise.all([
          apiClient.get('/programs'),
          apiClient.get('/events'),
          apiClient.get('/payments/history')
        ]);

        // 1. Process Payments
        const payments = historyRes.data;
        const now = new Date();
        
        // Calculate Total
        const total = payments
          .filter((p: any) => p.status === 'Completed')
          .reduce((sum: number, p: any) => sum + p.amount, 0);

        // Check if paid this month
        const paidThisMonth = payments.some((p: any) => {
          const pDate = new Date(p.createdAt);
          return (
            p.status === 'Completed' &&
            pDate.getMonth() === now.getMonth() &&
            pDate.getFullYear() === now.getFullYear()
          );
        });

        // 2. Process Events (Get the first one)
        const upcomingEvent = eventsRes.data.length > 0 ? eventsRes.data[0] : null;

        // 3. Set State
        setData({
          programCount: programsRes.data.length,
          nextEvent: upcomingEvent,
          isPaidCurrentMonth: paidThisMonth,
          totalContributed: total
        });

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1: Monthly Contribution Status */}
        <div className={`p-6 rounded-xl shadow-sm border flex flex-col justify-between
          ${data?.isPaidCurrentMonth 
            ? 'bg-white border-gray-100' 
            : 'bg-red-50 border-red-100' // Highlight red if unpaid
          }`}>
          <div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Monthly Contribution</h3>
            <div className="flex items-baseline mt-3">
              <span className="text-3xl font-bold text-gray-800">Ksh 1,000</span>
              <span className="ml-1 text-sm text-gray-500">/mo</span>
            </div>
            
            {/* Dynamic Badge */}
            <span className={`inline-block mt-3 px-2 py-1 text-xs rounded-full font-bold
              ${data?.isPaidCurrentMonth 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'}`}>
              {data?.isPaidCurrentMonth ? `Paid for ${currentMonth}` : `Due for ${currentMonth}`}
            </span>
          </div>
          
          <button 
            onClick={() => setPaymentModalOpen(true)}
            className="w-full mt-6 bg-primary text-white text-sm font-semibold py-3 rounded-lg hover:bg-primary-hover shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            {data?.isPaidCurrentMonth ? 'Pay Extra / Advance' : 'Pay Contribution'}
          </button>
        </div>

        {/* Card 2: Welfare Fund (Calculated as 30% of total contribution) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">My Welfare Fund</h3>
          <div className="mt-3">
            {/* Show 30% of what they have contributed so far */}
            <span className="text-3xl font-bold text-gray-800">
              Ksh {data ? (data.totalContributed * 0.3).toLocaleString() : 0}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            30% of your total contributions ({data?.totalContributed.toLocaleString()})
          </p>
        </div>

        {/* Card 3: Active Programs Count */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Initiatives</h3>
          <div className="mt-3">
            <span className="text-3xl font-bold text-gray-800">{data?.programCount || 0}</span>
          </div>
          <button 
            onClick={() => navigate('/dashboard/programs')}
            className="mt-4 text-accent hover:text-accent-dark text-sm font-medium hover:underline"
          >
            View All Programs →
          </button>
        </div>
      </div>

      {/* Activity Section (Next Event) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Upcoming Event</h3>
        <div className="space-y-4">
          {data?.nextEvent ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-purple-50 transition border border-gray-100 hover:border-purple-100 cursor-pointer"
                 onClick={() => navigate('/dashboard/events')}>
              <div className="mb-2 sm:mb-0">
                <p className="font-bold text-primary">{data.nextEvent.title}</p>
                <p className="text-sm text-gray-600">{data.nextEvent.category}</p>
              </div>
              <div className="flex items-center text-sm text-gray-500 bg-white px-3 py-1 rounded border border-gray-200">
                <span className="mr-2">📅</span> 
                {new Date(data.nextEvent.date).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No upcoming events scheduled.</p>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setPaymentModalOpen(false)} 
      />
    </>
  );
};

export default Overview;