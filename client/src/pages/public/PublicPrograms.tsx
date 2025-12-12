import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axiosClient';
import ProgramCard from '../../components/programs/ProgramCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Program } from '../../types/program.types';

const PublicPrograms: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const { data } = await apiClient.get('/programs');
        setPrograms(data);
      } catch (error) {
        console.error("Failed to load programs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  // --- SORTING LOGIC ---
  // Define priority: 1. Active, 2. Upcoming, 3. Completed
  const sortedPrograms = [...programs].sort((a, b) => {
    const priority: Record<string, number> = {
      'Active': 1,
      'Upcoming': 2,
      'Completed': 3
    };

    // Get priority value, default to 4 if status is unknown
    const pA = priority[a.status] || 4;
    const pB = priority[b.status] || 4;

    return pA - pB;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Our Initiatives</h2>
            <p className="text-gray-500 mt-2">Empowering the community through 6 core pillars.</p>
          </div>
        </div>

        {/* Grid - Using sortedPrograms instead of programs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPrograms.map((program) => (
            <ProgramCard 
              key={program._id} 
              program={program} 
              isPublic={true} 
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default PublicPrograms;