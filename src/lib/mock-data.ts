export const GRIEVANCES = [
  { id: "GRV-2024-001", title: "Major pothole on MG Road", description: "Deep pothole near City Mall, caused 2 bike accidents today", category: "roads", status: "critical", priority: "critical", ward: "Ward 12", zone: "Central Zone", address: "MG Road, Near City Mall", citizen: "Rajesh Kumar", phone: "+91 98765 43210", reportedAt: Date.now() - 12 * 3600000, slaHours: 48, elapsedHours: 12, aiConfidence: 0.95, aiSimilar: 23, urgency: 0.92, rtiGenerated: false, hasAfter: false },
  { id: "GRV-2024-002", title: "Broken sewage line flooding street", description: "Sewage burst, waterlogged for 3 days, health hazard for residents", category: "sanitation", status: "in-progress", priority: "high", ward: "Ward 8", zone: "East Zone", address: "Laxmi Nagar, Block C", citizen: "Priya Sharma", phone: "+91 87654 32109", reportedAt: Date.now() - 28 * 3600000, slaHours: 48, elapsedHours: 28, aiConfidence: 0.88, aiSimilar: 15, urgency: 0.85, rtiGenerated: false, hasAfter: false, assignee: "Suresh Patel" },
  { id: "GRV-2024-003", title: "Street lights out for 2 weeks", description: "Complete darkness on main road, safety concern especially for women", category: "electricity", status: "escalated", priority: "high", ward: "Ward 5", zone: "North Zone", address: "Shakti Nagar Main Road", citizen: "Meera Singh", phone: "+91 76543 21098", reportedAt: Date.now() - 72 * 3600000, slaHours: 48, elapsedHours: 72, aiConfidence: 0.92, aiSimilar: 8, urgency: 0.78, rtiGenerated: true, hasAfter: false, assignee: "Amit Verma", socialShared: true, twitterLikes: 234 },
  { id: "GRV-2024-004", title: "Garbage dump not cleared", description: "Month-old pile attracting stray animals, severe smell for residents", category: "waste", status: "resolved", priority: "medium", ward: "Ward 3", zone: "South Zone", address: "Green Park, Sector B", citizen: "Anil Gupta", phone: "+91 65432 10987", reportedAt: Date.now() - 48 * 3600000, slaHours: 48, elapsedHours: 31.5, aiConfidence: 0.96, aiSimilar: 42, urgency: 0.65, rtiGenerated: false, hasAfter: true, score: 95, assignee: "Vikram Singh" },
  { id: "GRV-2024-005", title: "Water pipeline leak", description: "Potable water being wasted, road surface deteriorating rapidly", category: "water", status: "pending", priority: "high", ward: "Ward 7", zone: "West Zone", address: "Model Town, Near Water Tank", citizen: "Sunita Yadav", phone: "+91 54321 09876", reportedAt: Date.now() - 6 * 3600000, slaHours: 48, elapsedHours: 6, aiConfidence: 0.91, aiSimilar: 18, urgency: 0.88, rtiGenerated: false, hasAfter: false },
  { id: "GRV-2024-006", title: "Broken footpath tiles", description: "Cracked tiles causing falls, elderly residents at risk near market", category: "infrastructure", status: "pending", priority: "medium", ward: "Ward 14", zone: "Central Zone", address: "Andheri Market Road", citizen: "Kavita Mehta", phone: "+91 43210 98765", reportedAt: Date.now() - 3 * 3600000, slaHours: 48, elapsedHours: 3, aiConfidence: 0.89, aiSimilar: 11, urgency: 0.72, rtiGenerated: false, hasAfter: false },
];

export const DEPARTMENTS = [
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
};

export const PRIORITY_MAP = {
  critical: { light: "#DC2626", dark: "#EF4444" },
  high:     { light: "#EA580C", dark: "#F97316" },
  medium:   { light: "#D97706", dark: "#FBBF24" },
  low:      { light: "#16A34A", dark: "#4ADE80" },
};

export const CAT_ICONS = { roads: "⬡", sanitation: "◈", water: "◎", electricity: "◉", waste: "◆", infrastructure: "◫", other: "○" };

export type GrievanceType = typeof GRIEVANCES[0];
