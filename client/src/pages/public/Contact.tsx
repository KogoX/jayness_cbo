import React, { useState } from 'react';
import apiClient from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Contact: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/contact', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterStatus('success');
      setNewsletterEmail('');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-purple-100 text-lg max-w-2xl mx-auto">
            Have questions or want to partner with us? We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Get in Touch</h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-50 p-3 rounded-lg text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700">Headquarters</h4>
                    <p className="text-gray-600">Westlands, Nairobi</p>
                    <a
                      href="https://maps.google.com/?q=Westlands,Nairobi"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-sm hover:underline"
                    >
                      Get Directions
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-50 p-3 rounded-lg text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a2 2 0 011.9 1.37l1.06 3.18a2 2 0 01-.5 2.06L9.9 11.42a16 16 0 006.68 6.68l1.81-1.84a2 2 0 012.06-.5l3.18 1.06A2 2 0 0122 18.72V22a2 2 0 01-2 2h-1C9.61 24 0 14.39 0 3V2a2 2 0 012-2h1z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700">Phone</h4>
                    <p className="text-gray-600">+254 712 345 678</p>
                    <p className="text-gray-500 text-sm">Mon-Fri, 8am - 5pm</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-50 p-3 rounded-lg text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l9 6 9-6m0 8H3a2 2 0 01-2-2V8a2 2 0 012-2h18a2 2 0 012 2v6a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700">Email</h4>
                    <p className="text-gray-600">info@jaynesscbo.org</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Join our Newsletter</h3>
                <p className="text-yellow-100 text-sm mb-6">Stay updated on our latest projects and impact stories.</p>

                {newsletterStatus === 'success' ? (
                  <div className="bg-white/20 p-3 rounded-lg border border-white/30 flex items-center justify-center gap-2 font-bold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Thanks for subscribing!
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      required
                    />
                    <button type="submit" className="w-full bg-white text-secondary font-bold py-3 rounded-lg hover:bg-gray-100 transition">
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative">
              {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl">
                  <LoadingSpinner />
                  <p className="text-primary font-bold mt-4">Sending Message...</p>
                </div>
              )}

              {submitted ? (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Message Sent!</h3>
                  <p className="text-gray-600 max-w-md">
                    Thank you for reaching out. A member of our team will get back to you shortly.
                  </p>
                  <button onClick={() => setSubmitted(false)} className="mt-8 text-primary font-bold hover:underline">
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h3>
                  {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                        <input
                          type="text"
                          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-gray-50 focus:bg-white"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-gray-50 focus:bg-white"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                      <select
                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-gray-50 focus:bg-white"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Partnership">Partnership / Sponsorship</option>
                        <option value="Volunteering">Volunteering</option>
                        <option value="Program Feedback">Program Feedback</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                      <textarea
                        rows={6}
                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-gray-50 focus:bg-white"
                        placeholder="How can we help you?"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700 transition shadow-md hover:shadow-lg transform active:scale-95"
                      >
                        Send Message
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <h3 className="text-xl font-bold text-gray-800 mb-4 px-2">Find Us</h3>
              <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-200">
                <iframe
                  title="Jayness Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src="https://maps.google.com/maps?q=Westlands,Nairobi&t=&z=13&ie=UTF8&iwloc=&output=embed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
