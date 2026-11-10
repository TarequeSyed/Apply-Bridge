import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  User, 
  Mail, 
  Check, 
  Sparkles, 
  Download, 
  ExternalLink 
} from 'lucide-react';
import type { Application } from '../types';
import { triggerConfetti } from '../utils/confetti';

interface InterviewSchedulerModalProps {
  application: Application | null;
  onClose: () => void;
  onBookingConfirmed: (appId: string, interviewDetails: { date: string; time: string; notes: string }) => void;
}

const availableDays = [
  { label: 'Tomorrow, Wed Nov 12', dateStr: '2026-11-12' },
  { label: 'Thursday, Nov 13', dateStr: '2026-11-13' },
  { label: 'Friday, Nov 14', dateStr: '2026-11-14' },
  { label: 'Monday, Nov 17', dateStr: '2026-11-17' },
];

const availableTimes = [
  '10:00 AM - 10:45 AM EST',
  '11:30 AM - 12:15 PM EST',
  '01:30 PM - 02:15 PM EST',
  '03:00 PM - 03:45 PM EST',
  '04:30 PM - 05:15 PM EST',
];

export const InterviewSchedulerModal: React.FC<InterviewSchedulerModalProps> = ({
  application,
  onClose,
  onBookingConfirmed,
}) => {
  const [selectedDay, setSelectedDay] = useState(availableDays[0].dateStr);
  const [selectedTime, setSelectedTime] = useState(availableTimes[2]);
  const [candidateNotes, setCandidateNotes] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!application) return null;

  const recruiterEmail = application.recruiterEmails[0] || 'recruiter@' + application.company.toLowerCase() + '.com';
  const recruiterName = recruiterEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());

  const handleConfirm = () => {
    setIsConfirmed(true);
    triggerConfetti();

    onBookingConfirmed(application.id, {
      date: selectedDay,
      time: selectedTime,
      notes: candidateNotes,
    });
  };

  // Generate .ics calendar file download
  const handleDownloadIcs = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ApplyBridge//Interview Scheduler//EN
BEGIN:VEVENT
SUMMARY:${application.company} — Technical System Design Interview
DESCRIPTION:Technical Interview for ${application.role} at ${application.company} with ${recruiterName}.\\nCandidate Notes: ${candidateNotes || 'None'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${application.company}-Interview.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `${application.company} — Technical Interview (${application.role})`
  )}&details=${encodeURIComponent(
    `Interview with ${recruiterName} (${recruiterEmail}).\nScheduled via ApplyBridge.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shadow-xs">
              {application.company.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {isConfirmed ? 'Interview Scheduled!' : `Book Interview with ${application.company}`}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {application.role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isConfirmed ? (
          <div className="p-6 space-y-5">
            
            {/* Recruiter info banner */}
            <div className="p-4 rounded-2xl bg-lime-50/70 border border-lime-200/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-lime-700" />
                <span className="font-bold text-slate-900">Host: {recruiterName}</span>
                <span className="text-slate-500 flex items-center gap-1 font-medium">
                  <Mail className="w-3 h-3 text-slate-400" /> {recruiterEmail}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-white border border-lime-200 text-lime-800 font-bold text-[11px] flex items-center gap-1">
                <Video className="w-3 h-3 text-lime-600" /> 45 min
              </span>
            </div>

            {/* Select Day */}
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Select Available Date</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {availableDays.map((day) => (
                  <button
                    key={day.dateStr}
                    type="button"
                    onClick={() => setSelectedDay(day.dateStr)}
                    className={`p-3 rounded-2xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                      selectedDay === day.dateStr
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Time Slot */}
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Select Time Slot</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableTimes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTime(t)}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-medium border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedTime === t
                        ? 'bg-lime-50 text-lime-900 border-lime-400 ring-1 ring-lime-400'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{t}</span>
                    {selectedTime === t && <Check className="w-4 h-4 text-lime-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate Notes */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Notes for Recruiter (Optional)
              </label>
              <input
                type="text"
                value={candidateNotes}
                onChange={(e) => setCandidateNotes(e.target.value)}
                placeholder="e.g. Prefer TypeScript pairing, available earlier if needed..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 font-medium"
              />
            </div>

            {/* CTA */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="py-2.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/10 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                <span>Confirm & Lock Interview Slot</span>
              </button>
            </div>

          </div>
        ) : (
          /* Confirmed View */
          <div className="p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-3xl bg-lime-100 text-lime-700 flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900">Slot Confirmed & Synchronized!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Your 45-min technical session with {application.company} is booked for <strong className="text-slate-800">{selectedDay}</strong> at <strong className="text-slate-800">{selectedTime}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 max-w-md mx-auto text-xs text-left space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span className="font-semibold">Company:</span>
                <span className="font-bold text-slate-900">{application.company}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-semibold">Recruiter:</span>
                <span>{recruiterEmail}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-semibold">Status:</span>
                <span className="text-lime-700 font-bold">Interview Scheduled</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={googleCalUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <span>Add to Google Calendar</span>
                <ExternalLink className="w-3.5 h-3.5 text-lime-400" />
              </a>

              <button
                type="button"
                onClick={handleDownloadIcs}
                className="py-2.5 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download .ics file</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

