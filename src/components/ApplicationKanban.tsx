import React from 'react';
import type { Application, ApplicationStatus } from '../types';
import { 
  Mail, 
  Calendar, 
  Flame, 
  Ghost, 
  ChevronRight,
  Plus
} from 'lucide-react';
import { triggerConfetti } from '../utils/confetti';

interface ApplicationKanbanProps {
  applications: Application[];
  onOpenApplication: (app: Application) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onNewApplication: () => void;
  onBookInterview?: (app: Application) => void;
}

interface ColumnDef {
  id: ApplicationStatus;
  title: string;
  badgeClass: string;
  dotColor: string;
}

const columns: ColumnDef[] = [
  { id: 'applied', title: 'Applied', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200', dotColor: 'bg-slate-400' },
  { id: 'screening', title: 'Screening & Tasks', badgeClass: 'bg-amber-100/80 text-amber-900 border-amber-200', dotColor: 'bg-amber-500' },
  { id: 'interview', title: 'Interviewing', badgeClass: 'bg-lime-100/80 text-lime-900 border-lime-200', dotColor: 'bg-lime-500' },
  { id: 'offer', title: 'Offer Received 🎉', badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300', dotColor: 'bg-emerald-500' },
  { id: 'rejected', title: 'Archived', badgeClass: 'bg-slate-100 text-slate-500 border-slate-200', dotColor: 'bg-slate-300' },
];

export const ApplicationKanban: React.FC<ApplicationKanbanProps> = ({
  applications,
  onOpenApplication,
  onUpdateStatus,
  onNewApplication,
  onBookInterview,
}) => {

  const handleStatusChange = (appId: string, currentStatus: ApplicationStatus, nextStatus: ApplicationStatus) => {
    if (nextStatus === currentStatus) return;
    if (nextStatus === 'offer') {
      triggerConfetti();
    }
    onUpdateStatus(appId, nextStatus);
  };

  // Safe date formatter (e.g. "Nov 4, 2026")
  const formatDate = (dateString: string) => {
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Board Header Actions with Breathing Room */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Application Pipeline</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track active opportunities centered on monitored recruiter email addresses.
          </p>
        </div>

        <button
          onClick={onNewApplication}
          className="px-5 py-2.5 rounded-2xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 shadow-md shadow-slate-900/10 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4 text-lime-400" />
          <span>Add Opportunity</span>
        </button>
      </div>

      {/* Responsive Grid: Strictly vertical flow, NO horizontal scroll. Extra columns wrap to bottom */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 pb-8 pt-2 items-start">
        {columns.map((col) => {
          const colApps = applications.filter((app) => app.status === col.id);

          return (
            <div
              key={col.id}
              className="w-full bg-slate-100/60 rounded-3xl border border-slate-200/70 p-4 flex flex-col min-h-[420px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-200/60 px-1">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`}></span>
                  <h3 className="text-xs font-bold text-slate-800 tracking-tight">{col.title}</h3>
                </div>

                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${col.badgeClass}`}>
                  {colApps.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-4 flex-1">
                {colApps.length === 0 ? (
                  <div className="h-44 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-4">
                    <span className="text-xs text-slate-400 font-medium">No cards in this stage</span>
                  </div>
                ) : (
                  colApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => onOpenApplication(app)}
                      className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(15,23,42,0.03)] hover:shadow-[0_18px_36px_-8px_rgba(15,23,42,0.12),0_6px_14px_-2px_rgba(15,23,42,0.05)] hover:-translate-y-1.5 hover:scale-[1.018] hover:border-slate-300 transition-all duration-300 ease-out cursor-pointer text-left group relative"
                    >
                      {/* Top Header: Company Avatar & Status Dropdown */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-xs">
                            {app.company.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                              {app.company}
                            </h4>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {app.location || 'Remote'}
                            </span>
                          </div>
                        </div>

                        {/* Stage Selector */}
                        <select
                          value={app.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(app.id, app.status, e.target.value as ApplicationStatus)}
                          className="bg-slate-50 text-[10px] text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl px-2.5 py-1 focus:outline-none focus:border-slate-400 font-semibold cursor-pointer transition-colors"
                        >
                          <option value="applied">Applied</option>
                          <option value="screening">Screening</option>
                          <option value="interview">Interview</option>
                          <option value="offer">Offer</option>
                          <option value="rejected">Archived</option>
                        </select>
                      </div>

                      {/* Role Title with proper breathing room */}
                      <p className="text-xs font-semibold text-slate-700 mb-3.5 leading-relaxed">
                        {app.role}
                      </p>

                      {/* Recruiter Email pill */}
                      <div className="mb-3.5 flex items-center justify-between text-xs text-slate-600 font-medium bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-[190px]">
                            {app.recruiterEmails[0] || 'No recruiter email'}
                          </span>
                        </div>
                        {app.recruiterEmails.length > 1 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-bold ml-1 flex-shrink-0">
                            +{app.recruiterEmails.length - 1}
                          </span>
                        )}
                      </div>

                      {/* Action Radar Alert if urgent */}
                      {app.pendingAction && app.pendingAction.urgency !== 'none' && (
                        <div 
                          onClick={(e) => {
                            if (app.pendingAction?.text.toLowerCase().includes('book') || app.pendingAction?.text.toLowerCase().includes('interview') || app.pendingAction?.actionUrl) {
                              e.stopPropagation();
                              if (onBookInterview) onBookInterview(app);
                              else onOpenApplication(app);
                            }
                          }}
                          className="mb-3.5 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start justify-between gap-2 hover:bg-amber-100/70 transition-colors"
                        >
                          <div className="flex items-start gap-2 overflow-hidden">
                            <Flame className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="overflow-hidden">
                              <span className="font-bold block leading-tight text-[11px]">
                                {app.pendingAction.text}
                              </span>
                              {app.pendingAction.deadline && (
                                <span className="text-amber-800 font-semibold text-[10px] block mt-1">
                                  Due: {app.pendingAction.deadline}
                                </span>
                              )}
                            </div>
                          </div>
                          {(app.pendingAction?.text.toLowerCase().includes('book') || app.pendingAction?.text.toLowerCase().includes('interview')) && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-200/80 text-amber-950 flex-shrink-0 mt-0.5">
                              Book Slot
                            </span>
                          )}
                        </div>
                      )}

                      {/* Ghosting Warning */}
                      {app.ghostingRisk === 'high' && (
                        <div className="mb-3.5 p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                          <Ghost className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          <span className="font-medium text-[11px]">{app.daysSinceLastContact ?? 8}d silent — Nudge ready</span>
                        </div>
                      )}

                      {/* Card Footer: Non-breaking date & Clean View Thread link */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="whitespace-nowrap">{formatDate(app.dateApplied)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-800 font-bold text-xs group-hover:text-slate-950 transition-colors">
                          <span>View Thread</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
