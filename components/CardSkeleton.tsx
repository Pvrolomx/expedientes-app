export default function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-card p-5 border border-gray-100">
      <div className="skeleton h-4 w-2/3 rounded mb-2" />
      <div className="skeleton h-3 w-full rounded mb-1" />
      <div className="skeleton h-3 w-1/2 rounded mb-4" />
      <div className="flex gap-3">
        <div className="skeleton h-3 w-8 rounded" />
        <div className="skeleton h-3 w-8 rounded" />
        <div className="skeleton h-3 w-8 rounded" />
        <div className="skeleton h-3 w-8 rounded" />
      </div>
    </div>
  );
}
