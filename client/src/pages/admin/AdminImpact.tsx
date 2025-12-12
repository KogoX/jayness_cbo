import React, { useEffect, useState } from 'react';
import apiClient from '../../api/axiosClient';
import type { Testimonial, GalleryItem } from '../../types/impact.types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminImpact: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'testimonials' | 'gallery'>('testimonials');

  // Form States
  const [tForm, setTForm] = useState({ name: '', role: '', quote: '', image: '' });
  const [gForm, setGForm] = useState({ src: '', category: 'General', type: 'image', title: '' });

  const fetchData = async () => {
    try {
      const [tRes, gRes] = await Promise.all([
        apiClient.get('/impact/testimonials'),
        apiClient.get('/impact/gallery')
      ]);
      setTestimonials(tRes.data);
      setGallery(gRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Handlers ---
  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiClient.post('/impact/testimonials', tForm);
    setTForm({ name: '', role: '', quote: '', image: '' });
    fetchData();
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiClient.post('/impact/gallery', gForm);
    setGForm({ src: '', category: 'General', type: 'image', title: '' });
    fetchData();
  };

  const handleDelete = async (type: 'testimonials' | 'gallery', id: string) => {
    if(!window.confirm("Delete this item?")) return;
    await apiClient.delete(`/impact/${type}/${id}`);
    fetchData();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Manage Impact Content</h2>
      
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('testimonials')}
          className={`pb-2 px-4 font-medium ${activeTab === 'testimonials' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
        >
          Testimonials
        </button>
        <button 
          onClick={() => setActiveTab('gallery')}
          className={`pb-2 px-4 font-medium ${activeTab === 'gallery' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
        >
          Gallery & Videos
        </button>
      </div>

      {/* --- TESTIMONIALS SECTION --- */}
      {activeTab === 'testimonials' && (
        <div className="space-y-8">
          {/* Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4">Add New Testimonial</h3>
            <form onSubmit={handleAddTestimonial} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Name" className="border p-2 rounded" value={tForm.name} onChange={e=>setTForm({...tForm, name: e.target.value})} required />
                <input placeholder="Role (e.g. Beneficiary)" className="border p-2 rounded" value={tForm.role} onChange={e=>setTForm({...tForm, role: e.target.value})} required />
              </div>
              <input placeholder="Image URL" className="w-full border p-2 rounded" value={tForm.image} onChange={e=>setTForm({...tForm, image: e.target.value})} />
              <textarea placeholder="Quote" className="w-full border p-2 rounded" rows={2} value={tForm.quote} onChange={e=>setTForm({...tForm, quote: e.target.value})} required />
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Add Testimonial</button>
            </form>
          </div>

          {/* List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map(t => (
              <div key={t._id} className="bg-white p-4 rounded shadow flex items-start gap-4 border">
                <img src={t.image || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-full object-cover" alt="" />
                <div className="flex-1">
                  <h4 className="font-bold">{t.name}</h4>
                  <p className="text-xs text-gray-500">{t.role}</p>
                  <p className="text-sm text-gray-600 mt-1 italic">"{t.quote}"</p>
                </div>
                <button onClick={() => handleDelete('testimonials', t._id)} className="text-red-500 hover:text-red-700">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- GALLERY SECTION --- */}
      {activeTab === 'gallery' && (
        <div className="space-y-8">
          {/* Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4">Add Photo or Video</h3>
            <form onSubmit={handleAddGallery} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <select className="border p-2 rounded" value={gForm.type} onChange={e=>setGForm({...gForm, type: e.target.value as any})}>
                  <option value="image">Image</option>
                  <option value="video">YouTube Video</option>
                </select>
                <input placeholder="Category (e.g. Health)" className="border p-2 rounded" value={gForm.category} onChange={e=>setGForm({...gForm, category: e.target.value})} required />
              </div>
              <input placeholder={gForm.type === 'video' ? "YouTube Embed URL" : "Image URL"} className="w-full border p-2 rounded" value={gForm.src} onChange={e=>setGForm({...gForm, src: e.target.value})} required />
              {gForm.type === 'video' && <p className="text-xs text-gray-500">For YouTube, use the Embed URL (e.g. https://www.youtube.com/embed/xyz...)</p>}
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Add Item</button>
            </form>
          </div>

          {/* List */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map(g => (
              <div key={g._id} className="relative group bg-white rounded shadow overflow-hidden">
                {g.type === 'video' ? (
                  <div className="h-32 bg-black flex items-center justify-center text-white">▶ Video</div>
                ) : (
                  <img src={g.src} className="w-full h-32 object-cover" alt="" />
                )}
                <div className="p-2 text-xs flex justify-between items-center">
                  <span className="font-bold text-gray-500">{g.category}</span>
                  <button onClick={() => handleDelete('gallery', g._id)} className="text-red-500 font-bold">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminImpact;