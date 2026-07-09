import Skeleton from './Skeleton'
import AnimeCardSkeleton from '@/components/movie/AnimeCardSkeleton'

/**
 * Skeleton orchestrator used everywhere data is in flight. AnimeCLZ never
 * shows a spinner — every loading state is a skeleton matching the real
 * layout it will be replaced by.
 */
function LoadingState({ variant = 'grid', count = 12 }) {
  if (variant === 'row') {
    return (
      <div className="flex gap-4 px-4 sm:px-6 lg:px-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="w-40 shrink-0 sm:w-44 md:w-48">
            <AnimeCardSkeleton />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'hero') {
    return (
      <div className="flex h-[70vh] min-h-[480px] w-full flex-col justify-end gap-4 px-4 pb-20 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-2/3 max-w-lg" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="h-4 w-2/3 max-w-md" />
        <div className="flex gap-3">
          <Skeleton className="h-11 w-36" />
          <Skeleton className="h-11 w-44" />
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <AnimeCardSkeleton key={index} />
      ))}
    </div>
  )
}

export default LoadingState
