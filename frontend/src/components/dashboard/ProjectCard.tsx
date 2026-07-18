import Link from 'next/link';
import { KontraktorProject, KuliProject } from '@/lib/mock/projects';
import { UserRole } from '@/lib/hooks/useProjectFilters';

import Iconify from '@/components/Iconify';

interface ProjectCardProps {
  project: KontraktorProject | KuliProject;
  activeTab: UserRole;
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'created':
      return 'bg-[#FF4500]/10 text-[#FF4500] border-[#FF4500]/20';
    case 'disputed':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    default:
      return 'bg-white/5 text-gray-400 border-white/10';
  }
}

function isKontraktorProject(project: KontraktorProject | KuliProject): project is KontraktorProject {
  return 'kbId' in project;
}

export default function ProjectCard({ project, activeTab }: ProjectCardProps) {
  const progress =
    project.durationDays > 0
      ? (project.daysCompleted / project.durationDays) * 100
      : 0;

  const isKontraktor = activeTab === 'kontraktor';
  const projectId = project.id;

  return (
    <div className="project-card bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col justify-between group">
      {/* Header */}
      <div>
        <div className="flex justify-between items-start mb-6">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${getStatusStyle(
              project.status
            )}`}
          >
            {project.status === 'active' && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            )}
            {project.status === 'disputed' && (
              <Iconify icon="lucide:alert-circle" className="text-sm" />
            )}
            {project.statusLabel}
          </span>
          <span className="text-xs text-white/40 font-mono">
            {isKontraktorProject(project) ? project.kbId : `ID: ${project.id}`}
          </span>
        </div>

        {/* Name & Location */}
        <h3 className="text-xl font-semibold mb-2 group-hover:text-[#FF4500] transition-colors">
          {project.name}
        </h3>
        <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Iconify icon="lucide:map-pin" className="text-gray-600" />
          {project.location}
        </p>

        {/* Progress Bar */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-500 uppercase tracking-widest font-bold">
              Progres Hari
            </span>
            <span className="text-white">
              {project.daysCompleted} / {project.durationDays}
            </span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF4500] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {isKontraktor ? (
            <>
              <StatBox
                label="Dana Terkunci"
                value={`${(project as KontraktorProject).totalAmount} ETH`}
              />
              <StatBox
                label="Dana Dirilis"
                value={`${(project as KontraktorProject).releasedAmount} ETH`}
              />
            </>
          ) : (
            <>
              <StatBox
                label="Tarif/Hari"
                value={`${(project as KuliProject).dailyRate} ETH`}
                mono
              />
              <StatBox
                label="Earned"
                value={`${(project as KuliProject).earned} ETH`}
                mono
                highlight
              />
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <ProjectActions project={project} activeTab={activeTab} />
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-sm font-medium hover:bg-white/10 transition-colors"
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}

// Stat Box Sub-component
function StatBox({
  label,
  value,
  mono = false,
  highlight = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={`text-sm font-medium ${
          mono ? 'font-mono' : ''
        } ${highlight ? 'text-green-500' : ''}`}
      >
        {value}
      </p>
    </div>
  );
}

// Action Buttons Component
function ProjectActions({
  project,
  activeTab,
}: {
  project: KontraktorProject | KuliProject;
  activeTab: UserRole;
}) {
  const isKontraktor = activeTab === 'kontraktor';

  if (isKontraktor) {
    return <KontraktorActions project={project as KontraktorProject} />;
  }
  return <KuliActions project={project as KuliProject} />;
}

// Kontraktor-specific actions
function KontraktorActions({ project }: { project: KontraktorProject }) {
  switch (project.status) {
    case 'created':
      return (
        <Link
          href={`/dashboard/projects/${project.id}/fund`}
          className="w-full py-3 rounded-xl bg-[#FF4500] text-white text-center text-sm font-bold hover:bg-[#e63e00] transition-colors flex items-center justify-center gap-2"
        >
          <Iconify icon="lucide:wallet" /> Fund Escrow
        </Link>
      );
    case 'disputed':
      return (
        <Link
          href="/dashboard/disputes"
          className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-center text-sm font-bold hover:bg-red-500/20 transition-colors"
        >
          Buka Sengketa
        </Link>
      );
    default:
      return null;
  }
}

// Kuli-specific actions
function KuliActions({ project }: { project: KuliProject }) {
  switch (project.status) {
    case 'active':
      return (
        <Link
          href="/dashboard/proofs"
          className="w-full py-3 rounded-xl bg-[#FF4500] text-white text-center text-sm font-bold hover:bg-[#e63e00] transition-colors flex items-center justify-center gap-2"
        >
          <Iconify icon="lucide:camera" /> Kirim Bukti Kerja
        </Link>
      );
    case 'pending':
      return (
        <div className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-center text-sm font-medium">
          Menunggu Persetujuan
        </div>
      );
    default:
      return null;
  }
}
