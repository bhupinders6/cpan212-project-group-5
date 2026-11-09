"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

const BUDGETS_KEY = "budgets";
const REMITTANCES_KEY = "remittances";
const RECORDS_EVENT = "budgets-records-updated";
const SERVER_SNAPSHOT = "loading";
const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});
const monthFormat = new Intl.DateTimeFormat("en-CA", {
  month: "long",
  year: "numeric",
});

function subscribe(callback) {
  const handleStorage = (event) => {
    if (!event.key || event.key === BUDGETS_KEY || event.key === REMITTANCES_KEY) {
      callback();
    }
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(RECORDS_EVENT, callback);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(RECORDS_EVENT, callback);
  };
}

function getSnapshot() {
  try {
    return JSON.stringify([
      localStorage.getItem(BUDGETS_KEY) ?? "[]",
      localStorage.getItem(REMITTANCES_KEY) ?? "[]",
    ]);
  } catch (error) {
    return JSON.stringify({ error: error.message });
  }
}

function formatMonth(month) {
  return monthFormat.format(new Date(`${month}-01T00:00:00`));
}

export default function BudgetDetail({ id }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT);
  const records = useMemo(() => {
    if (snapshot === SERVER_SNAPSHOT) {
      return { loading: true, budgets: [], remittances: [], error: "" };
    }

    try {
      const parsed = JSON.parse(snapshot);
      if (!Array.isArray(parsed)) throw new Error(parsed.error);
      const budgets = JSON.parse(parsed[0]);
      const remittances = JSON.parse(parsed[1]);
      if (!Array.isArray(budgets) || !Array.isArray(remittances)) {
        throw new Error("Saved budgets and remittances must be lists.");
      }
      return { loading: false, budgets, remittances, error: "" };
    } catch (error) {
      return {
        loading: false,
        budgets: [],
        remittances: [],
        error: `Could not load saved budget data: ${error.message}`,
      };
    }
  }, [snapshot]);

  const budget = records.budgets.find((item) => item.id === id);
  const monthlyRemittances = useMemo(
    () =>
      budget
        ? records.remittances.filter((item) => item.date?.startsWith(budget.month))
        : [],
    [budget, records.remittances],
  );
  const spent = monthlyRemittances.reduce((total, item) => {
    const amount = Number(item.amount);
    return Number.isFinite(amount) ? total + amount : total;
  }, 0);

  if (records.loading) {
    return (
      <main className="page-shell" aria-busy="true">
        <p className="visually-hidden" role="status">Loading budget details…</p>
        <div className="budget-panel">
          <span className="loading-skeleton loading-label" />
          <span className="loading-skeleton loading-value" />
        </div>
      </main>
    );
  }

  if (records.error) {
    return (
      <main className="page-shell">
        <p className="notice" role="alert">{records.error}</p>
        <Link className="button" href="/budgets">Back to budgets</Link>
      </main>
    );
  }

  if (!budget) {
    return (
      <main className="page-shell">
        <header className="page-header">
          <div>
            <p className="eyebrow">PERSONAL FINANCE</p>
            <h1>Budget not found</h1>
            <p className="subtitle">This budget may have been deleted or is not saved in this browser.</p>
          </div>
          <Link className="button" href="/budgets">Back to budgets</Link>
        </header>
      </main>
    );
  }

  const remaining = budget.amount - spent;
  const percent = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">PERSONAL FINANCE</p>
          <h1>{formatMonth(budget.month)} budget</h1>
          <p className="subtitle">Budget and remittance details for this month.</p>
        </div>
        <Link className="button" href="/budgets">Back to budgets</Link>
      </header>

      <section className="summary-grid" aria-label={`${formatMonth(budget.month)} budget summary`}>
        <article className="summary-card">
          <span>Budget</span>
          <strong>{currency.format(budget.amount)}</strong>
        </article>
        <article className="summary-card">
          <span>Remittances</span>
          <strong>{currency.format(spent)}</strong>
          <small>{monthlyRemittances.length} {monthlyRemittances.length === 1 ? "remittance" : "remittances"}</small>
        </article>
        <article className={`summary-card${remaining < 0 ? " summary-warning" : ""}`}>
          <span>{remaining < 0 ? "Over budget by" : "Remaining"}</span>
          <strong>{currency.format(Math.abs(remaining))}</strong>
          <small>{percent}% of budget used</small>
        </article>
      </section>

      <section className="budget-panel" aria-labelledby="budget-details-heading">
        <div className="panel-heading">
          <div>
            <h2 id="budget-details-heading">Budget details</h2>
            <p>{formatMonth(budget.month)} spending progress</p>
          </div>
        </div>
        <div
          className={`progress-track${percent >= 100 ? " progress-danger" : percent >= 75 ? " progress-caution" : ""}`}
          role="progressbar"
          aria-label={`${formatMonth(budget.month)} budget used`}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.min(Math.max(percent, 0), 100)}
        >
          <span style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }} />
        </div>
        <p className="progress-label">{percent}% used</p>
        <p className="page-note">Budgets and remittances are stored in this browser only.</p>
      </section>
    </main>
  );
}
