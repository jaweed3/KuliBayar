import { UserRole } from '@/lib/hooks/useProjectFilters';

interface RoleToggleProps {
  activeTab: UserRole;
  onTabChange: (tab: UserRole) => void;
}

export default function RoleToggle({ activeTab, onTabChange }: RoleToggleProps) {
  return (
    <div className="flex items-center gap-2 mb-8 reveal" style={{ transitionDelay: '50ms' }}>
      <div className="bg-[#111] border border-white/10 rounded-full p-1 flex">
        <button
          onClick={() => onTabChange('kontraktor')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === 'kontraktor'
              ? 'bg-[#FF4500] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Kontraktor
        </button>
        <button
          onClick={() => onTabChange('kuli')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === 'kuli'
              ? 'bg-[#FF4500] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Kuli
        </button>
      </div>
    </div>
  );
}
