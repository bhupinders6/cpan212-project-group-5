import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Remittance Tracker</h1>
      <p>
        <Link href="/budgets">Go to Budgets Dashboard</Link>
      </p>
    </div>
  );
}