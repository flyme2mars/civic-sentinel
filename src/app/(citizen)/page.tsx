import GrievanceForm from '@/components/citizen/GrievanceForm';

export default function CitizenPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-white py-16 px-4">
      <div className="max-w-xl mx-auto space-y-10">
        <header className="space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">
              CIVIC <span className="text-slate-500">SENTINEL</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              Transparent governance through AI verification.
            </p>
          </div>
        </header>

        <GrievanceForm />

        {/* Status Preview / Doomsday Clock Placeholder */}
        <section className="pt-4 border-t border-slate-200">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Active Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium">System Online</span>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">No active grievances</h3>
              <p className="text-slate-400 text-sm">Your reported issues will appear here with a ticking doomsday clock for the government.</p>
            </div>
          </div>
        </section>

        <footer className="text-center text-slate-400 text-xs font-medium tracking-wide pt-8">
          {/* Footer content removed */}
        </footer>
      </div>
    </main>
  );
}
