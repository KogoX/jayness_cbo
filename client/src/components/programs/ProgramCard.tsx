import React from 'react';
import { Link } from 'react-router-dom';
import type { Program } from '../../types/program.types';

interface Props {
  program: Program;
  isPublic?: boolean; 
}

const ProgramCard: React.FC<Props> = ({ program, isPublic = false }) => {
  const percentage = Math.min((program.currentRaised / program.targetBudget) * 100, 100);

  // Determine where the card links to
  const linkPath = isPublic 
    ? `/public/programs/${program._id}` 
    : `/dashboard/programs/${program._id}`;

  // Helper for Badge Colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-white/90 text-green-700';
      case 'Completed': return 'bg-gray-800/90 text-white';
      case 'Upcoming': return 'bg-blue-600/90 text-white';
      default: return 'bg-white/90 text-gray-700';
    }
  };

  // Helper for Action Text
  const getActionText = (status: string) => {
    if (status === 'Completed') return 'View Results';
    if (status === 'Upcoming') return 'Read More';
    return isPublic ? 'Learn & Donate →' : 'Donate Now →';
  };

  return (
    <Link 
      to={linkPath} 
      className={`group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1
        ${program.status === 'Completed' ? 'opacity-75 grayscale-[0.5] hover:grayscale-0 hover:opacity-100' : ''}
      `}
    >
      {/* ... (Keep the rest of the JSX exactly the same, just update the text helper below) ... */}
      
      {/* 1. IMAGE SECTION (Keep same) */}
      <div className="h-48 overflow-hidden relative bg-gray-100">
        <img 
          src={program.image || 'https://via.placeholder.com/400x200'} 
          alt={program.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className={`absolute top-3 right-3 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold shadow-sm uppercase tracking-wide ${getStatusBadge(program.status)}`}>
          {program.status}
        </div>
      </div>

      {/* 2. CONTENT SECTION */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-primary transition-colors">
          {program.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {program.description}
        </p>

        {/* 3. STATS */}
        <div className="mt-auto">
          <div className="flex justify-between text-xs mb-2 font-semibold uppercase tracking-wide">
            <span className="text-gray-500">Raised: <span className="text-gray-800">Ksh {program.currentRaised.toLocaleString()}</span></span>
            <span className="text-primary">Target: Ksh {program.targetBudget.toLocaleString()}</span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ease-out ${program.status === 'Completed' ? 'bg-green-500' : 'bg-secondary'}`} 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-50">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              👥 <strong>{program.beneficiariesCount}</strong> Beneficiaries
            </span>
            <span className="text-sm font-bold text-primary group-hover:underline">
              {getActionText(program.status)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProgramCard;