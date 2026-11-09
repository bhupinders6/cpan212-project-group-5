import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="page-shell">
      <div className="empty-state" role="status">
        <h3>Remittance not found</h3>
        <p>The ID you are looking for does not exist in our system.</p>
        <Link href="/remittances" className="button button-primary" style={{ marginTop: '1rem' }}>
          Go back to Remittances
        </Link>
      </div>
    </main>
  );
}