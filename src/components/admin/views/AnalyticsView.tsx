/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

export function AnalyticsView({ textSecondary }: any) {
  return (
    <div style={{ animation: "fadeSlideUp 0.3s ease", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Analytics & Insights</h2>
      <p style={{ fontSize: 14, color: textSecondary, maxWidth: 400 }}>Comprehensive charts and performance metrics powered by AWS QuickSight will be available here.</p>
    </div>
  );
}
