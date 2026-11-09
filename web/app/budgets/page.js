"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";

const BUDGETS_KEY = "budgets";
const REMITTANCES_KEY = "remittances";
const RECORDS_EVENT = "budgets-records-updated";
const SERVER_RECORDS_SNAPSHOT = JSON.stringify(["[]", "[]"]);
const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});
const monthFormat = new Intl.DateTimeFormat("en-CA", {
  month: "long",
  year: "numeric",
});

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function subscribeToRecords(callback) {
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

function getRecordsSnapshot() {
  try {
    return JSON.stringify([
      localStorage.getItem(BUDGETS_KEY) ?? "[]",
      localStorage.getItem(REMITTANCES_KEY) ?? "[]",
    ]);
  } catch (error) {
    return JSON.stringify({ error: error.message });
  }
}

function subscribeToMonth(callback) {
  let month = currentMonth();
  const timer = window.setInterval(() => {
    const nextMonth = currentMonth();
    if (nextMonth !== month) {
      month = nextMonth;
      callback();
    }
  }, 60_000);
  return () => window.clearInterval(timer);
}

function formatMonth(month) {
  return monthFormat.format(new Date(`${month}-01T00:00:00`));
}

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function BudgetsPage() {
  const [error, setError] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const dialogRef = useRef(null);
  const formRef = useRef(null);
  const recordsSnapshot = useSyncExternalStore(
    subscribeToRecords,
    getRecordsSnapshot,
    () => SERVER_RECORDS_SNAPSHOT,
  );
  const activeMonth = useSyncExternalStore(
    subscribeToMonth,
    currentMonth,
    () => "",
  );
  const savedRecords = useMemo(() => {
    try {
      const parsed = JSON.parse(recordsSnapshot);
      if (!Array.isArray(parsed)) throw new Error(parsed.error);
      const budgets = JSON.parse(parsed[0]);
      const remittances = JSON.parse(parsed[1]);
      if (!Array.isArray(budgets) || !Array.isArray(remittances)) {
        throw new Error("Saved budgets and remittances must be lists.");
      }
      return { budgets, remittances, error: "" };
    } catch (loadError) {
      return {
        budgets: [],
        remittances: [],
        error: `Could not load saved budget data: ${loadError.message}`,
      };
    }
  }, [recordsSnapshot]);
  const { budgets, remittances } = savedRecords;

  const orderedBudgets = useMemo(
    () => [...budgets].sort((a, b) => b.month.localeCompare(a.month)),
    [budgets],
  );
  const currentBudget = budgets.find((budget) => budget.month === activeMonth);
  const currentSpent = useMemo(
    () =>
      remittances.reduce((total, remittance) => {
        const amount = Number(remittance.amount);
        return remittance.date?.startsWith(activeMonth) && Number.isFinite(amount)
          ? total + amount
          : total;
      }, 0),
    [activeMonth, remittances],
  );
  const available = currentBudget ? currentBudget.amount - currentSpent : 0;

  function openForm(budget = null) {
    setError("");
    setDialogError("");
    setEditingId(budget?.id ?? null);
    formRef.current?.reset();
    if (formRef.current) {
      formRef.current.elements.month.value = budget?.month ?? activeMonth;
      formRef.current.elements.amount.value = budget?.amount ?? "";
    }
    dialogRef.current?.showModal();
  }

  function persist(nextBudgets) {
    try {
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(nextBudgets));
      window.dispatchEvent(new Event(RECORDS_EVENT));
      setError("");
      return true;
    } catch (saveError) {
      const message = `Could not save your budget: ${saveError.message}`;
      setError(message);
      setDialogError(message);
      return false;
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const month = String(formData.get("month"));
    const amount = Number(formData.get("amount"));
    if (!month || !Number.isFinite(amount) || amount <= 0) {
      setDialogError("Enter a month and a budget amount greater than zero.");
      return;
    }

    if (budgets.some((budget) => budget.month === month && budget.id !== editingId)) {
      setDialogError("A budget already exists for that month. Edit the existing budget instead.");
      return;
    }

    const nextBudgets = editingId
      ? budgets.map((budget) =>
          budget.id === editingId ? { ...budget, month, amount } : budget,
        )
      : [...budgets, { id: newId(), month, amount }];

    if (persist(nextBudgets)) dialogRef.current?.close();
  }

  function deleteBudget(budget) {
    if (!window.confirm(`Delete the ${formatMonth(budget.month)} budget?`)) return;
    persist(budgets.filter((item) => item.id !== budget.id));
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">PERSONAL FINANCE</p>
          <h1>Monthly budgets</h1>
          <p className="subtitle">Plan your remittances and keep each month on track.</p>
        </div>
        <button className="button button-primary" disabled={!activeMonth} onClick={() => openForm()}>
          <span aria-hidden="true">+</span> Add budget
        </button>
      </header>

      {(error || savedRecords.error) && (
        <p className="notice" role="alert">{error || savedRecords.error}</p>
      )}

      <section className="summary-grid" aria-label="Current month overview">
        <article className="summary-card">
          <span>Budget for this month</span>
          <strong>{currentBudget ? currency.format(currentBudget.amount) : "Not set"}</strong>
          <small>{activeMonth ? formatMonth(activeMonth) : "Loading…"}</small>
        </article>
        <article className="summary-card">
          <span>Remittances this month</span>
          <strong>{currency.format(currentSpent)}</strong>
          <small>Based on your saved remittance records</small>
        </article>
        <article className={`summary-card${available < 0 ? " summary-warning" : ""}`}>
          <span>{available < 0 ? "Over budget by" : "Remaining this month"}</span>
          <strong>
            {currentBudget
              ? currency.format(Math.abs(available))
              : currency.format(0)}
          </strong>
          <small>{currentBudget ? "Budget less remittances" : "Set a budget to see what remains"}</small>
        </article>
      </section>

      <section className="budget-panel" aria-labelledby="budgets-heading">
        <div className="panel-heading">
          <div>
            <h2 id="budgets-heading">Your budgets</h2>
            <p>One budget per month, shown in Canadian dollars.</p>
          </div>
          <span className="budget-count">{budgets.length} {budgets.length === 1 ? "month" : "months"}</span>
        </div>

        {!activeMonth ? (
          <p className="empty-state">Loading your budgets…</p>
        ) : savedRecords.error ? (
          <p className="empty-state" role="status">
            Your budgets could not be displayed because the saved data could not be read.
          </p>
        ) : orderedBudgets.length === 0 ? (
          <div className="empty-state" role="status">
            <span className="empty-icon" aria-hidden="true">$</span>
            <h3>No budgets yet</h3>
            <p>Add a monthly budget to start tracking your remittances.</p>
            <button className="button button-primary" onClick={() => openForm()}>
              Add your first budget
            </button>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Month</th>
                  <th scope="col">Budget</th>
                  <th scope="col">Remittances</th>
                  <th scope="col">Remaining</th>
                  <th scope="col">Progress</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {orderedBudgets.map((budget) => {
                  const spent = remittances.reduce((total, remittance) => {
                    const amount = Number(remittance.amount);
                    return remittance.date?.startsWith(budget.month) && Number.isFinite(amount)
                      ? total + amount
                      : total;
                  }, 0);
                  const ratio = spent / budget.amount;
                  const percent = Math.round(ratio * 100);
                  const progressClass = ratio >= 1 ? "progress-danger" : ratio >= 0.75 ? "progress-caution" : "";
                  const remaining = budget.amount - spent;

                  return (
                    <tr key={budget.id}>
                      <th scope="row">{formatMonth(budget.month)}</th>
                      <td>{currency.format(budget.amount)}</td>
                      <td>{currency.format(spent)}</td>
                      <td className={remaining < 0 ? "over-budget" : ""}>
                        {remaining < 0 ? `-${currency.format(Math.abs(remaining))}` : currency.format(remaining)}
                      </td>
                      <td>
                        <div
                          className={`progress-track ${progressClass}`}
                          role="progressbar"
                          aria-label={`${formatMonth(budget.month)} budget used`}
                          aria-valuemin="0"
                          aria-valuemax="100"
                          aria-valuenow={Math.min(percent, 100)}
                        >
                          <span style={{ width: `${Math.min(percent, 100)}%` }} />
                        </div>
                        <span className="progress-label">{percent}% used</span>
                      </td>
                      <td className="row-actions">
                        <button className="button button-small" onClick={() => openForm(budget)}>
                          Edit
                        </button>
                        <button
                          className="button button-small button-delete"
                          onClick={() => deleteBudget(budget)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="page-note">Budgets and remittances are stored in this browser only.</p>

      <dialog
        className="budget-dialog"
        ref={dialogRef}
        onClose={() => {
          setEditingId(null);
          setDialogError("");
          setError("");
        }}
      >
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="dialog-heading">
            <h2>{editingId ? "Edit budget" : "Add monthly budget"}</h2>
            <button
              className="dialog-close"
              type="button"
              aria-label="Close dialog"
              onClick={() => dialogRef.current?.close()}
            >
              ×
            </button>
          </div>
          <label htmlFor="budget-month">Month</label>
          <input id="budget-month" name="month" type="month" required />
          <label htmlFor="budget-amount">Budget amount (CAD)</label>
          <div className="amount-input">
            <span aria-hidden="true">$</span>
            <input
              id="budget-amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
          <p className="dialog-help">Your spending is calculated from remittances recorded for the selected month.</p>
          {dialogError && <p className="notice" role="alert">{dialogError}</p>}
          <div className="dialog-actions">
            <button className="button" type="button" onClick={() => dialogRef.current?.close()}>
              Cancel
            </button>
            <button className="button button-primary" type="submit">
              Save budget
            </button>
          </div>
        </form>
      </dialog>
    </main>
  );
}