import Container from '@/components/ui/Container'

/**
 * TEMPORARY scaffold page. Confirms the router, layout, and Tailwind
 * theme are wired correctly. Replace with the real Home page in the
 * next phase — do not build on top of this file.
 */
function Placeholder({ title = 'Page' }) {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center pt-16 text-center">
      <h1 className="font-display text-3xl font-bold">
        {title} <span className="text-text-muted font-normal">— scaffold</span>
      </h1>
      <p className="mt-3 max-w-md text-text-muted">
        Architecture online: routing, layout, navbar, footer, and Tailwind
        theme are wired up. This route is a stand-in until its real page is
        built.
      </p>
    </Container>
  )
}

export default Placeholder
