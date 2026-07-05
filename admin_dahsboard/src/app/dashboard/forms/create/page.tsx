"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, GripVertical, CheckCircle2, ArrowLeft, Loader2, GripHorizontal } from 'lucide-react';

export default function CreateFormPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const addField = () => {
    setFields([
      ...fields,
      {
        id: Math.random().toString(36).substr(2, 9),
        field_type: 'text',
        label: '',
        placeholder: '',
        is_required: false,
        options: '', // Comma separated for UI, array for DB
      }
    ]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, key: string, value: any) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;
    
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newFields[index];
    newFields[index] = newFields[targetIndex];
    newFields[targetIndex] = temp;
    setFields(newFields);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Form title is required' });
      return;
    }
    if (fields.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Add at least one field' });
      return;
    }
    
    // Validate fields
    for (const f of fields) {
      if (!f.label.trim()) {
        toast({ variant: 'destructive', title: 'Error', description: 'All fields must have a label' });
        return;
      }
    }

    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      // 1. Create form
      const { data: formData, error: formError } = await supabase
        .from('custom_forms')
        .insert([{ 
          title, 
          description,
          created_by: userId || null 
        }])
        .select()
        .single();

      if (formError) throw formError;

      // 2. Create fields
      const dbFields = fields.map((f, i) => ({
        form_id: formData.id,
        field_type: f.field_type,
        label: f.label,
        placeholder: f.placeholder,
        is_required: f.is_required,
        options: f.field_type === 'select' || f.field_type === 'radio' ? JSON.stringify(f.options.split(',').map((o: string) => o.trim()).filter(Boolean)) : null,
        order_index: i
      }));

      const { error: fieldsError } = await supabase
        .from('custom_form_fields')
        .insert(dbFields);

      if (fieldsError) throw fieldsError;

      toast({ title: 'Success', description: 'Form created successfully!' });
      router.push('/dashboard/forms');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to save form' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.push('/dashboard/forms')}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Form</h1>
          <p className="text-sm font-medium text-slate-500">Design a custom form to collect information from clients.</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Form Title</label>
          <input 
            type="text" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Wedding Requirements Form"
            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner" 
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Description (Optional)</label>
          <textarea 
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Provide some context for the client filling out this form..."
            rows={3}
            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner resize-none" 
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">Form Fields</h2>
          <button 
            onClick={addField}
            className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Add Field
          </button>
        </div>

        {fields.length === 0 ? (
          <div className="py-16 bg-slate-50 rounded-[32px] border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500">
            <CheckCircle2 size={40} className="mb-4 text-slate-300" strokeWidth={1} />
            <p className="font-bold text-slate-700 mb-1">Your form is empty</p>
            <p className="text-sm">Add fields to start building your form.</p>
          </div>
        ) : (
          fields.map((field, index) => (
            <div key={field.id} className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm flex gap-4 group">
              <div className="flex flex-col gap-1 pt-2">
                <button onClick={() => moveField(index, 'up')} disabled={index === 0} className="p-1 text-slate-300 hover:text-indigo-600 disabled:opacity-30"><GripHorizontal size={20} className="rotate-90" /></button>
                <button onClick={() => moveField(index, 'down')} disabled={index === fields.length - 1} className="p-1 text-slate-300 hover:text-indigo-600 disabled:opacity-30"><GripHorizontal size={20} className="rotate-90" /></button>
              </div>
              
              <div className="flex-grow space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Question Label</label>
                    <input 
                      type="text" 
                      value={field.label}
                      onChange={e => updateField(field.id, 'label', e.target.value)}
                      placeholder="e.g. What is your event date?"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Field Type</label>
                    <select 
                      value={field.field_type}
                      onChange={e => updateField(field.id, 'field_type', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all"
                    >
                      <option value="text">Short Text</option>
                      <option value="textarea">Long Text</option>
                      <option value="email">Email Address</option>
                      <option value="date">Date Picker</option>
                      <option value="select">Dropdown Menu</option>
                      <option value="checkbox">Checkbox (Yes/No)</option>
                    </select>
                  </div>
                </div>

                {(field.field_type === 'text' || field.field_type === 'textarea' || field.field_type === 'email') && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Placeholder Text</label>
                    <input 
                      type="text" 
                      value={field.placeholder || ''}
                      onChange={e => updateField(field.id, 'placeholder', e.target.value)}
                      placeholder="e.g. Enter your details here..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 transition-all" 
                    />
                  </div>
                )}

                {field.field_type === 'select' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Dropdown Options (Comma separated)</label>
                    <input 
                      type="text" 
                      value={field.options || ''}
                      onChange={e => updateField(field.id, 'options', e.target.value)}
                      placeholder="e.g. Option 1, Option 2, Option 3"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 transition-all" 
                    />
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={field.is_required}
                      onChange={e => updateField(field.id, 'is_required', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Required Field</span>
                  </label>
                  
                  <button 
                    onClick={() => removeField(field.id)}
                    className="text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 p-2 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end pt-8">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-14 rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-3 disabled:opacity-50"
        >
          {saving ? <><Loader2 size={20} className="animate-spin" /> Saving Form...</> : <><Save size={20} /> Save Form & Publish</>}
        </button>
      </div>
    </div>
  );
}
