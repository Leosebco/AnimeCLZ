import { cn } from '@/utils/cn'

function Skeleton({ className }) {
  return <div className={cn('animate-shimmer rounded-md', className)} />
}

export default Skeleton
