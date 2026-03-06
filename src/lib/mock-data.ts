import { CivicIssue, Department } from "./types";

// Static timestamp for consistent SSR/Hydration (March 3, 2026)
const now = 1772496000000; 
const hour = 3600000;

export const GRIEVANCES: CivicIssue[] = [
  { 
    id: "GRV-2024-001", 
    rawId: "7c8b2a1e-1d5b-4c8d-9e2a-3b4c5d6e7f8a",
    title: "Major pothole on MG Road", 
    description: "Deep pothole near City Mall, caused 2 bike accidents today", 
    category: "roads", 
    status: "critical", 
    priority: "critical", 
    ward: "Ward 12", 
    zone: "Central Zone", 
    address: "MG Road, Near City Mall", 
    citizen: "Rajesh Kumar", 
    phone: "+91 98765 43210", 
    reportedAt: now - 12 * hour, 
    deadline: now + 36 * hour,
    slaHours: 48, 
    isEscalated: false,
    aiConfidence: 0.95, 
    imageUrl: "/placeholder-pothole.jpg",
    elapsedHours: 12,
    aiSimilar: 3,
    urgency: 0.9,
    rtiGenerated: false,
    hasAfter: false
  },
  { 
    id: "GRV-2024-002", 
    rawId: "8d9c3b2f-2e6c-5d9e-0f3b-4c5d6e7f8a9b",
    title: "Broken sewage line flooding street", 
    description: "Sewage burst, waterlogged for 3 days, health hazard for residents", 
    category: "sanitation", 
    status: "in-progress", 
    priority: "high", 
    ward: "Ward 8", 
    zone: "East Zone", 
    address: "Laxmi Nagar, Block C", 
    citizen: "Priya Sharma", 
    phone: "+91 87654 32109", 
    reportedAt: now - 28 * hour, 
    deadline: now + 20 * hour,
    slaHours: 48, 
    isEscalated: false,
    aiConfidence: 0.88, 
    assignee: "Suresh Patel",
    elapsedHours: 28,
    aiSimilar: 1,
    urgency: 0.7,
    rtiGenerated: false,
    hasAfter: false
  },
  { 
    id: "GRV-2024-003", 
    rawId: "9e0d4c3a-3f7d-6e0f-1a4c-5d6e7f8a9b0c",
    title: "Street lights out for 2 weeks", 
    description: "Complete darkness on main road, safety concern especially for women", 
    category: "electricity", 
    status: "escalated", 
    priority: "high", 
    ward: "Ward 5", 
    zone: "North Zone", 
    address: "Shakti Nagar Main Road", 
    citizen: "Meera Singh", 
    phone: "+91 76543 21098", 
    reportedAt: now - 72 * hour, 
    deadline: now - 24 * hour, // Breached
    slaHours: 48, 
    isEscalated: true,
    aiConfidence: 0.92, 
    assignee: "Amit Verma",
    elapsedHours: 72,
    aiSimilar: 5,
    urgency: 0.95,
    rtiGenerated: true,
    hasAfter: false
  },
  { 
    id: "GRV-2024-004", 
    rawId: "0f1e5d4b-4a8e-7f1a-2b5d-6e7f8a9b0c1d",
    title: "Garbage dump not cleared", 
    description: "Month-old pile attracting stray animals, severe smell for residents", 
    category: "waste", 
    status: "resolved", 
    priority: "medium", 
    ward: "Ward 3", 
    zone: "South Zone", 
    address: "Green Park, Sector B", 
    citizen: "Anil Gupta", 
    phone: "+91 65432 10987", 
    reportedAt: now - 48 * hour, 
    deadline: now,
    slaHours: 48, 
    isEscalated: false,
    aiConfidence: 0.96, 
    assignee: "Vikram Singh",
    elapsedHours: 48,
    aiSimilar: 0,
    urgency: 0.4,
    rtiGenerated: false,
    hasAfter: true,
    score: 85
  },
  { 
    id: "GRV-2024-005", 
    rawId: "1a2f6e5c-5b9f-8a2b-3c6e-7f8a9b0c1d2e",
    title: "Water pipeline leak", 
    description: "Potable water being wasted, road surface deteriorating rapidly", 
    category: "water", 
    status: "pending", 
    priority: "high", 
    ward: "Ward 7", 
    zone: "West Zone", 
    address: "Model Town, Near Water Tank", 
    citizen: "Sunita Yadav", 
    phone: "+91 54321 09876", 
    reportedAt: now - 6 * hour, 
    deadline: now + 42 * hour,
    slaHours: 48, 
    isEscalated: false,
    aiConfidence: 0.91,
    elapsedHours: 6,
    aiSimilar: 2,
    urgency: 0.6,
    rtiGenerated: false,
    hasAfter: false
  },
  { 
    id: "GRV-2024-006", 
    rawId: "2b3a7f6d-6c0a-9b3c-4d7f-8a9b0c1d2e3f",
    title: "Broken footpath tiles", 
    description: "Cracked tiles causing falls, elderly residents at risk near market", 
    category: "infrastructure", 
    status: "pending", 
    priority: "medium", 
    ward: "Ward 14", 
    zone: "Central Zone", 
    address: "Andheri Market Road", 
    citizen: "Kavita Mehta", 
    phone: "+91 43210 98765", 
    reportedAt: now - 3 * hour, 
    deadline: now + 45 * hour,
    slaHours: 48, 
    isEscalated: false,
    aiConfidence: 0.89,
    elapsedHours: 3,
    aiSimilar: 1,
    urgency: 0.3,
    rtiGenerated: false,
    hasAfter: false
  },
];

export const DEPARTMENTS: Department[] = [
  { id: "DEPT-01", name: "Roads & Infrastructure", head: "Ramesh Sharma", grievances: 420, resolved: 380, sla: 88, active: 40 },
  { id: "DEPT-02", name: "Sanitation & Health", head: "Dr. Priya Menon", grievances: 550, resolved: 490, sla: 82, active: 60 },
  { id: "DEPT-03", name: "Water Works", head: "Er. Rajiv Gupta", grievances: 310, resolved: 295, sla: 92, active: 15 },
  { id: "DEPT-04", name: "Electricity Board", head: "Anil Desai", grievances: 280, resolved: 250, sla: 79, active: 30 },
  { id: "DEPT-05", name: "Solid Waste Mgmt", head: "Vikram Kumar", grievances: 600, resolved: 510, sla: 71, active: 90 },
];


export const WARDS = [
  { id: "W-01", name: "Civil Lines", zone: "Central", councillor: "Mrs. Sharma", issues: 45, critical: 2 },
  { id: "W-02", name: "Sadar Bazaar", zone: "Central", councillor: "Mr. Verma", issues: 78, critical: 5 },
  { id: "W-03", name: "Model Town", zone: "North", councillor: "Mrs. Gupta", issues: 32, critical: 1 },
  { id: "W-04", name: "Defence Colony", zone: "South", councillor: "Col. Singh", issues: 24, critical: 0 },
  { id: "W-05", name: "Laxmi Nagar", zone: "East", councillor: "Mr. Yadav", issues: 110, critical: 12 },
];

export const STATS = { total: 2847, pending: 456, inProgress: 892, resolved: 1243, escalated: 156, slaCompliance: 78.4, avgResolution: 36.5, satisfaction: 4.2, critical: 23, todayNew: 18, todayResolved: 12 };

export const STATUS_MAP = {
  pending:     { label: "Pending",     light: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" }, dark: { bg: "#431407", text: "#FB923C", border: "#7C2D12" } },
  "in-progress":{ label: "In Progress", light: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" }, dark: { bg: "#1E3A5F", text: "#60A5FA", border: "#1E40AF" } },
  resolved:    { label: "Resolved",    light: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" }, dark: { bg: "#052E16", text: "#4ADE80", border: "#166534" } },
  escalated:   { label: "Escalated",   light: { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" }, dark: { bg: "#4C0519", text: "#F87171", border: "#9F1239" } },
  critical:    { label: "Critical",    light: { bg: "#FFF1F2", text: "#9F1239", border: "#FECDD3" }, dark: { bg: "#4C0519", text: "#FB7185", border: "#881337" } },
  verified:    { label: "Verified",    light: { bg: "#FAF5FF", text: "#7E22CE", border: "#E9D5FF" }, dark: { bg: "#3B0764", text: "#C084FC", border: "#6B21A8" } },
  assigned:    { label: "Assigned",    light: { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" }, dark: { bg: "#0C4A6E", text: "#38BDF8", border: "#0EA5E9" } },
  closed:      { label: "Closed",      light: { bg: "#F8FAFC", text: "#475569", border: "#E2E8F0" }, dark: { bg: "#0F172A", text: "#94A3B8", border: "#1E293B" } },
  rejected:    { label: "Rejected",    light: { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" }, dark: { bg: "#450A0A", text: "#F87171", border: "#7F1D1D" } },
};

export const PRIORITY_MAP = {
  critical: { light: "#DC2626", dark: "#EF4444" },
  high:     { light: "#EA580C", dark: "#F97316" },
  medium:   { light: "#D97706", dark: "#FBBF24" },
  low:      { light: "#16A34A", dark: "#4ADE80" },
};

export const CAT_ICONS = { roads: "⬡", sanitation: "◈", water: "◎", electricity: "◉", waste: "◆", infrastructure: "◫", other: "○" };

export type GrievanceType = typeof GRIEVANCES[0];
