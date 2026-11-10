'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditBudgetPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [userId, setUserId] = useState('');
  const [currency, setCurrency] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // to get the budget details
  useEffect(() => {
    if (!id) return;

    fetch(`/api/budgets/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setUserId(data.userId || '');
        setCurrency(data.currency || 'CAD');
        setMonthlyLimit(data.monthlyLimit ?? '');
        setMonth(data.month || '');
        setYear(data.year || '');
      })
      .catch(() => {
        setError('Could not load budget data');
      });
  }, [id]);

  // to save the changes
  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError('');

    const budget = {
      userId: userId,
      currency: currency,
      monthlyLimit: Number(monthlyLimit),
      month: month,
      year: Number(year)
    };

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(budget)
      });

      if (response.ok) {
        router.push('/budgets');
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.message || 'Update failed');
        setLoading(false);
      }

    } catch (error) {
      setError('Could not connect to the server');
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Edit Budget</h2>

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
          {loading ? 'Updating...' : 'Update Budget'}
        </button>

      </form>
    </div>
  );
}