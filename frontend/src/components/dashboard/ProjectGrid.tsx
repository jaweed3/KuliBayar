import { KontraktorProject, KuliProject } from '@/lib/mock/projects';
import { UserRole } from '@/lib/hooks/useProjectFilters';
import ProjectCard from './ProjectCard';

interface ProjectGridProps {
  projects: (KontraktorProject | KuliProject)[];
  activeTab: UserRole;
}

export default function ProjectGrid({ projects, activeTab }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        Tidak ada proyek ditemukan
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal"
      style={{ transitionDelay: '200ms' }}
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} activeTab={activeTab} />
      ))}
    </div>
  );
}
