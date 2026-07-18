import { UserRole } from '@/lib/hooks/useProjectFilters';

import Iconify from '@/components/Iconify';
import Link from 'next/link';

interface DashboardHeaderProps {
  activeTab: UserRole;
}

export default function DashboardHeader({ activeTab }: DashboardHeaderProps) {
  return (
    <header className="mb-12 reveal">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1
            className="text-4xl md:text-5xl font-medium leading-tight mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Dashboard Proyek
          </h1>
          <p className="text-gray-400 max-w-xl">
            Kelola proyek konstruksi Anda secara on-chain. Pantau escrow dan kirim
            bukti kerja harian.
          </p>
        </div>

        {activeTab === 'kontraktor' ? (
          <Link
            href="/dashboard/projects/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF4500] text-white font-medium hover:bg-[#e63e00] transition-colors"
          >
            <Iconify icon="lucide:plus" />
            <span>Buat Proyek</span>
          </Link>
        ) : (
          <Link
            href="/dashboard/proofs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF4500] text-white font-medium hover:bg-[#e63e00] transition-colors"
          >
            <Iconify icon="lucide:camera" />
            <span>Kirim Bukti</span>
          </Link>
        )}
      </div>
    </header>
  );
}
