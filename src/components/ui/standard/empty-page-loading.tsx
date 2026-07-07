export default function EmptyPageLoading() {
  return (
    <div className="flex items-center justify-center p-8 min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[var(--brand-0)] rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    </div>
  );
}
