import React from 'react';

const About: React.FC = () => {
  return (
    <div className="bg-white">
      
      {/* 1. HERO */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Jayness CBO</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            [cite_start]Founded by Agnes Wanjiru, Jayness CBO was born from a desire to promote inclusive growth and empower those left behind in our community[cite: 39, 42].
          </p>
        </div>
      </section>

      {/* 2. MISSION & VISION */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Vision */}
          <div className="bg-purple-50 p-10 rounded-3xl border border-purple-100">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-2xl mb-6">👁️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              [cite_start]A just, resilient, and inclusive community where every individual can realize their potential and contribute meaningfully to society[cite: 50].
            </p>
          </div>

          {/* Mission */}
          <div className="bg-green-50 p-10 rounded-3xl border border-green-100">
            <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl mb-6">🚀</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              [cite_start]To empower vulnerable and marginalized community members by delivering life-changing services in education, health, economic empowerment, and advocacy[cite: 51].
            </p>
          </div>
        </div>
      </section>

      {/* 3. CORE VALUES */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-center">
            {[
              { title: 'Integrity', desc: 'Transparent and ethical practices' },
              { title: 'Inclusiveness', desc: 'Non-discriminatory support' },
              { title: 'Empowerment', desc: 'Creating opportunities for self-reliance' },
              { title: 'Collaboration', desc: 'Partnering for amplified impact' },
              { title: 'Accountability', desc: 'Responsible stewardship of resources' }
            ].map((val, idx) => (
              <div key={idx} className="p-6 border border-gray-700 rounded-xl hover:bg-gray-800 transition">
                <h3 className="text-xl font-bold text-secondary mb-2">{val.title}</h3>
                <p className="text-gray-400 text-sm">{val.desc}</p>
              </div>
            ))}
          </div>
          [cite_start]<p className="text-center text-gray-500 mt-12 text-sm">[cite: 53-57]</p>
        </div>
      </section>

      {/* 4. THE TEAM */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">Our Leadership</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Founder */}
            <div className="group">
              <div className="w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 shadow-lg">
                <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&auto=format&fit=crop" alt="Agnes" className="w-full h-full object-cover group-hover:scale-110 transition duration-500"/>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Agnes Wanjiru</h3>
              <p className="text-primary font-medium mb-2">Founder & Chairperson</p>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                [cite_start]A devoted mother and passionate advocate inspired by her own community's resilience[cite: 39].
              </p>
            </div>

            {/* Placeholder Execs */}
            {[
              { role: 'Secretary', name: 'Executive Committee' },
              { role: 'Treasurer', name: 'Executive Committee' }
            ].map((exec, idx) => (
              <div key={idx} className="group">
                <div className="w-48 h-48 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-6 shadow-sm text-4xl">
                  👥
                </div>
                <h3 className="text-xl font-bold text-gray-900">{exec.name}</h3>
                <p className="text-primary font-medium">{exec.role}</p>
              </div>
            ))}

          </div>
        </div>
      </section>

    </div>
  );
};

export default About;