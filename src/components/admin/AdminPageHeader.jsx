function AdminPageHeader({ title, description, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export default AdminPageHeader
