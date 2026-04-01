import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { clearToken, getUser } from "../lib/auth";
import Button from "../components/Button";
import Input from "../components/Input";
import Textarea from "../components/Textarea";
import Toast from "../components/Toast";
import StudentCard from "../components/StudentCard";
import { LogOut, Plus, Search, Sparkles, Upload, BarChart3, Wand2 } from "lucide-react";

function GlassBG(){
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-indigo-600/30 blur-3xl" />
      <div className="absolute top-40 -right-24 h-[360px] w-[360px] rounded-full bg-fuchsia-600/20 blur-3xl" />
      <div className="absolute -bottom-40 left-1/3 h-[480px] w-[480px] rounded-full bg-cyan-500/20 blur-3xl" />
    </div>
  )
}

function Modal({ open, title, children, onClose }){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-glass overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="text-lg font-semibold">{title}</div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function Dashboard(){
  const user = getUser();
  const isAdmin = user?.role === "admin";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState(null);
  const notify = (title, message="") => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 3200);
  };

  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if(!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(x =>
      (x.student?.name || "").toLowerCase().includes(q) ||
      (x.student?.email || "").toLowerCase().includes(q) ||
      (x.driveName || "").toLowerCase().includes(q) ||
      (x.status || "").toLowerCase().includes(q) ||
      (x.skills || []).join(",").toLowerCase().includes(q)
    );
  }, [items, search]);

  const stats = useMemo(() => {
    const total = items.length;
    const selected = items.filter(x => x.status === "selected").length;
    const rejected = items.filter(x => x.status === "rejected").length;
    const pending = total - selected - rejected;
    return { total, selected, rejected, pending };
  }, [items]);

  const fetchItems = async () => {
    try{
      setLoading(true);
      const res = await api.get(isAdmin ? "/registrations" : "/registrations/my");
      setItems(res.data);
    }catch(err){
      notify("Error", err?.response?.data?.message || err.message);
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const logout = async () => {
    try{ await api.post("/auth/logout", {}); }catch{}
    clearToken();
    window.location.href = "/login";
  };

  // Student register modal
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState({
    driveName: "",
    skills: "",
    notes: "",
  });
  const [resumeFile, setResumeFile] = useState(null);

  const register = async (e) => {
    e.preventDefault();
    try{
      const fd = new FormData();
      fd.append("driveName", form.driveName);
      fd.append("skills", form.skills);
      fd.append("notes", form.notes);
      if(resumeFile) fd.append("resume", resumeFile);

      await api.post("/registrations", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      notify("Registered", "Registration done. AI analysis may be generated.");
      setOpenForm(false);
      setForm({ driveName:"", skills:"", notes:"" });
      setResumeFile(null);
      fetchItems();
    }catch(err){
      notify("Error", err?.response?.data?.message || err.message);
    }
  };

  // Admin actions
  const updateStatus = async (item, status) => {
    try{
      await api.put(`/registrations/${item._id}/status`, { status });
      notify("Updated", "Status updated.");
      fetchItems();
    }catch(err){
      notify("Error", err?.response?.data?.message || err.message);
    }
  };

  const removeEntry = async (item) => {
    if(!confirm("Remove this entry?")) return;
    try{
      await api.delete(`/registrations/${item._id}`);
      notify("Removed", "Entry removed.");
      fetchItems();
    }catch(err){
      notify("Error", err?.response?.data?.message || err.message);
    }
  };

  const generateMock = async (item) => {
    try{
      notify("Generating...", "Groq is creating mock interview questions.");
      await api.post(`/registrations/${item._id}/generate-mock`, {});
      fetchItems();
      notify("Done", "Mock questions generated.");
    }catch(err){
      notify("Error", err?.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen">
      <GlassBG />

      <div className="relative max-w-6xl mx-auto px-4 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-glass p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm text-slate-200">
                <Sparkles size={16} />
                Placement Drive Tracking
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mt-3 tracking-tight">
                Drive Registration + AI Prep
              </h1>
              <p className="text-slate-300 mt-2">
                Logged in as <span className="font-semibold">{user?.name}</span> ({user?.role})
              </p>
            </div>

            <div className="flex gap-2">
              {!isAdmin ? <Button onClick={() => setOpenForm(true)}><Plus size={18}/> Register Drive</Button> : null}
              <Button variant="secondary" onClick={logout}><LogOut size={18}/> Logout</Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, drive, skills, status..."
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/60"
                />
              </div>
            </div>
            {isAdmin ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-300" />
                <span className="text-sm text-slate-200">Total: {stats.total} • Selected: {stats.selected} • Pending: {stats.pending} • Rejected: {stats.rejected}</span>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
                Upload resume to get AI suggestions and questions.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {loading ? <div className="text-slate-300">Loading…</div> : null}
          {filtered.length === 0 ? <div className="text-slate-400">No registrations yet.</div> : null}

          {filtered.map(item => (
            <div key={item._id}>
              <StudentCard
                item={item}
                isAdmin={isAdmin}
                onUpdateStatus={updateStatus}
                onRemove={removeEntry}
              />
              {isAdmin ? (
                <div className="flex justify-end mt-2">
                  <Button variant="secondary" onClick={() => generateMock(item)}><Wand2 size={16}/> Generate Mock Questions</Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="text-center text-xs text-slate-500 mt-10">
          RBAC: Students register. Admin updates status + AI mock interview generator.
        </div>
      </div>

      {/* Register Modal */}
      <Modal open={openForm} title="Register for Placement Drive (Student)" onClose={() => setOpenForm(false)}>
        <form onSubmit={register} className="grid gap-4">
          <Input label="Drive Name" required value={form.driveName} onChange={(e)=>setForm(f=>({...f,driveName:e.target.value}))} placeholder="Infosys Campus Drive" />
          <Input label="Skills (comma separated)" value={form.skills} onChange={(e)=>setForm(f=>({...f,skills:e.target.value}))} placeholder="Java, DSA, DBMS" />
          <Textarea label="Notes (optional)" value={form.notes} onChange={(e)=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Any extra info..." />
          <label className="block">
            <div className="text-sm text-slate-300 mb-2 flex items-center gap-2"><Upload size={16}/> Upload Resume (PDF)</div>
            <input type="file" accept="application/pdf" onChange={(e)=>setResumeFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-300" />
          </label>

          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="secondary" onClick={()=>setOpenForm(false)}>Cancel</Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
