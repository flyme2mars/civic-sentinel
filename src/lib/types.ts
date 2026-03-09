export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'pending' | 'in-progress' | 'resolved' | 'escalated' | 'critical' | 'verified' | 'assigned' | 'closed' | 'rejected' | 'fixed' | 'OPEN' | 'ASSIGNED' | 'VERIFIED' | 'RESOLVED' | 'FIXED' | 'CLOSED';

export interface CivicIssue {
  id: string;      
  rawId: string;   
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
  reportedAt: number; 
  deadline: number;   
  isEscalated: boolean;
  slaHours: number;
  aiConfidence: number;
  imageUrl?: string;
  fixedImageUrl?: string;
  fixedImageKeys?: string[];
  fixedImageUrls?: string[];
  evidenceKeys?: string[];
  evidenceUrls?: string[];
  assignee?: string;
  assignedTo?: string; 
  verifiedAt?: number;
  
  elapsedHours?: number;
  aiSimilar?: number;
  urgency?: number;
  rtiGenerated?: boolean;
  hasAfter?: boolean;
  score?: number;
  socialShared?: boolean;
  twitterLikes?: number;
  aiVerificationResult?: {
    verified: boolean;
    status: 'VERIFIED' | 'REJECTED';
    confidence: number;
    reasoning: string;
    resolutionSummary?: string;
  };
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
