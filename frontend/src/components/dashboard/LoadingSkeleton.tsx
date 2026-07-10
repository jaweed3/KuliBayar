export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-[#111] border border-white/10 rounded-3xl p-8 animate-pulse"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="h-6 w-20 bg-white/5 rounded-full" />
            <div className="h-4 w-16 bg-white/5 rounded" />
          </div>
          <div className="h-6 w-3/4 bg-white/5 rounded mb-2" />
          <div className="h-4 w-1/2 bg-white/5 rounded mb-6" />
          <div className="space-y-4 mb-8">
            <div className="flex justify-between">
              <div className="h-3 w-20 bg-white/5 rounded" />
              <div className="h-3 w-12 bg-white/5 rounded" />
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="h-16 bg-white/5 rounded-2xl" />
            <div className="h-16 bg-white/5 rounded-2xl" />
          </div>
          <div className="h-12 bg-white/5 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
