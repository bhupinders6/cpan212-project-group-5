import Link from 'next/link';

// This is a Server Component. It fetches data directly from our Express API.
async function getRemittances() {
  // We use the environment variable 
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  try {
    const res = await fetch(`${apiUrl}/api/remittances`, {
      cache: 'no-store', // Ensure we get fresh data, not stale cache
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch remittances');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching remittances:', error);
    return [];
  }
}

export default async function RemittancesPage() {
  const remittances = await getRemittances();

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

      {remittances.length === 0 ? (
        <div className="empty-state" role="status">
          <h3>No remittances found</h3>
          <p>Add your first remittance to get started.</p>
        </div>
      ) : (
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
              {remittances.map((remittance) => (
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
      )}
    </main>
  );
}