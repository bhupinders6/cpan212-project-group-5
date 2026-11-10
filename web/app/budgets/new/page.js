'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewBudgetPage() {
  const router = useRouter();

  const [userId, setUserId] = useState('user-1');
  const [currency, setCurrency] = useState('CAD');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('2026');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setLoading(true);

    const budget = {
      userId: userId,
      currency: currency,
      monthlyLimit: Number(monthlyLimit),
      month: month,
      year: Number(year)
    };

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(budget)
      });

      if (response.ok) {
        router.push('/budgets');
        router.refresh();
      } else {
        const result = await response.json();
        setError(result.message || 'Something went wrong.');
        setLoading(false);
      }

    } catch (error) {
      setError('Unable to connect to the server.');
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Create New Budget</h2>

      <p>
        <Link href="/budgets">Back to Budgets List</Link>
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>

        <div>
          <label>User ID:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Currency:</label>
          <input
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Monthly Limit:</label>
          <input
            type="number"
            value={monthlyLimit}
            onChange={(e) => setMonthlyLimit(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Month:</label>
          <input
            type="text"
            placeholder="e.g. November"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Year:</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Create Budget'}
        </button>

      </form>
    </div>
  );
}