export default function RemittancesLoading() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">REMITTANCE TRACKER</p>
          <h1>Remittances</h1>
        </div>
      </header>
      <div className="empty-state" role="status">
        <h3>Loading remittances...</h3>
      </div>
    </main>
  );
}