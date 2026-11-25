"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateRemittancePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    
    const amountVal = formData.get("amount");
    const rateVal = formData.get("rate");

    const data = {
      recipient: formData.get("recipient"),
      amount: amountVal === "" ? 0 : Number(amountVal),
      rate: rateVal === "" ? 0 : Number(rateVal),
      date: formData.get("date"),
      purpose: formData.get("purpose"),
    };

    try {
      const res = await fetch("/api/remittances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 400) {
        const errorData = await res.json();
        // map API validation errors to fields
        if (Array.isArray(errorData.details)) {
          const formattedErrors = {};
          errorData.details.forEach((err) => {
            if (!formattedErrors[err.field]) {
              formattedErrors[err.field] = [];
            }
            formattedErrors[err.field].push(err.message);
          });
          setFieldErrors(formattedErrors);
        } else {
          setError(errorData.error || "Invalid input");
        }
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to create remittance: ${res.status}`);
      }

      router.push("/remittances");
      router.refresh(); 
    } catch (err) {
      console.error("Fetch error:", err);
      setError("An unexpected error occurred. Please check that the API is running.");
      setIsLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">REMITTANCE TRACKER</p>
          <h1>Add New Remittance</h1>
        </div>
        <Link href="/remittances" className="button">
          ← Cancel
        </Link>
      </header>

      {error && (
        <div className="notice" role="alert" style={{ color: "red", marginBottom: "1rem", fontWeight: "bold" }}>
          {error}
        </div>
      )}

      {/* ADDED noValidate: Lets the API handle validation so we can show the red error text */}
      <form onSubmit={handleSubmit} noValidate className="detail-card" style={{ maxWidth: "500px" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="recipient" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Recipient Name</label>
          <input type="text" id="recipient" name="recipient" className="input-field" style={{ width: "100%", padding: "0.5rem", border: fieldErrors.recipient ? "2px solid red" : "1px solid #ccc", borderRadius: "4px" }} />
          {fieldErrors.recipient && <span style={{ color: "red", fontSize: "0.875rem" }}>{fieldErrors.recipient[0]}</span>}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="amount" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Amount (CAD)</label>
          <input type="number" id="amount" name="amount" step="0.01" className="input-field" style={{ width: "100%", padding: "0.5rem", border: fieldErrors.amount ? "2px solid red" : "1px solid #ccc", borderRadius: "4px" }} />
          {fieldErrors.amount && <span style={{ color: "red", fontSize: "0.875rem" }}>{fieldErrors.amount[0]}</span>}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="rate" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Exchange Rate</label>
          <input type="number" id="rate" name="rate" step="0.001" className="input-field" style={{ width: "100%", padding: "0.5rem", border: fieldErrors.rate ? "2px solid red" : "1px solid #ccc", borderRadius: "4px" }} />
          {fieldErrors.rate && <span style={{ color: "red", fontSize: "0.875rem" }}>{fieldErrors.rate[0]}</span>}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="date" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Date</label>
          <input type="date" id="date" name="date" className="input-field" style={{ width: "100%", padding: "0.5rem", border: fieldErrors.date ? "2px solid red" : "1px solid #ccc", borderRadius: "4px" }} />
          {fieldErrors.date && <span style={{ color: "red", fontSize: "0.875rem" }}>{fieldErrors.date[0]}</span>}
8
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="purpose" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Purpose</label>
          <input type="text" id="purpose" name="purpose" className="input-field" style={{ width: "100%", padding: "0.5rem", border: fieldErrors.purpose ? "2px solid red" : "1px solid #ccc", borderRadius: "4px" }} />
          {fieldErrors.purpose && <span style={{ color: "red", fontSize: "0.875rem" }}>{fieldErrors.purpose[0]}</span>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="button button-primary"
          style={{ width: "100%", opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "not-allowed" : "pointer" }}
        >
          {isLoading ? "Saving..." : "Save Remittance"}
        </button>
      </form>
    </main>
  );
}