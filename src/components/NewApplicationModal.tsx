import React, { useState } from 'react';
import type { Application, ApplicationStatus } from '../types';
import { X, Building2, Briefcase, MapPin, DollarSign, Mail, Plus } from 'lucide-react';

interface NewApplicationModalProps {
  onClose: () => void;
  onCreate: (app: Application) => void;
}

export const NewApplicationModal: React.FC<NewApplicationModalProps> = ({
  onClose,
  onCreate,
}) => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('Remote / Hybrid');
  const [salary, setSalary] = useState('');
  const [recruiterEmails, setRecruiterEmails] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('applied');
  const [jobDescription, setJobDescription] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    // Parse comma or space separated emails
    const emails = recruiterEmails
      .split(/[,;\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes('@'));

    const newApp: Application = {
      id: `app-${Date.now()}`,
      company: company.trim(),
      role: role.trim(),
      location: location.trim(),
      salary: salary.trim() || undefined,
      dateApplied: new Date().toISOString().split('T')[0],
      status,
      recruiterEmails: emails.length > 0 ? emails : ['recruiting@' + company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'],
      jobDescription: jobDescription.trim() || undefined,
      notes: notes.trim() || undefined,
      tags: ['New Application'],
      lastUpdated: new Date().toISOString(),
      daysSinceLastContact: 0,
      ghostingRisk: 'low',
    };

    onCreate(newApp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4 text-lime-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Create Application Card</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {/* Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  required
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. OpenAI, Notion, Airbnb"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role Title *</label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  required
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Frontend Engineer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Location & Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Remote / San Francisco"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Salary / Compensation</label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $130k - $150k"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Recruiter Emails (Crucial ApplyBridge Field) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Recruiter Email Address(es)
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={recruiterEmails}
                onChange={(e) => setRecruiterEmails(e.target.value)}
                placeholder="recruiting@company.com, jane.recruiter@company.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 font-medium"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Separate multiple emails with commas. You can update this later when a human recruiter replies.
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Current Stage</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-lime-500 font-semibold"
            >
              <option value="applied">Applied</option>
              <option value="screening">Screening / Technical Assessment</option>
              <option value="interview">Interview Loop</option>
              <option value="offer">Offer Received 🎉</option>
              <option value="rejected">Archived</option>
            </select>
          </div>

          {/* Target Job Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Job Description (Optional — enables AI tailoring)
            </label>
            <textarea
              rows={2}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 resize-none font-sans"
            />
          </div>

          {/* Initial Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Initial Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Met recruiter at UC Berkeley career fair..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 resize-none font-sans"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-lime-400" />
              <span>Create Card</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
