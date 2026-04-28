export default function CardSkeleton() {
  return (
    <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-3 py-2.5">
      <div className="skeleton h-5 w-11 rounded flex-shrink-0" />
      <div className="skeleton h-4 flex-1 rounded" />
      <div className="skeleton h-3 w-32 rounded flex-shrink-0" />
    </div>
  );
}
