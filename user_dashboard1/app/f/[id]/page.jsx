"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ClientFormPage({ params }) {
  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const { id } = params;
  const router = useRouter();

  useEffect(() => {
    const fetchForm = async () => {
      setLoading(true);
      try {
        const { data: formData, error: formError } = await supabase
          .from('custom_forms')
          .select('*')
          .eq('id', id)
          .single();

        if (formError) throw formError;
        setForm(formData);

        const { data: fieldsData, error: fieldsError } = await supabase
          .from('custom_form_fields')
          .select('*')
          .eq('form_id', id)
          .order('order_index', { ascending: true });

        if (fieldsError) throw fieldsError;
        setFields(fieldsData || []);
        
        // Initialize form data
        const initialData = {};
        fieldsData.forEach(f => {
          initialData[f.id] = f.field_type === 'checkbox' ? false : '';
        });
        setFormData(initialData);

      } catch (err) {
        console.error("Error fetching form:", err);
        setError("This form does not exist or has been removed.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchForm();
    }
  }, [id]);

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    // Validate required fields
    for (const field of fields) {
      if (field.is_required && !formData[field.id] && formData[field.id] !== false) {
        alert(`Please complete the required field: ${field.label}`);
        return;
      }
    }

    setSubmitting(true);
    // Fire and forget the database insert to make submission instant
    supabase
      .from('custom_form_responses')
      .insert([{
        form_id: id,
        client_email: email,
        response_data: formData
      }])
      .then(({ error: submitError }) => {
        if (submitError) console.error("Background submission error:", submitError);
      })
      .catch(err => console.error("Unexpected error:", err));

    // Instantly show success state
    setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-[#0f172a] p-8 rounded-3xl border border-white/5 max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Form Not Found</h1>
          <p className="text-slate-400 mb-8">{error}</p>
          <button onClick={() => router.push('/')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl w-full transition-all">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]"></div>
        
        <div className="bg-[#0f172a]/80 backdrop-blur-xl p-10 rounded-3xl border border-white/10 max-w-md w-full shadow-2xl relative z-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Thank You!</h1>
          <p className="text-slate-300 mb-8 leading-relaxed">Your responses have been successfully submitted to the Magnevents team. We will be in touch shortly.</p>
          <button onClick={() => router.push('/')} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-3 px-8 rounded-xl w-full transition-all">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-3xl mx-auto px-4 py-12 relative z-10">
        <div className="flex justify-center mb-10">
          <div className="bg-white/5 p-4 rounded-3xl backdrop-blur-md border border-white/10">
             <Image src="/assets/logo.webp" alt="Magnevents Logo" width={140} height={60} className="h-10 w-auto object-contain filter invert brightness-200" priority />
          </div>
        </div>

        <div className="bg-[#0f172a]/90 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">{form.title}</h1>
            {form.description && (
              <p className="text-slate-400 leading-relaxed text-lg">{form.description}</p>
            )}
          </div>

          <div className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <label className="block text-sm font-bold text-indigo-300 uppercase tracking-widest mb-3">Your Email Address <span className="text-rose-400">*</span></label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Where should we contact you?"
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-5 py-4 text-white font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                />
              </div>

              <div className="w-full h-px bg-white/5 my-8"></div>

              {fields.map(field => (
                <div key={field.id} className="space-y-3">
                  <label className="block text-sm font-bold text-slate-300">
                    {field.label}
                    {field.is_required && <span className="text-rose-500 ml-1.5">*</span>}
                  </label>
                  
                  {field.field_type === 'text' && (
                    <input
                      type="text"
                      required={field.is_required}
                      placeholder={field.placeholder || ''}
                      value={formData[field.id]}
                      onChange={e => handleChange(field.id, e.target.value)}
                      className="w-full bg-[#020617]/50 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    />
                  )}
                  
                  {field.field_type === 'email' && (
                    <input
                      type="email"
                      required={field.is_required}
                      placeholder={field.placeholder || ''}
                      value={formData[field.id]}
                      onChange={e => handleChange(field.id, e.target.value)}
                      className="w-full bg-[#020617]/50 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    />
                  )}

                  {field.field_type === 'textarea' && (
                    <textarea
                      required={field.is_required}
                      placeholder={field.placeholder || ''}
                      value={formData[field.id]}
                      onChange={e => handleChange(field.id, e.target.value)}
                      rows={4}
                      className="w-full bg-[#020617]/50 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600 resize-none"
                    />
                  )}

                  {field.field_type === 'date' && (
                    <input
                      type="date"
                      required={field.is_required}
                      value={formData[field.id]}
                      onChange={e => handleChange(field.id, e.target.value)}
                      className="w-full bg-[#020617]/50 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  )}

                  {field.field_type === 'select' && (
                    <select
                      required={field.is_required}
                      value={formData[field.id]}
                      onChange={e => handleChange(field.id, e.target.value)}
                      className="w-full bg-[#020617]/50 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    >
                      <option value="" disabled>Select an option...</option>
                      {field.options && JSON.parse(field.options).map((opt, i) => (
                        <option key={i} value={opt} className="bg-slate-900">{opt}</option>
                      ))}
                    </select>
                  )}

                  {field.field_type === 'checkbox' && (
                    <label className="flex items-center gap-4 cursor-pointer p-4 rounded-xl border border-white/10 bg-[#020617]/30 hover:bg-[#020617]/60 transition-colors">
                      <input
                        type="checkbox"
                        required={field.is_required}
                        checked={formData[field.id]}
                        onChange={e => handleChange(field.id, e.target.checked)}
                        className="w-5 h-5 rounded border-white/20 text-indigo-500 focus:ring-indigo-500 bg-transparent"
                      />
                      <span className="text-slate-300 font-medium">Yes, I confirm this</span>
                    </label>
                  )}
                </div>
              ))}

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-sm tracking-widest uppercase py-5 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <><div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div> Submitting...</>
                  ) : (
                    'Submit Response'
                  )}
                </button>
                <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mt-6">
                  Powered by Magnevents
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
