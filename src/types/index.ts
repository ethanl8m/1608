export type ProblemCategory = 'invoicing' | 'ar' | 'regulations' | 'customerService' | 'manpower';

export interface ProblemItem {
  id: string;
  category: ProblemCategory;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  identifiedDate: string;
  assignee: string;
  metricImpact?: string;
  relatedEntityId?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'issued' | 'paid' | 'overdue';
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  notes: string;
}

export interface ARRecord {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  contactEmail: string;
  amount: number;
  amountPaid: number;
  dueDate: string;
  daysOverdue: number;
  agingBucket: 'current' | '1-30' | '31-60' | '60+';
  status: 'current' | 'follow_up_needed' | 'promised_to_pay' | 'disputed' | 'collected';
  lastContactDate: string;
  notes: string;
}

export interface RegulationItem {
  id: string;
  title: string;
  jurisdiction: string;
  category: 'Tax & Corporate' | 'Employment & Labor' | 'Data Protection' | 'Industry Licensing';
  complianceStatus: 'compliant' | 'review_required' | 'action_needed' | 'upcoming_deadline';
  deadlineDate: string;
  riskRating: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  mandatoryRequirements: string[];
  designatedOwner: string;
}

export interface TicketResponse {
  id: string;
  sender: 'agent' | 'customer';
  message: string;
  timestamp: string;
}

export interface CustomerTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  company: string;
  subject: string;
  initialMessage: string;
  status: 'open' | 'in_progress' | 'waiting_on_customer' | 'resolved';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  slaHoursRemaining: number;
  createdAt: string;
  responses: TicketResponse[];
  assignedAgent: string;
  internalNotes: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: 'Engineering' | 'Finance' | 'Customer Support' | 'Operations' | 'Sales';
  avatarUrl: string;
  email: string;
  leaveBalance: {
    annualTotal: number;
    annualUsed: number;
    sickTotal: number;
    sickUsed: number;
  };
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: 'annual' | 'sick' | 'unpaid' | 'parental';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  overlapRisk?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface ExecutiveReport {
  healthScore: number;
  executiveHeadline: string;
  executiveSummary: string;
  criticalRisks: {
    area: string;
    risk: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    impact: string;
    recommendation: string;
  }[];
  immediateActions: {
    priority: 'P1' | 'P2' | 'P3';
    action: string;
    owner: string;
    timeframe: string;
  }[];
  areaBriefs: {
    invoicing: string;
    ar: string;
    regulations: string;
    customerService: string;
    manpower: string;
  };
  generatedAt: string;
}
