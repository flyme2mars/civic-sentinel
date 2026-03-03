export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'pending' | 'in-progress' | 'resolved' | 'escalated' | 'critical' | 'verified';

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: Status;
  priority: Priority;
  ward: string;
  zone: string;
  address: string;
  citizen: string;
  phone: string;
  reportedAt: number; // timestamp
  deadline: number;   // timestamp
  isEscalated: boolean;
  slaHours: number;
  aiConfidence: number;
  imageUrl?: string;
  fixedImageUrl?: string;
  assignee?: string;
  verifiedAt?: number;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  grievances: number;
  resolved: number;
  sla: number;
  active: number;
}
