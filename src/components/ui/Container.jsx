import { cn } from '@/utils/cn'

/**
 * Constrains content to a consistent max-width with responsive gutters.
 * Used by Navbar, Footer, and every page section so horizontal rhythm
 * stays aligned across the whole app.
 */
function Container({ as: Component = 'div', className, children, ...props }) {
  return (
    <Component
      className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}
      {...props}
    >
      {children}
    </Component>
  )
}

export default Container
