import Link from "next/link";

export default function BudgetNotFound() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">PERSONAL FINANCE</p>
          <h1>Budget not found</h1>
          <p className="subtitle">The requested budget could not be found.</p>
        </div>
        <Link className="button" href="/budgets">Back to budgets</Link>
      </header>
    </main>
  );
}
