"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export default function RemittancesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [remittances, setRemittances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Read URL params or use defaults
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "date-desc";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 5;

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/remittances", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setRemittances(data);
      } catch (err) {
        setError("Could not load remittances.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // 1. Filter
  const filtered = remittances.filter((r) =>
    r.recipient.toLowerCase().includes(search.toLowerCase()) ||
    r.purpose.toLowerCase().includes(search.toLowerCase())
  );

  // 2. Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "date-desc") return new Date(b.date) - new Date(a.date);
    if (sort === "date-asc") return new Date(a.date) - new Date(b.date);
    if (sort === "amount-desc") return b.amount - a.amount;
    if (sort === "amount-asc") return a.amount - b.amount;
    return 0;
  });

  // 3. Paginate
  const totalPages = Math.ceil(sorted.length / limit) || 1;
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const paginated = sorted.slice((currentPage - 1) * limit, currentPage * limit);

  // Update URL when controls change
  function updateParams(key, value) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") params.set("page", "1"); // Reset to page 1 on filter/sort change
    router.push(`/remittances?${params.toString()}`);
  }

  if (isLoading) return <main className="page-shell"><p>Loading remittances...</p></main>;
  if (error) return <main className="page-shell"><p className="notice">{error}</p></main>;

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">REMITTANCE TRACKER</p>
          <h1>Remittances</h1>
          <p className="subtitle">View and manage all your money transfers.</p>
        </div>
        <Link href="/remittances/new" className="button button-primary">
          + Add Remittance
        </Link>
      </header>

      {/* Filter & Sort Controls */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search recipient or purpose..."
          value={search}
          onChange={(e) => updateParams("search", e.target.value)}
          className="input-field"
          style={{ flex: 1, minWidth: "200px", padding: "0.5rem" }}
        />
        <select
          value={sort}
          onChange={(e) => updateParams("sort", e.target.value)}
          className="input-field"
          style={{ padding: "0.5rem" }}
        >
          <option value="date-desc">Date (Newest)</option>
          <option value="date-asc">Date (Oldest)</option>
          <option value="amount-desc">Amount (High to Low)</option>
          <option value="amount-asc">Amount (Low to High)</option>
        </select>
      </div>

      {paginated.length === 0 ? (
        <div className="empty-state" role="status">
          <h3>No remittances found</h3>
          <p>Try adjusting your search or add a new remittance.</p>
        </div>
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Recipient</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Rate</th>
                  <th scope="col">Date</th>
                  <th scope="col">Purpose</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((remittance) => (
                  <tr key={remittance.id}>
                    <th scope="row">{remittance.recipient}</th>
                    <td>${remittance.amount.toFixed(2)}</td>
                    <td>{remittance.rate}</td>
                    <td>{remittance.date}</td>
                    <td>{remittance.purpose}</td>
                    <td className="row-actions">
                      <Link href={`/remittances/${remittance.id}`} className="button button-small">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
            <button
              className="button"
              disabled={currentPage === 1}
              onClick={() => updateParams("page", String(currentPage - 1))}
            >
              Previous
            </button>
            <span style={{ display: "flex", alignItems: "center", padding: "0 1rem" }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="button"
              disabled={currentPage === totalPages}
              onClick={() => updateParams("page", String(currentPage + 1))}
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}