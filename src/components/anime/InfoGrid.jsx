/**
 * Label/value grid for the "Información" section of AnimeDetail — and any
 * future page that needs a structured metadata panel.
 */
function InfoGrid({ items }) {
  const visible = items.filter((item) => item.value)
  if (!visible.length) return null

  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((item) => (
        <div key={item.label}>
          <dt className="text-xs uppercase tracking-wide text-text-secondary">{item.label}</dt>
          <dd className="mt-1 text-sm text-text">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default InfoGrid
