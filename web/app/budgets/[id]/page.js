import { Suspense } from "react";
import { notFound } from "next/navigation";
import BudgetDetail from "./budget-detail";

export default async function BudgetDetailPage({ params }) {
  const { id } = await params;

  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(id)) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <main className="page-shell" aria-busy="true">
          <p className="visually-hidden" role="status">Loading budget details…</p>
          <div className="budget-panel">
            <span className="loading-skeleton loading-label" />
            <span className="loading-skeleton loading-value" />
          </div>
        </main>
      }
    >
      <BudgetDetail id={id} />
    </Suspense>
  );
}
