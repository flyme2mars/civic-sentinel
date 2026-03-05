export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'pending' | 'in-progress' | 'resolved' | 'escalated' | 'critical' | 'verified';

export interface CivicIssue {
  id: string;      // Display ID (e.g., CIV-21D48F3E)
  rawId: string;   // Database UUID (e.g., 21d48f3e-...)
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
  
  // Extended properties for Admin Dashboard
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
