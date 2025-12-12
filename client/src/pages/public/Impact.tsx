import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Testimonial, GalleryItem } from '../../types/impact.types';

interface ImpactProps {
  isDashboard?: boolean;
}

const Impact: React.FC<ImpactProps> = ({ isDashboard = false }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tRes, gRes] = await Promise.all([
          apiClient.get('/impact/testimonials'),
          apiClient.get('/impact/gallery')
        ]);
        setTestimonials(tRes.data);
        setGallery(gRes.data);
      } catch (error) {
        console.error("Failed to load impact data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="bg-white min-h-screen">
      
      {/* HEADER SECTION */}
      {!isDashboard ? (
        // PUBLIC VIEW: Big Hero Banner
        <section className="bg-primary text-white py-20 text-center relative">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">See Our Impact</h1>
            <p className="text-purple-100 text-lg">
              Real stories, real people, real change. Witness the difference your support makes.
            </p>
          </div>
        </section>
      ) : (
        // DASHBOARD VIEW: Simple Title
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Impact Stories</h2>
          <p className="text-gray-500 text-sm">See how your contributions are helping.</p>
        </div>
      )}

      {/* CONTENT */}
      <div>
        {/* Videos */}
        {gallery.filter(g => g.type === 'video').length > 0 && (
          <section className={`max-w-5xl mx-auto px-4 ${isDashboard ? 'py-6' : 'py-16'}`}>
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center border-b pb-2">Featured Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gallery.filter(g => g.type === 'video').map(video => (
                <div key={video._id} className="aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-sm relative">
                  <iframe 
                    width="100%" height="100%" 
                    src={video.src} 
                    title="Impact Video" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section className={`bg-gray-50 ${isDashboard ? 'py-8' : 'py-16'}`}>
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Voices of the Community</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t) => (
                  <div key={t._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
                    <div className="absolute -top-3 -left-3 bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center text-xl font-serif">"</div>
                    <p className="text-gray-600 italic mb-4 leading-relaxed text-sm">{t.quote}</p>
                    <div className="flex items-center gap-3">
                      <img 
                        src={t.image || 'https://via.placeholder.com/100'} 
                        alt={t.name} 
                        className="w-10 h-10 rounded-full object-cover border border-primary" 
                      />
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{t.name}</h4>
                        <p className="text-xs text-primary font-bold uppercase tracking-wide">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Photo Gallery */}
        <section className={`max-w-7xl mx-auto px-4 ${isDashboard ? 'py-8' : 'py-20'}`}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Gallery</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.filter(g => g.type === 'image').map((img) => (
              <div key={img._id} className="group relative overflow-hidden rounded-xl h-48 cursor-pointer">
                <img 
                  src={img.src} 
                  alt="Gallery" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-white text-xs font-bold border border-white px-3 py-1 rounded-full">{img.category}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Impact;