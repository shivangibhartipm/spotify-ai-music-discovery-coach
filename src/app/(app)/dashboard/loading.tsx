import { Card, Skeleton } from "@/components/ui";
import { RecommendationSkeletonGrid } from "@/components/recommendations/RecommendationGrid";

function StatSkeleton() {
  return (
    <Card>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-4 h-9 w-16" />
      <Skeleton className="mt-3 h-4 w-40" />
    </Card>
  );
}

export default function DashboardLoading() {
  return (
    <section className="py-10" aria-label="Loading dashboard">
      <div className="mb-6 max-w-3xl">
        <Skeleton className="h-12 w-full max-w-2xl sm:h-14" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>

      <Card className="mt-8">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-5 h-20 w-44" />
        <Skeleton className="mt-6 h-3 w-full" />
      </Card>

      <section className="mt-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-4 h-8 w-24" />
              <Skeleton className="mt-5 h-24 w-full" />
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
        <div className="mt-4">
          <RecommendationSkeletonGrid />
        </div>
      </section>
    </section>
  );
}
