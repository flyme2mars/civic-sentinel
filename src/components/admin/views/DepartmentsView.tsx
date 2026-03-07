/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ScoreRing } from '../Atoms';
import { DEPARTMENTS } from '@/lib/departments';
import { Building2, Info } from 'lucide-react';

export function DepartmentsView({ surface, border, textSecondary, textPrimary, grievances }: any) {
  return (
    <div style={{ animation: "fadeSlideUp 0.3s ease" }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Departmental Branches</h2>
      
      {/* Demo Notice */}
      <div style={{ 
        background: "rgba(15, 23, 42, 0.02)", 
        border: `1px solid ${border}`, 
        borderRadius: 12, 
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        maxWidth: "600px",
        marginBottom: 24
      }}>
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <p style={{ fontSize: 11, color: textSecondary, fontWeight: 500, lineHeight: 1.4 }}>
          <span style={{ fontWeight: 700, color: textPrimary }}>Note:</span> For the purpose of this prototype evaluation, we have only included a select number of municipal branches representing the core departments.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {DEPARTMENTS.map((dept, i) => {
          // ... (rest of the map logic remains the same)
          const deptGrievances = (grievances || []).filter((g: any) => g.assignedTo === dept.id);
          const active = deptGrievances.filter((g: any) => ['pending', 'in-progress', 'assigned', 'critical'].includes(g.status)).length;
          const resolved = deptGrievances.filter((g: any) => ['resolved', 'verified', 'closed'].includes(g.status)).length;
          
          // Calculate real SLA performance
          const withSLA = deptGrievances.length;
          const breached = deptGrievances.filter((g: any) => (g.elapsedHours || 0) > (g.slaHours || 48)).length;
          const slaScore = withSLA > 0 ? Math.round(((withSLA - breached) / withSLA) * 100) : 100;

          return (
            <div key={dept.id} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, animation: `fadeSlideUp 0.3s ease ${i * 50}ms both` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>{dept.id}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4, color: textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dept.name}</div>
                  <div style={{ fontSize: 11, color: textSecondary, marginTop: 2 }}>{dept.department}</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-slate-900" />
                </div>
              </div>
              
              <p style={{ fontSize: 12, color: textSecondary, lineHeight: 1.5, marginBottom: 16, height: "3em", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {dept.description}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div style={{ background: "rgba(17,24,39,0.03)", borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace" }}>ACTIVE</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginTop: 4 }}>{active}</div>
                </div>
                <div style={{ background: "rgba(17,24,39,0.03)", borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace" }}>RESOLVED</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginTop: 4 }}>{resolved}</div>
                </div>
              </div>
              <div style={{ borderTop: `1px solid ${border}`, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12, color: textSecondary }}>Performance</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ScoreRing score={slaScore} size={28} />
                  <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: textSecondary }}>SLA</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
