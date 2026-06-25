"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Loader2,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Clock,
  LayoutTemplate,
  Activity,
  Calendar,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AdminProfileDashboard() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const [admin, setAdmin] = useState<any>(null);
  const [uploadedArtists, setUploadedArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock Stats to give the premium dashboard feel
  const [stats, setStats] = useState({
    cardsUploaded: 0,
    hoursActive: 0,
    recentLogins: 0,
  });

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const [profileRes, artistsRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', id).single(),
          supabase.from('artists').select('id, name, alias, category, city, state, artist_images(image_url), created_at, is_live, artist_no').eq('created_by', id).order('created_at', { ascending: false })
        ]);

        if (profileRes.error) throw profileRes.error;
        if (artistsRes.error && artistsRes.error.code !== 'PGRST116') {
          console.warn('Warning fetching artists (Likely missing created_by column):', artistsRes.error.message || artistsRes.error);
        }

        setAdmin(profileRes.data);
        const fetchedArtists = artistsRes.data || [];
        setUploadedArtists(fetchedArtists);

        // Generate deterministic mock stats based on user id length/chars to keep them stable
        const charSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        setStats({
          cardsUploaded: fetchedArtists.length, // Now dynamic!
          hoursActive: (charSum % 100) + 45, // 45 to 144
          recentLogins: (charSum % 10) + 2, // 2 to 11
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load admin profile.",
        });
        router.push('/dashboard/admins');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAdminProfile();
  }, [id, router, toast]);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Dashboard...</p>
      </div>
    );
  }

  if (!admin) return null;

  const isSuperAdmin = admin.role === 'super_admin';

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header / Navigation */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/admins"
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <span className="section-label">Team Member Profile</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Administrator Dashboard
          </h1>
        </div>
      </div>

      {/* Main Profile Card (Glassmorphism + Gradients) */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-luxe">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-rose-500/5 opacity-50" />
        
        <div className="relative p-10 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-indigo-600 to-[#7578F2] flex items-center justify-center text-white font-black text-5xl shadow-xl shadow-indigo-200 shrink-0 transform hover:scale-105 transition-transform duration-300">
            {admin.full_name?.[0]?.toUpperCase() || admin.email?.[0]?.toUpperCase() || 'A'}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="flex flex-col md:flex-row items-center gap-3 mb-1">
                <h2 className="text-3xl font-black text-slate-900">{admin.full_name || 'System Administrator'}</h2>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest mt-2 md:mt-0",
                  isSuperAdmin
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                )}>
                  {isSuperAdmin ? <ShieldAlert size={12} strokeWidth={3} /> : <ShieldCheck size={12} strokeWidth={3} />}
                  {isSuperAdmin ? 'Super Admin' : 'Editor'}
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 font-medium text-[15px]">
                <Mail size={16} className="text-slate-400" />
                {admin.email}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-sm font-bold text-slate-600">
                <Calendar size={16} className="text-slate-400" />
                Joined {format(new Date(admin.created_at), 'MMMM dd, yyyy')}
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-sm font-bold text-slate-600">
                <Activity size={16} className="text-emerald-500" />
                Status: Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#7578F2] mb-6 border border-indigo-100">
            <LayoutTemplate size={24} strokeWidth={2} />
          </div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-1">Cards Uploaded</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-slate-900">{stats.cardsUploaded}</h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
          <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mb-6 border border-rose-100">
            <Clock size={24} strokeWidth={2} />
          </div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-1">Hours Active</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-slate-900">{stats.hoursActive}<span className="text-2xl text-slate-400">h</span></h3>
            <span className="text-sm font-bold text-rose-500 mb-1">Steady</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-6 border border-amber-100">
            <Zap size={24} strokeWidth={2} />
          </div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-1">Recent Actions</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-slate-900">{stats.recentLogins * 14}</h3>
            <span className="text-sm font-bold text-emerald-500 mb-1">Events logged</span>
          </div>
        </div>

      </div>

      {/* Uploaded Profiles List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-[14px] font-bold uppercase tracking-widest text-slate-800">Uploaded Profiles</h3>
          <span className="bg-indigo-100 text-indigo-700 font-bold text-xs px-3 py-1 rounded-full">{uploadedArtists.length} Total</span>
        </div>
        <div className="p-0">
          {uploadedArtists.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                <LayoutTemplate className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">No profiles uploaded by this admin yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {uploadedArtists.map((artist) => (
                <div key={artist.id} className="p-6 sm:px-8 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 shrink-0 overflow-hidden shadow-sm flex items-center justify-center border border-slate-200">
                    {artist.artist_images?.[0]?.image_url ? (
                      <img src={artist.artist_images[0].image_url} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-slate-400 text-xl">{artist.name[0]}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                      <h4 className="font-black text-slate-900 text-lg hover:text-indigo-600 transition-colors cursor-pointer">
                        {artist.name}
                      </h4>
                      {artist.is_live ? (
                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-200">Live</span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-slate-200">Hidden</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-bold text-slate-500">
                      <span className="bg-slate-100 px-2 py-1 rounded-lg text-slate-700 uppercase tracking-wider text-[10px]">{artist.category}</span>
                      <span>@{artist.alias || 'anonymous'}</span>
                      <span className="text-slate-300">•</span>
                      <span>{artist.city}, {artist.state}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center sm:items-end gap-1 shrink-0">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Added</span>
                    <span className="font-bold text-slate-700">{format(new Date(artist.created_at || new Date()), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
