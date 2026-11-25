
"use client";

import { useState, useEffect, useRef } from "react";
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";


function getCurrentMonth() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  return today.getFullYear() + "-" + month;
}

function normalizeBudget(budget) {
  const monthIndex = new Date(
    `${budget.month} 1, ${budget.year}`
  ).getMonth();
  const month = Number.isNaN(monthIndex)
    ? getCurrentMonth()
    : `${budget.year}-${String(monthIndex + 1).padStart(2, "0")}`;

  return {
    ...budget,
    amount: Number(budget.monthlyLimit ?? budget.amount),
    month
  };
}

function toApiBudget(month, amount, existingBudget) {
  const [year, monthNumber] = month.split("-").map(Number);

  return {
    userId: existingBudget?.userId || "user-1",
    currency: existingBudget?.currency || "CAD",
    monthlyLimit: amount,
    month: new Date(year, monthNumber - 1, 1).toLocaleString("en-US", {
      month: "long"
    }),
    year
  };
}

function extractFieldErrors(result) {
  const errors = {};
  if (!result?.details) return errors;

  if (Array.isArray(result.details)) {
    for (const item of result.details) {
      const key = Array.isArray(item.path) ? item.path.join(".") : item.field;
      if (key && !errors[key]) {
        errors[key] = item.message;
      }
    }
    return errors;
  }

  if (typeof result.details === "object") {
    for (const [key, val] of Object.entries(result.details)) {
      errors[key] = typeof val === "string" ? val : val?.message || "Invalid value";
    }
  }

  return errors;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const currencyParam = searchParams.get("currency") || "ALL";
  const monthParam = searchParams.get("month") || "";
  const sortParam = searchParams.get("sort") || "-year";
  const pageParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = 5;

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [fieldErrors, setFieldErrors] = useState({});
  const [remittances, setRemittances] = useState([]);
  const activeMonth = getCurrentMonth();
  const [error, setError] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const dialogRef = useRef(null);
  const formRef = useRef(null);
  const updateUrlParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (
          value === "" ||
          value === null ||
          value === undefined ||
          (key === "currency" && value === "ALL") ||
          (key === "page" && Number(value) === 1)
        ) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      const query = params.toString();
      router.replace(query ? `/budgets?${query}` : "/budgets");
    },
    [router, searchParams]
  );


  // to change the format of the month
  function formatMonth(month) {
    const date = new Date(month + "-01T00:00:00");

    return date.toLocaleDateString("en-CA", {
      month: "long",
      year: "numeric"
    });
  }

  // to format the money in CAD
  function formatMoney(amount) {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD"
    }).format(amount);
  }

  useEffect(() => {
    function loadRemittances() {
      try {
        const savedData = localStorage.getItem("remittances");

        if (savedData) {
          const data = JSON.parse(savedData);

          if (Array.isArray(data)) {
            setRemittances(data);
          }
        }

      } catch (err) {
        setError("Could not load remittances from browser storage.");
      }
    }

    loadRemittances();

    const params = new URLSearchParams();
    if (currencyParam && currencyParam !== "ALL") {
      params.set("currency", currencyParam);
    }
    if (monthParam.trim()) {
      params.set("month", monthParam.trim());
    }
    if (sortParam) {
      params.set("sort", sortParam);
    }
    params.set("page", String(pageParam));
    params.set("limit", String(limit));
    fetch(`/api/budgets?${params.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load budgets");
        }

        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Invalid budget data");
        }

        setBudgets(data.map(normalizeBudget));
        setError("");
      })
      .catch((err) => {
        setError("Could not load budgets: " + err.message);
      });

    function updateData(event) {
      if (!event.key || event.key === "remittances") {
        loadRemittances();
      }
    }

    window.addEventListener("storage", updateData);

    return () => {
      window.removeEventListener("storage", updateData);
    };
  }, []);

  // to find the current month's budget
  const currentBudget = budgets.find(
    (budget) => budget.month === activeMonth
  );

  // to calculate remittance spending for a month
  function getSpent(month) {
    let total = 0;

    for (let i = 0; i < remittances.length; i++) {
      const item = remittances[i];
      const amount = Number(item.amount);

      if (
        item.date &&
        item.date.startsWith(month) &&
        Number.isFinite(amount)
      ) {
        total = total + amount;
      }
    }

    return total;
  }

  const currentSpent = getSpent(activeMonth);

  let available = 0;

  if (currentBudget) {
    available = currentBudget.amount - currentSpent;
  }

  // to open the budget form
  function openForm(budget) {
    setError("");
    setDialogError("");
    setFieldErrors({});

    if (budget) {
      setEditingId(budget.id);
    } else {
      setEditingId(null);
    }

    if (formRef.current) {
      formRef.current.reset();

      formRef.current.elements.month.value =
        budget ? budget.month : activeMonth;

      formRef.current.elements.amount.value =
        budget ? budget.amount : "";
    }

    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  }

  // to add or update a budget
  async function handleSubmit(event) {
    event.preventDefault();
    setDialogError("");
    setFieldErrors({});
    setSaving(true);

    const formData = new FormData(event.currentTarget);

    const month = formData.get("month");
    const amount = Number(formData.get("amount"));

    if (!month || !Number.isFinite(amount) || amount <= 0) {
      setDialogError("Please enter a valid month and amount.");
      setSaving(false);
      return;
    }

    const existingBudget = budgets.find((budget) => budget.id === editingId);

    // to check if another budget already exists for this month
    for (let i = 0; i < budgets.length; i++) {
      if (
        budgets[i].month === month &&
        budgets[i].id !== editingId &&
        (budgets[i].userId || "user-1") ===
          (existingBudget?.userId || "user-1")
      ) {
        setDialogError("A budget already exists for this month.");
        setSaving(false);
        return;
      }
    }

    try {
      const response = await fetch(
        editingId ? `/api/budgets/${editingId}` : "/api/budgets",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toApiBudget(month, amount, existingBudget))
        }
      );

      if (!response.ok) {
        const result = await response.json();
        setFieldErrors(extractFieldErrors(result));
        throw new Error(
          result.error?.message || result.message || "Could not save budget."
        );
      }

      const savedBudget = normalizeBudget(await response.json());
      setBudgets((currentBudgets) =>
        editingId
          ? currentBudgets.map((budget) =>
              budget.id === editingId ? savedBudget : budget
            )
          : [...currentBudgets, savedBudget]
      );
      setError("");
      window.dispatchEvent(new Event("budgets-records-updated"));
      dialogRef.current?.close();
    } catch (err) {
      setDialogError(err.message || "Could not save budget.");
    } finally {
      setSaving(false);
    }
  }

  // to delete a budget
  async function deleteBudget(budget) {
    const answer = window.confirm(
      "Are you sure you want to delete the " +
      formatMonth(budget.month) + " budget?"
    );

    if (!answer) {
      return;
    }

    try {
      const response = await fetch(`/api/budgets/${budget.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(
          result.error?.message || result.message || "Could not delete budget."
        );
      }

      setBudgets((currentBudgets) =>
        currentBudgets.filter((item) => item.id !== budget.id)
      );
      setError("");
      window.dispatchEvent(new Event("budgets-records-updated"));
    } catch (err) {
      setError(err.message || "Could not delete budget.");
    }
  }

  
  return (
    <main className="page-shell">

      {/* Page heading */}
      <header className="page-header">
        <div>
          <p className="eyebrow">PERSONAL FINANCE</p>

          <h1>Monthly budgets</h1>

          <p className="subtitle">
            Plan your remittances and manage your monthly budget.
          </p>
        </div>

        <button
          className="button button-primary"
          onClick={() => openForm(null)}
          disabled={!activeMonth}
        >
          + Add budget
        </button>
      </header>

      {error && (
        <p className="notice" role="alert">{error}</p>
      )}

      {/* Current month information */}
      <section className="summary-grid">

        <article className="summary-card">
          <span>Budget for this month</span>

          <strong>
            {currentBudget
              ? formatMoney(currentBudget.amount)
              : "Not set"}
          </strong>

          <small>
            {activeMonth ? formatMonth(activeMonth) : "Loading..."}
          </small>
        </article>

        <article className="summary-card">
          <span>Remittances this month</span>

          <strong>{formatMoney(currentSpent)}</strong>

          <small>Based on saved remittance records</small>
        </article>

        <article className={
          available < 0
            ? "summary-card summary-warning"
            : "summary-card"
        }>
          <span>
            {available < 0 ? "Over budget by" : "Remaining this month"}
          </span>

          <strong>
            {currentBudget
              ? formatMoney(Math.abs(available))
              : formatMoney(0)}
          </strong>

          <small>
            {currentBudget
              ? "Budget minus remittances"
              : "Add a budget to see your balance"}
          </small>
        </article>

      </section>

      {/* Budget list */}
      <section className="budget-panel">

        <div className="panel-heading">
          <div>
            <h2>Your budgets</h2>
            <p>All your monthly budgets in Canadian dollars.</p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
          <select
            aria-label="Filter by currency"
            value={currencyParam}
            onChange={(e) => updateUrlParams({ currency: e.target.value, page: 1 })}
          >
            <option value="ALL">All currencies</option>
            <option value="CAD">CAD</option>
            <option value="USD">USD</option>
            <option value="INR">INR</option>
          </select>

          <input
            type="text"
            aria-label="Filter by month name"
            placeholder="Filter month (e.g. October)"
            value={monthParam}
            onChange={(e) => updateUrlParams({ month: e.target.value, page: 1 })}
          />

          <select
            aria-label="Sort budgets"
            value={sortParam}
            onChange={(e) => updateUrlParams({ sort: e.target.value, page: 1 })}
          >
            <option value="-year">Year (Newest first)</option>
            <option value="year">Year (Oldest first)</option>
            <option value="-monthlyLimit">Amount (High to low)</option>
            <option value="monthlyLimit">Amount (Low to high)</option>
            <option value="month">Month (A–Z)</option>
          </select>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
            <button
              type="button"
              className="button button-small"
              disabled={pageParam <= 1}
              onClick={() => updateUrlParams({ page: pageParam - 1 })}
            >
              Previous
            </button>
            <span>
              Page {pageParam} of {totalPages}
            </span>
            <button
              type="button"
              className="button button-small"
              disabled={pageParam >= totalPages}
              onClick={() => updateUrlParams({ page: pageParam + 1 })}
            >
              Next
            </button>
          </div>
        </div>

            
          <span className="budget-count">
            {totalCount} {totalCount === 1 ? "month" : "months"}
          </span>
        </div>

        {orderedBudgets.length === 0 ? (

          <div className="empty-state">
            <span className="empty-icon">$</span>

            <h3>No budgets yet</h3>

            <p>Add a monthly budget to start tracking your money.</p>

            <button
              className="button button-primary"
              onClick={() => openForm(null)}
            >
              Add your first budget
            </button>
          </div>

        ) : (

          <div className="table-scroll">

            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Budget</th>
                  <th>Remittances</th>
                  <th>Remaining</th>
                  <th>Progress</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {budgets.map((budget) => {

                  const spent = getSpent(budget.month);
                  const remaining = budget.amount - spent;

                  const percent = Math.round(
                    (spent / budget.amount) * 100
                  );

                  let progressClass = "";

                  if (percent >= 100) {
                    progressClass = "progress-danger";
                  } else if (percent >= 75) {
                    progressClass = "progress-caution";
                  }

                  const progressWidth = Math.min(
                    Math.max(percent, 0),
                    100
                  );

                  return (
                    <tr key={budget.id}>

                      <th scope="row">
                        {formatMonth(budget.month)}
                      </th>

                      <td>{formatMoney(budget.amount)}</td>

                      <td>{formatMoney(spent)}</td>

                      <td>
                        {remaining < 0
                          ? "-" + formatMoney(Math.abs(remaining))
                          : formatMoney(remaining)}
                      </td>

                      <td>
                        <div
                          className={"progress-track " + progressClass}
                        >
                          <span
                            style={{ width: progressWidth + "%" }}
                          />
                        </div>

                        <span className="progress-label">
                          {percent}% used
                        </span>
                      </td>

                      <td className="row-actions">

                        <button
                          className="button button-small"
                          onClick={() => openForm(budget)}
                        >
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

      <p className="page-note">
        Budgets are saved on the server. Remittances are saved in your browser.
      </p>

      {/* Add and edit budget popup */}
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

            <h2>
              {editingId ? "Edit budget" : "Add monthly budget"}
            </h2>

            <button
              className="dialog-close"
              type="button"
              onClick={() => dialogRef.current.close()}
            >
              X
            </button>

          </div>

          <label htmlFor="budget-month">Month</label>

          <input
            id="budget-month"
            name="month"
            type="month"
            required
          />

          {(fieldErrors.month || fieldErrors.year) && (
            <p className="notice" role="alert">
              
              {fieldErrors.month || fieldErrors.year}
            </p>
          )}


          <label htmlFor="budget-amount">
            Budget amount (CAD)
          </label>

          <div className="amount-input">

            <span>$</span>

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

          <p className="dialog-help">
            Your remittance spending will be calculated automatically.
          </p>

          {dialogError && (
            <p className="notice">{dialogError}</p>
          )}

          <div className="dialog-actions">

            <button
              className="button"
              type="button"
              onClick={() => dialogRef.current.close()}
            >
              Cancel
            </button>

            <button
              className="button button-primary"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save budget"}
            </button>

          </div>

        </form>

      </dialog>

    </main>
  );
}
