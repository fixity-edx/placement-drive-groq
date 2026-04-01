import React from "react";
import { BadgeCheck, Clock, XCircle } from "lucide-react";

function Pill({ children, variant="default" }){
  const styles = {
    default: "bg-white/10 text-slate-100 border border-white/10",
    pending: "bg-amber-500/15 text-amber-200 border border-amber-500/30",
    selected: "bg-emerald-500/15 text-emerald-200 border border-emerald-500/30",
    rejected: "bg-rose-500/15 text-rose-200 border border-rose-500/30",
  };
  return <span className={"px-2 py-1 rounded-full text-xs "+styles[variant]}>{children}</span>
}

export default function StudentCard({ item, isAdmin=false, onUpdateStatus, onRemove }){
  const status = item.status;
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-glass p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-bold">{item.student?.name}</div>
          <div className="text-xs text-slate-400 mt-1">{item.student?.email} • Skills: {(item.skills||[]).join(", ") || "-"}</div>
        </div>
        <Pill variant={status}>{status}</Pill>
      </div>

      <div className="mt-4 text-sm text-slate-200">
        Drive: <span className="font-semibold">{item.driveName}</span>
      </div>

      {item.aiFeedback ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <div className="text-xs text-slate-400">AI Resume Suggestions</div>
          <div className="text-sm mt-1 text-slate-200 whitespace-pre-wrap">{item.aiFeedback}</div>
        </div>
      ) : null}

      {item.aiQuestions?.length ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <div className="text-xs text-slate-400">Mock Interview Questions</div>
          <ul className="text-sm mt-2 space-y-1 list-disc pl-5 text-slate-200">
            {item.aiQuestions.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
        </div>
      ) : null}

      {isAdmin ? (
        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          <button onClick={() => onUpdateStatus?.(item, "selected")} className="px-4 py-2 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 font-semibold text-emerald-100 inline-flex items-center gap-2">
            <BadgeCheck size={16}/> Select
          </button>
          <button onClick={() => onUpdateStatus?.(item, "pending")} className="px-4 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 font-semibold text-amber-100 inline-flex items-center gap-2">
            <Clock size={16}/> Pending
          </button>
          <button onClick={() => onUpdateStatus?.(item, "rejected")} className="px-4 py-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 font-semibold text-rose-100 inline-flex items-center gap-2">
            <XCircle size={16}/> Reject
          </button>
          <button onClick={() => onRemove?.(item)} className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-semibold text-slate-200">
            Remove Entry
          </button>
        </div>
      ) : null}
    </div>
  );
}
