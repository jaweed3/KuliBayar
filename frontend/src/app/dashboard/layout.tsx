import { AuthProvider } from '@/lib/auth';
import AuthGuard from '@/components/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <div className="min-h-screen bg-[#050505]">
          {children}
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
