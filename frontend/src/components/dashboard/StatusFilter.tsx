import { FilterStatus } from '@/lib/hooks/useProjectFilters';

interface StatusFilterProps {
  filter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
}

const filters: { key: FilterStatus; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'active', label: 'Aktif' },
  { key: 'completed', label: 'Selesai' },
  { key: 'disputed', label: 'Sengketa' },
];

export default function StatusFilter({ filter, onFilterChange }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-10 reveal" style={{ transitionDelay: '100ms' }}>
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => onFilterChange(f.key)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            filter === f.key
              ? 'bg-[#FF4500] text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
