export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-white/[0.07] ${className}`}>
      <div className="skel-shine absolute inset-0" />
    </div>
  );
}

export function SkeletonRows({ n = 6, className = "h-10" }: { n?: number; className?: string }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: n }, (_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </div>
  );
}
