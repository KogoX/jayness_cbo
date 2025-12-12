import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { Testimonial, GalleryItem } from '../../types/impact.types';

const Impact: React.FC = () => {
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="bg-white min-h-screen">
      
      {/* 1. HERO */}
      <section className="bg-primary text-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">See Our Impact</h1>
          <p className="text-purple-100 text-lg">
            Real stories, real people, real change. Witness the difference your support makes.
          </p>
        </div>
      </section>

      {/* 2. VIDEOS (Filtered from Gallery) */}
      {gallery.filter(g => g.type === 'video').length > 0 && (
        <section className="py-16 max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center border-b pb-4">Featured Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {gallery.filter(g => g.type === 'video').map(video => (
              <div key={video._id} className="aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg">
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

      {/* 3. TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Voices of the Community</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <div key={t._id} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative">
                  <div className="absolute -top-4 -left-4 bg-secondary text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl font-serif">"</div>
                  <p className="text-gray-600 italic mb-6 leading-relaxed">{t.quote}</p>
                  <div className="flex items-center gap-4">
                    <img src={t.image || 'https://via.placeholder.com/100'} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
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

      {/* 4. PHOTO GALLERY */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Gallery</h2>
          <p className="text-gray-500 mt-2">Moments captured from our recent activities.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {gallery.filter(g => g.type === 'image').map((img) => (
            <div key={img._id} className="group relative overflow-hidden rounded-xl h-64 cursor-pointer">
              <img src={img.src} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-bold border border-white px-4 py-1 rounded-full backdrop-blur-sm">
                  {img.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Impact;