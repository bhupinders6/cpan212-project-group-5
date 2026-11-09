export default function Loading() {
  return (
    <main className="page-shell" aria-busy="true">
      <p className="visually-hidden" role="status">Loading your budgets…</p>

      <header className="page-header">
        <div>
          <p className="eyebrow">PERSONAL FINANCE</p>
          <h1>Monthly budgets</h1>
          <p className="subtitle">Plan your remittances and keep each month on track.</p>
        </div>
        <span className="loading-skeleton loading-button" aria-hidden="true" />
      </header>

      <section className="summary-grid" aria-hidden="true">
        {[1, 2, 3].map((item) => (
          <article className="summary-card loading-card" key={item}>
            <span className="loading-skeleton loading-label" />
            <span className="loading-skeleton loading-value" />
            <span className="loading-skeleton loading-caption" />
          </article>
        ))}
      </section>

      <section className="budget-panel" aria-hidden="true">
        <div className="panel-heading">
          <div>
            <h2>Your budgets</h2>
            <p>One budget per month, shown in Canadian dollars.</p>
          </div>
        </div>
        <div className="loading-table">
          {[1, 2, 3].map((row) => (
            <div className="loading-row" key={row}>
              {[1, 2, 3, 4].map((cell) => (
                <span className="loading-skeleton loading-cell" key={cell} />
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
