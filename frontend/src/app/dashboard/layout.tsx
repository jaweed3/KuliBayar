export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505]">
      {children}
    </div>
  );
}
