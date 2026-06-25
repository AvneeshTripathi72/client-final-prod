"use client";

import { useState } from 'react';
import { 
  Server, 
  Play, 
  Copy, 
  Activity, 
  Database, 
  ShieldAlert, 
  ChevronRight, 
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { JsonViewer } from '@/components/ui/JsonViewer';

const APIS = [
  {
    id: 'get-artists',
    name: 'Get All Artists',
    method: 'GET',
    endpoint: 'https://ecwaqfsjajeidhslybdi.supabase.co/rest/v1/artists?select=id,name,category',
    description: 'Retrieves a list of all verified artists available for booking.',
    authRequired: true,
    status: 'active',
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'}`
    },
    params: {},
    sampleBody: null,
    sampleResponse: {
      "data": [
        { "id": "1", "name": "The Midnight Rockers", "category": "Live Band" },
        { "id": "2", "name": "DJ Snake", "category": "Club DJs" }
      ]
    }
  },
  {
    id: 'get-categories',
    name: 'Get Categories',
    method: 'GET',
    endpoint: 'https://ecwaqfsjajeidhslybdi.supabase.co/rest/v1/service_categories?select=*',
    description: 'Fetches all service categories for the platform.',
    authRequired: true,
    status: 'active',
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'}`
    },
    params: {},
    sampleBody: null,
    sampleResponse: {
      "id": "uuid",
      "title": "Live Band",
      "slug": "live-band"
    }
  },
  {
    id: 'internal-update-user',
    name: 'Update User Profile',
    method: 'POST',
    endpoint: '/api/admin/update-user',
    description: 'Updates an internal admin profile. Requires Super Admin privileges.',
    authRequired: true,
    status: 'active',
    headers: {
      'Content-Type': 'application/json'
    },
    params: {},
    sampleBody: {
      "userId": "uuid",
      "full_name": "New Name",
      "role": "admin"
    },
    sampleResponse: {
      "message": "User updated successfully"
    }
  },
  {
    id: 'admin-delete-user',
    name: 'Delete User',
    method: 'POST',
    endpoint: '/api/admin/delete-user',
    description: 'Deletes a user from Auth and the database. Requires Super Admin privileges.',
    authRequired: true,
    status: 'active',
    headers: { 'Content-Type': 'application/json' },
    params: {},
    sampleBody: { "userId": "uuid" },
    sampleResponse: { "message": "User deleted successfully from both Auth and Database" }
  },
  {
    id: 'admin-upload',
    name: 'Upload File to R2',
    method: 'POST',
    endpoint: '/api/upload',
    description: 'Uploads an image or video file to Cloudflare R2 bucket.',
    authRequired: true,
    status: 'active',
    headers: {},
    params: {},
    sampleBody: null,
    sampleResponse: { "url": "https://pub-your-bucket.r2.dev/talent-track/artists/uuid.jpg" }
  },
  {
    id: 'admin-upload-url',
    name: 'Upload File via URL',
    method: 'POST',
    endpoint: '/api/upload-url',
    description: 'Uploads an image to R2 from a public URL.',
    authRequired: true,
    status: 'active',
    headers: { 'Content-Type': 'application/json' },
    params: {},
    sampleBody: { "url": "https://example.com/image.jpg" },
    sampleResponse: { "url": "https://pub-your-bucket.r2.dev/talent-track/artists/uuid.jpg" }
  },
  {
    id: 'admin-delete-image',
    name: 'Delete File from R2',
    method: 'POST',
    endpoint: '/api/delete-image',
    description: 'Deletes a file from the Cloudflare R2 bucket.',
    authRequired: true,
    status: 'active',
    headers: { 'Content-Type': 'application/json' },
    params: {},
    sampleBody: { "url": "https://pub-your-bucket.r2.dev/talent-track/artists/uuid.jpg" },
    sampleResponse: { "message": "Image deleted successfully" }
  },
  {
    id: 'admin-update-video',
    name: 'Update Service Video',
    method: 'POST',
    endpoint: '/api/update-video',
    description: 'Updates a promotional video for a service category.',
    authRequired: true,
    status: 'active',
    headers: { 'Content-Type': 'application/json' },
    params: {},
    sampleBody: { "id": "video_id", "title": "New Title", "video_url": "url", "category_id": "cat_id" },
    sampleResponse: { "message": "Video updated successfully" }
  },
  {
    id: 'user-contact',
    name: 'Submit Contact/Booking Form',
    method: 'POST',
    endpoint: 'http://localhost:3000/api/contact',
    description: 'Sends an email notification and creates a pending booking request in the database from the client site.',
    authRequired: false,
    status: 'active',
    headers: { 'Content-Type': 'application/json' },
    params: {},
    sampleBody: {
      "type": "booking",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+91 9876543210",
      "eventType": "Wedding",
      "date": "2026-12-01",
      "location": "Mumbai",
      "budget": "5L_plus",
      "message": "Looking for a premium live band.",
      "selectedArtist": null
    },
    sampleResponse: { "success": true, "message": "Request processed successfully!" }
  }
];

export default function ApiDashboard() {
  const [selectedApi, setSelectedApi] = useState<any | null>(null);
  const [isTestPanelOpen, setIsTestPanelOpen] = useState(false);
  
  // Test State
  const [testLoading, setTestLoading] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testStatus, setTestStatus] = useState<number | null>(null);
  const [testTime, setTestTime] = useState<number | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [testHeaders, setTestHeaders] = useState<any>(null);

  const getMethodColor = (method: string) => {
    switch(method) {
      case 'GET': return 'bg-sky-50 text-sky-600 border-sky-200';
      case 'POST': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'PUT': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'DELETE': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const handleRunApiClick = (api: any) => {
    setSelectedApi(api);
    setTestResponse(null);
    setTestStatus(null);
    setTestTime(null);
    setTestError(null);
    setTestHeaders(null);
    setIsTestPanelOpen(true);
  };

  const executeApi = async () => {
    if (!selectedApi) return;
    setTestLoading(true);
    setTestResponse(null);
    setTestError(null);
    const startTime = performance.now();

    try {
      const options: RequestInit = {
        method: selectedApi.method,
        headers: selectedApi.headers || {},
      };

      if (selectedApi.method !== 'GET' && selectedApi.sampleBody) {
        options.body = JSON.stringify(selectedApi.sampleBody);
      }

      const res = await fetch(selectedApi.endpoint, options);
      const endTime = performance.now();
      
      setTestTime(Math.round(endTime - startTime));
      setTestStatus(res.status);

      // Extract headers
      const headersObj: any = {};
      res.headers.forEach((value, key) => {
        headersObj[key] = value;
      });
      setTestHeaders(headersObj);

      const data = await res.json().catch(() => null);
      
      if (!res.ok) {
        throw new Error(data?.error || data?.message || `HTTP Error ${res.status}`);
      }

      setTestResponse(data);
    } catch (err: any) {
      setTestError(err.message);
      setTestResponse({ error: err.message, cause: "Check network tab or endpoint configuration." });
    } finally {
      setTestLoading(false);
    }
  };

  const downloadJson = () => {
    if (!testResponse) return;
    const blob = new Blob([JSON.stringify(testResponse, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response_${selectedApi.id}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="section-header">
        <span className="section-label">Developer Tools</span>
        <h1 className="section-title text-slate-900">
          API Management
        </h1>
        <p className="text-body mt-1 max-w-2xl font-medium">Test, monitor, and manage available backend endpoints.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {APIS.map((api) => (
          <div key={api.id} className="luxe-card p-6 flex flex-col md:flex-row gap-6 items-start hover:shadow-xl transition-shadow duration-300">
            <div className="flex-1 space-y-4 w-full">
              <div className="flex items-center gap-3">
                <span className={cn("px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border shadow-sm", getMethodColor(api.method))}>
                  {api.method}
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{api.name}</h3>
                {api.status === 'active' && (
                  <span className="flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-[13px] font-mono text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Database size={14} className="text-slate-400" />
                <span className="truncate">{api.endpoint}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(api.endpoint)}
                  className="ml-auto p-1 text-slate-400 hover:text-sky-600 transition-colors"
                  title="Copy Endpoint"
                >
                  <Copy size={14} />
                </button>
              </div>

              <p className="text-sm font-medium text-slate-600">{api.description}</p>
              
              <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert size={14} className={api.authRequired ? "text-amber-500" : "text-slate-300"} />
                  Auth: {api.authRequired ? 'Required' : 'None'}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6">
               <button
                 onClick={() => handleRunApiClick(api)}
                 className="flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-[#5B5AF7] hover:bg-[#4338CA] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-sm shadow-indigo-200"
               >
                 <Play size={16} fill="currentColor" />
                 Run API
               </button>
               <button
                 className="flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest transition-all"
                 onClick={() => {
                   setSelectedApi(api);
                   setIsTestPanelOpen(true);
                 }}
               >
                 <Activity size={16} />
                 View Details
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* API Testing Slide-over Panel */}
      {isTestPanelOpen && selectedApi && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsTestPanelOpen(false)} />
          
          <div className="relative w-full max-w-3xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5B5AF7] flex items-center justify-center border border-indigo-100 shadow-sm">
                  <Server size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 leading-tight">API Testing Console</h2>
                  <p className="text-xs font-bold text-slate-500">{selectedApi.name}</p>
                </div>
              </div>
              <button onClick={() => setIsTestPanelOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 bg-white border border-slate-100 rounded-lg shadow-sm transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              
              {/* Request Configuration */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <ChevronRight size={16} className="text-sky-500" /> Request Details
                </h3>
                
                <div className="flex items-center gap-3 p-1 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                  <span className={cn("px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest ml-1", getMethodColor(selectedApi.method))}>
                    {selectedApi.method}
                  </span>
                  <input 
                    type="text" 
                    value={selectedApi.endpoint}
                    readOnly
                    className="flex-1 bg-transparent border-none text-sm font-mono font-medium text-slate-600 focus:ring-0 p-0"
                  />
                </div>

                {selectedApi.sampleBody && (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Request Body (JSON)</p>
                    <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800">
                      <pre className="text-emerald-400 font-mono text-sm overflow-x-auto">
                        {JSON.stringify(selectedApi.sampleBody, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedApi.headers && Object.keys(selectedApi.headers).length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Headers</p>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      {Object.entries(selectedApi.headers).map(([k, v]) => (
                        <div key={k} className="flex gap-4 text-sm font-mono mb-2 last:mb-0">
                          <span className="text-slate-500 min-w-[120px] font-bold">{k}:</span>
                          <span className="text-slate-700 break-all">{typeof v === 'string' && v.startsWith('Bearer') ? 'Bearer ********' : String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex justify-center border-y border-slate-100 py-6">
                <button
                  onClick={executeApi}
                  disabled={testLoading}
                  className="w-full max-w-sm flex items-center justify-center gap-2 h-14 rounded-2xl bg-[#5B5AF7] hover:bg-[#4338CA] text-white font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testLoading ? (
                    <><Loader2 size={18} className="animate-spin" /> Executing...</>
                  ) : (
                    <><Play size={18} fill="currentColor" /> Send Request</>
                  )}
                </button>
              </div>

              {/* Response Section */}
              {testStatus !== null && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <ChevronRight size={16} className="text-emerald-500" /> Response
                    </h3>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="text-slate-400 uppercase tracking-widest">Status:</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest border",
                          testStatus >= 200 && testStatus < 300 ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"
                        )}>
                          {testStatus} {testStatus >= 200 && testStatus < 300 ? 'OK' : 'Error'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="text-slate-400 uppercase tracking-widest">Time:</span>
                        <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{testTime}ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mb-2">
                    <button onClick={downloadJson} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm">
                      <Download size={14} /> Download JSON
                    </button>
                    <button onClick={() => setTestResponse(null)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-rose-200 hover:text-rose-600 text-slate-600 text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm">
                      <XCircle size={14} /> Clear Response
                    </button>
                  </div>

                  <JsonViewer data={testResponse} />
                  
                  {testHeaders && (
                     <div className="mt-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Response Headers</p>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 max-h-40 overflow-y-auto custom-scrollbar">
                           {Object.entries(testHeaders).map(([k, v]) => (
                           <div key={k} className="flex gap-4 text-xs font-mono mb-1.5 last:mb-0">
                              <span className="text-slate-400 min-w-[140px] font-bold truncate" title={k}>{k}:</span>
                              <span className="text-slate-600 break-all">{String(v)}</span>
                           </div>
                           ))}
                        </div>
                     </div>
                  )}

                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
