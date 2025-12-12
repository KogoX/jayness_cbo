import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // <--- Added useLocation
import apiClient from '../../api/axiosClient';
import type { Program } from '../../types/program.types';
import PaymentModal from '../../components/common/PaymentModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProgramDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation(); // <--- Get current URL
  
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  // Check if we are in "Public" mode or "Dashboard" mode
  const isPublic = location.pathname.includes('/public');

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await apiClient.get(`/programs/${id}`);
        setProgram(response.data);
      } catch (error) {
        console.error("Failed to fetch program", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgram();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  
  if (!program) {
    return (
      <div className="p-10 text-center text-red-500">
        <p>Program not found.</p>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline mt-4">Go Back</button>
      </div>
    );
  }

  const percentage = Math.min((program.currentRaised / program.targetBudget) * 100, 100);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'Upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-0"> {/* Added padding for mobile */}
      
      {/* SMART BACK BUTTON */}
      <button 
        onClick={() => isPublic ? navigate('/') : navigate('/dashboard/programs')} 
        className="text-sm text-gray-500 hover:text-primary mb-4 flex items-center gap-1 transition"
      >
        ← {isPublic ? 'Back to Home' : 'Back to Initiatives'}
      </button>

      {/* Hero Section */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-md group">
        <img 
          src={program.image || 'https://via.placeholder.com/800x400'} 
          alt={program.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
          <div className="p-8 text-white w-full">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{program.title}</h1>
            <div className="flex flex-wrap gap-3 text-sm font-medium">
              <span className={`px-3 py-1 rounded-full font-bold uppercase tracking-wide text-xs ${getStatusBadge(program.status)}`}>
                {program.status}
              </span>
              <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-white border border-white/20">
                👥 {program.beneficiariesCount} Lives Impacted
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Description */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">About this Initiative</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
              {program.description}
            </p>
            
            <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-2">Why this matters</h3>
              <p className="text-sm text-blue-700">
                This program directly aligns with our mission to empower vulnerable community members through sustainable support and resource allocation.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Donation Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-primary sticky top-24">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Fundraising Progress</h3>
            
            <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  program.status === 'Completed' ? 'bg-green-500' : 'bg-secondary'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm mb-6">
              <span className="font-bold text-gray-800">Ksh {program.currentRaised.toLocaleString()}</span>
              <span className="text-gray-500">of Ksh {program.targetBudget.toLocaleString()}</span>
            </div>

            {program.status === 'Active' ? (
              <button 
                onClick={() => setPaymentModalOpen(true)}
                className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                Donate Now
              </button>
            ) : (
              <button 
                disabled
                className="w-full bg-gray-200 text-gray-500 font-bold py-3 rounded-lg cursor-not-allowed border border-gray-300"
              >
                {program.status === 'Completed' ? 'Campaign Closed' : 'Coming Soon'}
              </button>
            )}

            {program.status === 'Active' && (
              <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
                🔒 Secure payment via M-Pesa
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Render modal if Active */}
      {program.status === 'Active' && (
        <PaymentModal 
          isOpen={isPaymentModalOpen} 
          onClose={() => setPaymentModalOpen(false)} 
          programId={program._id} 
          programTitle={program.title}
        />
      )}
    </div>
  );
};

export default ProgramDetails;