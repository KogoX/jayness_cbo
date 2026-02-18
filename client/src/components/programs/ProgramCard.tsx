import React from 'react';
import { Link } from 'react-router-dom';
import type { Program } from '../../types/program.types';

interface Props {
  program: Program;
  isPublic?: boolean;
}

const ProgramCard: React.FC<Props> = ({ program, isPublic = false }) => {
  const rawPercentage =
    program.targetBudget > 0 ? (program.currentRaised / program.targetBudget) * 100 : 0;
  const percentage = Math.min(Math.max(rawPercentage, 0), 100);
  const percentageLabel = `${Math.round(percentage)}%`;

  const linkPath = isPublic ? `/public/programs/${program._id}` : `/dashboard/programs/${program._id}`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-white/90 text-green-700';
      case 'Completed':
        return 'bg-gray-800/90 text-white';
      case 'Upcoming':
        return 'bg-blue-600/90 text-white';
      default:
        return 'bg-white/90 text-gray-700';
    }
  };

  const getActionText = (status: string) => {
    if (status === 'Completed') return 'View Results';
    if (status === 'Upcoming') return 'Read More';
    return isPublic ? 'Learn & Donate' : 'Donate Now';
  };

  return (
    <Link
      to={linkPath}
      className={`group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1
        ${program.status === 'Completed' ? 'opacity-75 grayscale-[0.5] hover:grayscale-0 hover:opacity-100' : ''}
      `}
    >
      <div className="h-48 overflow-hidden relative bg-gray-100">
        <img
          src={program.image || 'https://via.placeholder.com/400x200'}
          alt={program.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div
          className={`absolute top-3 right-3 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold shadow-sm uppercase tracking-wide ${getStatusBadge(
            program.status
          )}`}
        >
          {program.status}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-primary transition-colors">
          {program.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{program.description}</p>

        <div className="mt-auto">
          <div className="flex justify-between text-xs mb-2 font-semibold uppercase tracking-wide">
            <span className="text-gray-500">
              Raised: <span className="text-gray-800">Ksh {program.currentRaised.toLocaleString()}</span>
            </span>
            <span className="text-primary">Target: Ksh {program.targetBudget.toLocaleString()}</span>
          </div>

          <div className="mb-1 flex justify-end">
            <span className="text-xs font-semibold text-gray-600">{percentageLabel} funded</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                program.status === 'Completed' ? 'bg-green-500' : 'bg-secondary'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-50">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-1a4 4 0 00-5-3.87M17 20H7m10 0v-1c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v1m0 0H2v-1a4 4 0 015-3.87M7 20v-1m10-8a3 3 0 11-6 0 3 3 0 016 0zm-10 0a3 3 0 116 0 3 3 0 01-6 0z"
                />
              </svg>
              <strong>{program.beneficiariesCount}</strong> Beneficiaries
            </span>
            <span className="text-sm font-bold text-primary group-hover:underline inline-flex items-center gap-1">
              {getActionText(program.status)}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProgramCard;
