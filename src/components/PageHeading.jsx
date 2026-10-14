/** Page title + description; children (e.g. the sign-language picker) sit on the opposite side. */
function PageHeading({ title, description, children }) {
  return (
    <header className="page-head">
      <div className="page-head-text">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children && <div className="page-head-side">{children}</div>}
    </header>
  )
}

export default PageHeading
