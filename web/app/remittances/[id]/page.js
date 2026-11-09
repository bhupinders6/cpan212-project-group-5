import Link from 'next/link';
import { notFound } from 'next/navigation';

// This is a Server Component. It fetches a single remittance by ID.
async function getRemittance(id) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  try {
    const res = await fetch(`${apiUrl}/api/remittances/${id}`, {
      cache: 'no-store',
    });
    
    // If the API returns 404, we trigger Next.js's built-in notFound()
    if (res.status === 404) {
      notFound();
    }
    
    if (!res.ok) {
      throw new Error('Failed to fetch remittance');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching remittance:', error);
    notFound(); // Fallback to not found on any error
  }
}

export default async function RemittanceDetailPage({ params }) {
  // In Next.js 15+, params is a Promise, so we await it
  const { id } = await params;
  const remittance = await getRemittance(id);

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">REMITTANCE TRACKER</p>
          <h1>Remittance Details</h1>
        </div>
        <Link href="/remittances" className="button">
          ← Back to List
        </Link>
      </header>

      <section className="detail-card">
        <div className="detail-row">
          <span className="detail-label">Recipient:</span>
          <span className="detail-value">{remittance.recipient}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Amount:</span>
          <span className="detail-value">${remittance.amount.toFixed(2)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Exchange Rate:</span>
          <span className="detail-value">{remittance.rate}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Date:</span>
          <span className="detail-value">{remittance.date}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Purpose:</span>
          <span className="detail-value">{remittance.purpose}</span>
        </div>
      </section>
    </main>
  );
}