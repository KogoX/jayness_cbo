import React from 'react';
import { usePrograms } from '../../hooks/usePrograms';
import ProgramCard from '../../components/programs/ProgramCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// 1. Define Props
interface ProgramsListProps {
  isPublic?: boolean;
}

const ProgramsList: React.FC<ProgramsListProps> = ({ isPublic = false }) => {
  const { programs, loading, error } = usePrograms();

  // --- SORTING LOGIC (Active -> Upcoming -> Completed) ---
  const sortedPrograms = [...programs].sort((a, b) => {
    const priority: Record<string, number> = {
      'Active': 1,
      'Upcoming': 2,
      'Completed': 3
    };

    const pA = priority[a.status] || 4; // Default to lowest priority if unknown
    const pB = priority[b.status] || 4;

    return pA - pB;
  });

  if (loading) return <LoadingSpinner />;

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Our Initiatives</h2>
          <p className="text-gray-500 text-sm">Empowering the community through 6 core pillars.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedPrograms.map((program) => (
          <ProgramCard 
            key={program._id} 
            program={program} 
            isPublic={isPublic} 
          />
        ))}
      </div>
    </div>
  );
};

export default ProgramsList;