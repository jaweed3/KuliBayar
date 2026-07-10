'use client';

import { useEffect } from 'react';
import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';
import { useProjectFilters } from '@/lib/hooks/useProjectFilters';
import { useRevealAnimation } from '@/lib/hooks/useRevealAnimation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import RoleToggle from '@/components/dashboard/RoleToggle';
import StatusFilter from '@/components/dashboard/StatusFilter';
import LoadingSkeleton from '@/components/dashboard/LoadingSkeleton';
import ProjectGrid from '@/components/dashboard/ProjectGrid';

export default function Dashboard() {
  const {
    activeTab,
    setActiveTab,
    filter,
    setFilter,
    loading,
    filteredProjects,
  } = useProjectFilters();

  const containerRef = useRevealAnimation([loading, filteredProjects, activeTab]);

  return (
    <div className="min-h-screen bg-[#050505]">
      <NavigationBar activeItem="projects" />

      <main className="container mx-auto px-6 pt-40 pb-20 relative z-10" ref={containerRef}>
        <DashboardHeader activeTab={activeTab} />
        <RoleToggle activeTab={activeTab} onTabChange={setActiveTab} />
        <StatusFilter filter={filter} onFilterChange={setFilter} />

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <ProjectGrid projects={filteredProjects} activeTab={activeTab} />
        )}
      </main>

      <Footer />
    </div>
  );
}
