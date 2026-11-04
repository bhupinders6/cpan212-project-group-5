import Link from 'next/link';

export const metadata = {
  title: 'Budgets',
};

export default async function BudgetsListPage() {
  let budgets = [];
  let fetchError = false;

  try {
    const res = await fetch('http://localhost:4000/api/budgets', {
      cache: 'no-store',
    });
    if (res.ok) {
      budgets = await res.json();
    } else {
      fetchError = true;
    }
  } catch (err) {
    fetchError = true;
  }

  return (
    <div>
      <h2>Budgets List</h2>
      
      <p>
        <Link href="/budgets/new">Create New Budget</Link>
      </p>

      {fetchError ? (
        <p className="error-text">Could not load budgets from the server.</p>
      ) : budgets.length === 0 ? (
        <p>No budgets found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Month</th>
              <th>Year</th>
              <th>Limit</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((item) => (
              <tr key={item.id}>
                <td>{item.userId}</td>
                <td>{item.month}</td>
                <td>{item.year}</td>
                <td>{item.monthlyLimit} {item.currency}</td>
                <td>
                  <Link href={`/budgets/${item.id}`}>View</Link> |{' '}
                  <Link href={`/budgets/${item.id}/edit`}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}