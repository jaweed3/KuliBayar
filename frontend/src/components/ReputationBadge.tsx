'use client';

interface ReputationBadgeProps {
  rating: number;
  totalJobs: number;
  disputes: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function ReputationBadge({ rating, totalJobs, disputes, size = 'md' }: ReputationBadgeProps) {
  const getStars = (rating: number) => {
    const stars = Math.round(rating / 100);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  const getReliabilityColor = () => {
    if (rating >= 400 && disputes < 3) return 'bg-green-100 text-green-800';
    if (rating >= 300) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full ${getReliabilityColor()} ${sizeClasses[size]}`}>
      <span className="text-yellow-500">{getStars(rating)}</span>
      <span className="font-medium">{(rating / 100).toFixed(1)}</span>
      <span className="text-gray-500">|</span>
      <span>{totalJobs} jobs</span>
      {disputes > 0 && (
        <>
          <span className="text-gray-500">|</span>
          <span className="text-red-500">{disputes} disputes</span>
        </>
      )}
    </div>
  );
}
