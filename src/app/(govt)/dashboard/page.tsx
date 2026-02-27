import React from 'react';

export default function GovtDashboard() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Govt Dashboard - CivicSentinel</h1>
      <p>Monitoring SLA Doomsday Clock and Pending Grievances.</p>
      
      <section style={{ marginTop: '2rem' }}>
        <h2>Active Grievances</h2>
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <p>No grievances pending review.</p>
        </div>
      </section>
    </main>
  );
}
