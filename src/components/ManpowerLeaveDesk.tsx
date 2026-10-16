import React, { useState } from 'react';
import {
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Clock,
  ShieldAlert,
  UserCheck,
  Check,
  X,
} from 'lucide-react';
import { Employee, LeaveRequest } from '../types';

interface ManpowerLeaveDeskProps {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  onApproveLeave: (id: string, notes?: string) => void;
  onRejectLeave: (id: string, notes?: string) => void;
  onAddLeaveRequest: (request: LeaveRequest) => void;
}

export const ManpowerLeaveDesk: React.FC<ManpowerLeaveDeskProps> = ({
  employees,
  leaveRequests,
  onApproveLeave,
  onRejectLeave,
  onAddLeaveRequest,
}) => {
  const [activeFilter, setActiveFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Leave Form
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [leaveType, setLeaveType] = useState<'annual' | 'sick' | 'unpaid' | 'parental'>('annual');
  const [startDate, setStartDate] = useState('2026-10-25');
  const [endDate, setEndDate] = useState('2026-10-28');
  const [reason, setReason] = useState('');

  const filteredRequests = leaveRequests.filter((req) => {
    if (activeFilter === 'all') return true;
    return req.status === activeFilter;
  });

  const pendingCount = leaveRequests.filter((r) => r.status === 'pending').length;
  const overlapRisksCount = leaveRequests.filter((r) => r.status === 'pending' && r.overlapRisk).length;

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (!emp) return;

    // Check overlap with pending or approved leaves in same department
    const overlaps = leaveRequests.filter(
      (r) =>
        r.department === emp.department &&
        r.status !== 'rejected' &&
        r.id !== 'temp' &&
        !(r.endDate < startDate || r.startDate > endDate)
    );

    const overlapMsg =
      overlaps.length > 0
        ? `Potential Overlap: ${overlaps.map((o) => o.employeeName).join(', ')} (${emp.department}) is also out.`
        : undefined;

    const newReq: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      leaveType: leaveType,
      startDate: startDate,
      endDate: endDate,
      totalDays: 3,
      reason: reason.trim() || 'Scheduled absence',
      status: 'pending',
      overlapRisk: overlapMsg,
    };

    onAddLeaveRequest(newReq);
    setIsSubmitModalOpen(false);
    setReason('');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
            Whiteboard Focus 5: Manpower Leave Management
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-amber-950">
            Manpower Roster & Team Leave Coverage
          </h2>
          <p className="text-sm text-amber-900/80 mt-0.5">
            Coordinate employee leave requests, manage entitlement balances, and prevent department coverage bottlenecks.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-xl border border-amber-500/50 transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Leave Application</span>
        </button>
      </div>

      {/* Coverage Warning Banner */}
      {overlapRisksCount > 0 && (
        <div className="bg-amber-100/70 border border-amber-300/80 rounded-2xl p-4 flex items-start gap-3.5 shadow-2xs">
          <ShieldAlert className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-amber-950 text-sm">
              Staffing Coverage Overlap Detected (Engineering Department)
            </h4>
            <p className="text-amber-900/90 leading-relaxed">
              Marcus Vance and Chloe Tan both have overlapping annual leave pending between October 22 and October 26.
              Approving both requests will leave only 1 backend engineer on call during planned production release.
            </p>
          </div>
        </div>
      )}

      {/* Leave Requests Management */}
      <div className="bg-[#fffef9] rounded-2xl border border-amber-200/90 overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-5 border-b border-amber-200/70 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider">
              Leave Requests & Approval Queue
            </h3>
            <p className="text-xs text-amber-800/80">
              {pendingCount} applications awaiting executive operations review
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-amber-100/70 rounded-lg text-xs font-medium">
            {[
              { id: 'pending', label: 'Pending Approval' },
              { id: 'approved', label: 'Approved' },
              { id: 'all', label: 'All Requests' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-amber-400 text-amber-950 font-bold shadow-xs'
                    : 'text-amber-900 hover:text-amber-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="divide-y divide-slate-100">
          {filteredRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No leave requests found in this view.
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900">{req.employeeName}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-medium text-slate-600">{req.department}</span>
                    <span className="text-slate-400">·</span>
                    <span className="capitalize font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {req.leaveType} Leave
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="font-mono tabular-nums text-slate-500">{req.totalDays} Days</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono tabular-nums font-semibold text-slate-800">
                      {req.startDate} to {req.endDate}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span>Reason: {req.reason}</span>
                  </div>

                  {req.overlapRisk && req.status === 'pending' && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-medium bg-amber-50/80 p-1.5 rounded border border-amber-200/60">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{req.overlapRisk}</span>
                    </div>
                  )}

                  {req.reviewNotes && (
                    <div className="text-[11px] text-slate-500">
                      Review note: {req.reviewNotes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {req.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => onRejectLeave(req.id, 'Rescheduled due to team coverage deficit')}
                        className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={() => onApproveLeave(req.id, 'Approved by Operations')}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Approve Leave</span>
                      </button>
                    </>
                  ) : (
                    <span
                      className={`text-xs font-semibold uppercase font-mono ${
                        req.status === 'approved' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Team Roster & Entitlement Balances */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Team Roster & Leave Entitlement Balances
          </h3>
          <p className="text-xs text-slate-500">
            Real-time tracking of statutory annual and medical leave utilization
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Annual Leave Usage</th>
                <th className="py-3 px-4">Remaining Annual</th>
                <th className="py-3 px-4">Medical Leave Usage</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => {
                const annualRemaining = emp.leaveBalance.annualTotal - emp.leaveBalance.annualUsed;
                const annualPercent = (emp.leaveBalance.annualUsed / emp.leaveBalance.annualTotal) * 100;
                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatarUrl}
                          alt={emp.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <div className="text-[11px] text-slate-500">{emp.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {emp.department}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-36 space-y-1">
                        <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-600">
                          <span>{emp.leaveBalance.annualUsed}d used</span>
                          <span>{emp.leaveBalance.annualTotal}d total</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-slate-800 h-full rounded-full"
                            style={{ width: `${annualPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold tabular-nums text-slate-900">
                      {annualRemaining} Days
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600">
                      {emp.leaveBalance.sickUsed} / {emp.leaveBalance.sickTotal} Days
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      Active On Duty
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Leave Application Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Submit Leave Application
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Submit planned time off for manager and operations review
            </p>

            <form onSubmit={handleSubmitLeave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employee</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.role} - {e.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick / Medical Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                  <option value="parental">Parental Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Handover Note</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide reason and backup contact person..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg leading-relaxed text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
