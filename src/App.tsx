import React, { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { ExecutiveProblemRadar } from './components/ExecutiveProblemRadar';
import { InvoicesManager } from './components/InvoicesManager';
import { ARTracker } from './components/ARTracker';
import { RegulationsHub } from './components/RegulationsHub';
import { CustomerServiceDesk } from './components/CustomerServiceDesk';
import { ManpowerLeaveDesk } from './components/ManpowerLeaveDesk';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';
import {
  initialEmployees,
  initialInvoices,
  initialARRecords,
  initialRegulations,
  initialTickets,
  initialLeaveRequests,
  initialProblemMatrix,
} from './data/initialData';
import {
  Invoice,
  ARRecord,
  RegulationItem,
  CustomerTicket,
  Employee,
  LeaveRequest,
  ProblemItem,
  ExecutiveReport,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('radar');

  // Application Data States
  const [problems, setProblems] = useState<ProblemItem[]>(initialProblemMatrix);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [arRecords, setARRecords] = useState<ARRecord[]>(initialARRecords);
  const [regulations, setRegulations] = useState<RegulationItem[]>(initialRegulations);
  const [tickets, setTickets] = useState<CustomerTicket[]>(initialTickets);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);

  // Executive Report State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [executiveReport, setExecutiveReport] = useState<ExecutiveReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Cross-entity handlers
  const handleUpdateProblemStatus = (id: string, status: 'open' | 'in_progress' | 'resolved') => {
    setProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  const handleAddProblem = (newProb: Omit<ProblemItem, 'id' | 'identifiedDate'>) => {
    const item: ProblemItem = {
      ...newProb,
      id: `prob-${Date.now()}`,
      identifiedDate: '2026-10-16',
    };
    setProblems((prev) => [item, ...prev]);
  };

  const handleAddInvoice = (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);

    // If issued right away, create AR record
    if (newInvoice.status === 'issued') {
      const newAR: ARRecord = {
        id: `ar-${Date.now()}`,
        invoiceId: newInvoice.id,
        invoiceNumber: newInvoice.invoiceNumber,
        clientName: newInvoice.clientName,
        contactEmail: newInvoice.clientEmail,
        amount: newInvoice.totalAmount,
        amountPaid: 0,
        dueDate: newInvoice.dueDate,
        daysOverdue: 0,
        agingBucket: 'current',
        status: 'current',
        lastContactDate: newInvoice.issueDate,
        notes: 'Invoice newly issued to client.',
      };
      setARRecords((prev) => [newAR, ...prev]);
    }
  };

  const handleUpdateInvoiceStatus = (id: string, status: 'draft' | 'issued' | 'paid' | 'overdue') => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    );

    // Sync AR
    if (status === 'paid') {
      setARRecords((prev) =>
        prev.map((ar) =>
          ar.invoiceId === id ? { ...ar, status: 'collected', amountPaid: ar.amount } : ar
        )
      );
    }
  };

  const handleUpdateARRecord = (updated: ARRecord) => {
    setARRecords((prev) =>
      prev.map((rec) => (rec.id === updated.id ? updated : rec))
    );
  };

  const handleRecordPayment = (id: string, amount: number) => {
    setARRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === id) {
          const newPaid = rec.amountPaid + amount;
          const isFull = newPaid >= rec.amount;
          if (isFull) {
            // Also mark invoice paid
            setInvoices((invs) =>
              invs.map((inv) =>
                inv.id === rec.invoiceId ? { ...inv, status: 'paid' } : inv
              )
            );
          }
          return {
            ...rec,
            amountPaid: newPaid,
            status: isFull ? 'collected' : 'promised_to_pay',
            notes: isFull ? 'Full settlement received and reconciled.' : `Partial payment of $${amount} received.`,
          };
        }
        return rec;
      })
    );
  };

  const handleUpdateRegulationStatus = (id: string, complianceStatus: RegulationItem['complianceStatus']) => {
    setRegulations((prev) =>
      prev.map((reg) => (reg.id === id ? { ...reg, complianceStatus } : reg))
    );
  };

  const handleAddRegulation = (item: RegulationItem) => {
    setRegulations((prev) => [item, ...prev]);
  };

  const handleAddTicket = (ticket: CustomerTicket) => {
    setTickets((prev) => [ticket, ...prev]);
  };

  const handleUpdateTicket = (updated: CustomerTicket) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
  };

  const handleApproveLeave = (id: string, notes?: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: 'approved',
              reviewedBy: 'Executive Operations',
              reviewNotes: notes || 'Approved',
            }
          : l
      )
    );
  };

  const handleRejectLeave = (id: string, notes?: string) => {
    setLeaveRequests((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: 'rejected',
              reviewedBy: 'Executive Operations',
              reviewNotes: notes || 'Rescheduled',
            }
          : l
      )
    );
  };

  const handleAddLeaveRequest = (request: LeaveRequest) => {
    setLeaveRequests((prev) => [request, ...prev]);
  };

  // Compile Executive Report
  const generateExecutiveReport = async () => {
    setIsGeneratingReport(true);
    setIsReportModalOpen(true);
    try {
      const statsPayload = {
        totalInvoiced: invoices.filter((i) => i.status !== 'draft').reduce((s, i) => s + i.totalAmount, 0),
        draftInvoicesCount: invoices.filter((i) => i.status === 'draft').length,
        totalAROutstanding: arRecords.filter((r) => r.status !== 'collected').reduce((s, r) => s + (r.amount - r.amountPaid), 0),
        overdueARAmount: arRecords.filter((r) => r.daysOverdue > 0 && r.status !== 'collected').reduce((s, r) => s + (r.amount - r.amountPaid), 0),
        openTicketsCount: tickets.filter((t) => t.status === 'open').length,
        urgentTicketsCount: tickets.filter((t) => t.priority === 'urgent' && t.status !== 'resolved').length,
        upcomingRegulationsCount: regulations.filter((r) => r.complianceStatus !== 'compliant').length,
        pendingLeavesCount: leaveRequests.filter((l) => l.status === 'pending').length,
      };

      const res = await fetch('/api/executive-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problems: problems.filter((p) => p.status !== 'resolved'),
          stats: statsPayload,
        }),
      });
      const data = await res.json();
      setExecutiveReport({
        ...data,
        generatedAt: '2026-10-16 10:45 UTC',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Pre-load default report on initial mount so clicking "Report to Me" is instantaneous
  useEffect(() => {
    generateExecutiveReport();
  }, []);

  // Compute live telemetry for radar
  const stats = {
    totalInvoiced: invoices.filter((i) => i.status !== 'draft').reduce((s, i) => s + i.totalAmount, 0),
    draftInvoicesCount: invoices.filter((i) => i.status === 'draft').length,
    totalAROutstanding: arRecords.filter((r) => r.status !== 'collected').reduce((s, r) => s + (r.amount - r.amountPaid), 0),
    overdueARAmount: arRecords.filter((r) => r.daysOverdue > 15 && r.status !== 'collected').reduce((s, r) => s + (r.amount - r.amountPaid), 0),
    urgentTicketsCount: tickets.filter((t) => t.priority === 'urgent' && t.status !== 'resolved').length,
    upcomingRegulationsCount: regulations.filter((r) => r.complianceStatus !== 'compliant').length,
    pendingLeavesCount: leaveRequests.filter((l) => l.status === 'pending').length,
    coverageRisksCount: leaveRequests.filter((l) => l.status === 'pending' && l.overlapRisk).length,
  };

  const unresolvedProblemsCount = problems.filter((p) => p.status !== 'resolved').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Universal Top Nav */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReport={() => {
          if (!executiveReport) {
            generateExecutiveReport();
          } else {
            setIsReportModalOpen(true);
          }
        }}
        isGeneratingReport={isGeneratingReport}
        unresolvedProblemsCount={unresolvedProblemsCount}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'radar' && (
          <ExecutiveProblemRadar
            problems={problems}
            onUpdateProblemStatus={handleUpdateProblemStatus}
            onAddProblem={handleAddProblem}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenReportModal={() => {
              if (!executiveReport) {
                generateExecutiveReport();
              } else {
                setIsReportModalOpen(true);
              }
            }}
            stats={stats}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesManager
            invoices={invoices}
            onAddInvoice={handleAddInvoice}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
          />
        )}

        {activeTab === 'ar' && (
          <ARTracker
            records={arRecords}
            onUpdateRecord={handleUpdateARRecord}
            onRecordPayment={handleRecordPayment}
          />
        )}

        {activeTab === 'regulations' && (
          <RegulationsHub
            regulations={regulations}
            onUpdateStatus={handleUpdateRegulationStatus}
            onAddRegulation={handleAddRegulation}
          />
        )}

        {activeTab === 'customerService' && (
          <CustomerServiceDesk
            tickets={tickets}
            onAddTicket={handleAddTicket}
            onUpdateTicket={handleUpdateTicket}
          />
        )}

        {activeTab === 'manpower' && (
          <ManpowerLeaveDesk
            employees={employees}
            leaveRequests={leaveRequests}
            onApproveLeave={handleApproveLeave}
            onRejectLeave={handleRejectLeave}
            onAddLeaveRequest={handleAddLeaveRequest}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">CentraOps</span>
            <span>·</span>
            <span>Centralized Executive Problem & Operations Management System</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>5 Problems Tracked</span>
            <span>·</span>
            <span>AI Executive Briefing Engine</span>
            <span>·</span>
            <span>Confidential & Internal</span>
          </div>
        </div>
      </footer>

      {/* Centralized Executive Report Modal */}
      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={executiveReport}
        isLoading={isGeneratingReport}
        onRefresh={generateExecutiveReport}
      />
    </div>
  );
}
